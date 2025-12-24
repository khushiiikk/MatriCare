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
                // User is signed in via Firebase (OTP)
                let profileData = {};

                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        profileData = userDoc.data();
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }

                const userData = { ...currentUser, ...profileData, uid: currentUser.uid, mobile: currentUser.phoneNumber || profileData.mobile };
                setUser(userData);
                localStorage.setItem('matricare_user', JSON.stringify(userData));
                setIsAuthenticated(true);
            } else {
                // No Firebase user. Check local storage for password-login session
                const storedUser = localStorage.getItem('matricare_user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
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
                // New user via OTP, create barebones doc
                userData = {
                    uid: user.uid,
                    mobile: user.phoneNumber,
                    createdAt: new Date().toISOString()
                }
                await setDoc(doc(db, "users", user.uid), userData, { merge: true });
            }

            setUser({ ...user, ...userData });
            localStorage.setItem('matricare_user', JSON.stringify({ ...user, ...userData }));
            return { success: true, user: user };
        } catch (error) {
            console.error("Error verifying OTP:", error);
            return { success: false, error: 'Invalid OTP. Please try again.' };
        }
    };

    // Sign up new user
    const signup = async (userData) => {
        try {
            const uid = userData.uid || `user_${userData.mobile}_${Date.now()}`;

            const newUser = {
                ...userData,
                uid: uid,
                createdAt: new Date().toISOString(),
                profilePicture: null,
                settings: {
                    notifications: true
                }
            };

            // SAVE TO FIRESTORE
            await setDoc(doc(db, "users", uid), newUser);

            // Set state and persist
            setUser(newUser);
            setIsAuthenticated(true);
            localStorage.setItem('matricare_user', JSON.stringify(newUser));

            return { success: true, user: newUser };
        } catch (error) {
            console.error("Signup Error:", error);
            return { success: false, error: 'Failed to create account: ' + error.message };
        }
    };

    // Login with Password (Master password '123456' allowed for testing)
    const loginWithPassword = async (mobile, password) => {
        setLoading(true);
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');

            // MASTER PASSWORD BYPASS
            if (password === '123456') {
                const q = query(collection(db, "users"), where("mobile", "==", mobile));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = { ...userDoc.data(), uid: userDoc.id };
                    setUser(userData);
                    setIsAuthenticated(true);
                    localStorage.setItem('matricare_user', JSON.stringify(userData));
                    setLoading(false);
                    return { success: true, user: userData };
                } else {
                    // Create a placeholder user if 123456 is used but user doesn't exist
                    const dummyUser = {
                        mobile: mobile,
                        role: 'patient',
                        name: 'Test User',
                        uid: `master_${mobile}`,
                        createdAt: new Date().toISOString()
                    };
                    await setDoc(doc(db, "users", dummyUser.uid), dummyUser);
                    setUser(dummyUser);
                    setIsAuthenticated(true);
                    localStorage.setItem('matricare_user', JSON.stringify(dummyUser));
                    setLoading(false);
                    return { success: true, user: dummyUser };
                }
            }

            // Normal Password Check
            const q = query(collection(db, "users"), where("mobile", "==", mobile), where("password", "==", password));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = { ...userDoc.data(), uid: userDoc.id };
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('matricare_user', JSON.stringify(userData));
                setLoading(false);
                return { success: true, user: userData };
            }

            setLoading(false);
            return { success: false, error: 'Invalid mobile number or password.' };
        } catch (e) {
            setLoading(false);
            console.error("Password Login Error:", e);
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
            const finalUser = { ...user, ...updates };
            setUser(finalUser);
            localStorage.setItem('matricare_user', JSON.stringify(finalUser)); // Keep sync
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
