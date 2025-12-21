import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Monitor Firebase Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is signed in via Firebase
                let profileData = {};

                try {
                    // Try fetching from Firestore first
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        profileData = userDoc.data();
                    } else {
                        // Fallback/Legacy: Check localStorage if not found in Firestore
                        const storedUser = localStorage.getItem('matricare_user');
                        if (storedUser) {
                            profileData = JSON.parse(storedUser);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }

                setUser({ ...currentUser, ...profileData, mobile: currentUser.phoneNumber || profileData.mobile });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Setup ReCaptcha (Required for Phone Auth)
    const setupRecaptcha = (elementId) => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    console.log("Recaptcha verified");
                }
            });
        }
    };

    // Send OTP (Real Firebase)
    const sendOTP = async (mobileNumber) => {
        try {
            // Ensure format is +91XXXXXXXXXX
            const formattedNumber = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;

            if (!window.recaptchaVerifier) {
                // Determine the button or container ID from the calling component, default to 'sign-in-button'
                setupRecaptcha('recaptcha-container');
            }

            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            return { success: true, message: 'OTP sent successfully!' };
        } catch (error) {
            console.error("Error sending OTP:", error);
            // Reset recaptcha if error occurs so user can try again
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            return { success: false, error: error.message };
        }
    };

    // Verify OTP (Login/Signup final step)
    const login = async (mobile, otp) => {
        if (!confirmationResult) {
            return { success: false, error: 'No OTP session found. Please request OTP again.' };
        }

        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            // Fetch profile from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            let userData = {};
            if (userDoc.exists()) {
                userData = userDoc.data();
            } else {
                // New user via OTP, create barebones doc if needed, or wait for signup flow
                userData = {
                    uid: user.uid,
                    mobile: user.phoneNumber,
                    createdAt: new Date().toISOString()
                }
                await setDoc(doc(db, "users", user.uid), userData, { merge: true });
            }

            setUser({ ...user, ...userData });
            return { success: true, user: user };
        } catch (error) {
            console.error("Error verifying OTP:", error);
            return { success: false, error: 'Invalid OTP. Please try again.' };
        }
    };

    // Sign up new user
    const signup = async (userData) => {
        try {
            // For now, we assume user is already authenticated via OTP or we are creating a fresh record.
            // If strictly using Phone Auth, 'auth.currentUser' should be present.
            // IF using fallback (password/mock), we create a mock UID.

            const currentUser = auth.currentUser;
            const uid = currentUser ? currentUser.uid : `user_${userData.mobile}`;
            const mobile = currentUser ? (currentUser.phoneNumber || userData.mobile) : userData.mobile;

            const newUser = {
                ...userData,
                uid: uid,
                mobile: mobile,
                createdAt: new Date().toISOString(),
                profilePicture: null,
                settings: {
                    notifications: true
                }
            };

            // SAVE TO FIRESTORE
            await setDoc(doc(db, "users", uid), newUser);

            // Also keep local storage as backup/cache
            localStorage.setItem('matricare_user', JSON.stringify(newUser));

            setUser(newUser);
            setIsAuthenticated(true);

            return { success: true, user: newUser };
        } catch (error) {
            console.error("Signup/Firestore Save Error:", error);
            return { success: false, error: 'Failed to save account details. ' + error.message };
        }
    };

    // Login with Password (Legacy/Alternative)
    const loginWithPassword = async (mobile, password) => {
        // Query Firestore for user with this mobile number
        // Note: For real security, don't store plain text passwords. This is a demo fallback.
        try {
            // Since we can't easily query by mobile without index, we try to simulate or check local/mock logic
            // OR, better, we assume the UID logic was consistent or check a special 'credentials' collection.
            // For this DEMO, we will stick to LocalStorage for Password-based Patient login fallback if Firestore fails,
            // OR we can query Firestore if we knew the ID.

            // ACTUAL MOCK IMPLEMENTATION (matches previous behavior but attempts Firestore read if ID known):

            const storedUser = localStorage.getItem('matricare_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.mobile === mobile && userData.password === password) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    return { success: true, user: userData };
                }
            }

            // If you want to enable "ASHA Login" via Password (common for workers), we might need a dedicated collection query.
            // But typically they would use Phone Auth too.
            // Adding a simple error for now.
            return { success: false, error: 'Invalid credentials (Password login only works for locally saved users in this demo. Please use OTP)' };

        } catch (e) {
            return { success: false, error: e.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('matricare_user');
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Update user profile
    const updateProfile = async (updates) => {
        if (!user || !user.uid) return { success: false };

        try {
            const updatedUser = { ...user, ...updates };
            // Update Firestore
            await setDoc(doc(db, "users", user.uid), updates, { merge: true });

            // Update State
            setUser(updatedUser);
            localStorage.setItem('matricare_user', JSON.stringify(updatedUser)); // Keep sync
            return { success: true };
        } catch (e) {
            console.error("Update profile failed:", e);
            return { success: false, error: e.message };
        }
    };

    // Update profile picture
    const updateProfilePicture = async (base64Image) => {
        return updateProfile({ profilePicture: base64Image });
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        signup,
        login,
        loginWithPassword,
        logout,
        updateProfile,
        updateProfilePicture,
        sendOTP,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
