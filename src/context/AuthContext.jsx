import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged } from 'firebase/auth';

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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // User is signed in via Firebase
                // Check if we have additional profile data in localStorage
                const storedUser = localStorage.getItem('matricare_user');
                let profileData = {};
                if (storedUser) {
                    try {
                        profileData = JSON.parse(storedUser);
                    } catch (e) {
                        console.error("Error parsing profile data", e);
                    }
                }

                setUser({ ...currentUser, ...profileData, mobile: currentUser.phoneNumber });
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
    const login = async (mobile, otp) => { // Mobile param ignored as confirmationResult has the context
        if (!confirmationResult) {
            return { success: false, error: 'No OTP session found. Please request OTP again.' };
        }

        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            // Check if user exists in our local "db" (localStorage) to restore profile
            // In a real app, you'd fetch profile from Firestore based on UID
            const storedUser = localStorage.getItem('matricare_user');

            // If new user (or just verified phone), ensure we save basic info
            if (!storedUser) {
                const newUser = {
                    uid: user.uid,
                    mobile: user.phoneNumber,
                    createdAt: new Date().toISOString(),
                    settings: { theme: 'light', notifications: true }
                };
                localStorage.setItem('matricare_user', JSON.stringify(newUser));
                setUser(newUser);
            } else {
                const existingUser = JSON.parse(storedUser);
                setUser({ ...existingUser, ...user });
            }

            return { success: true, user: user };
        } catch (error) {
            console.error("Error verifying OTP:", error);
            return { success: false, error: 'Invalid OTP. Please try again.' };
        }
    };

    // Sign up new user (Update profile after verification)
    const signup = (userData) => {
        // Since Firebase handles the "creation" via Phone Auth, 
        // this function now primarily saves the EXTRA profile details to our local storage "DB"
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, error: 'Must verify mobile number first.' };
            }

            const newUser = {
                ...userData,
                uid: currentUser.uid,
                mobile: currentUser.phoneNumber || userData.mobile,
                createdAt: new Date().toISOString(),
                profilePicture: null,
                settings: {
                    theme: 'light',
                    notifications: true
                }
            };

            // Save to local storage
            localStorage.setItem('matricare_user', JSON.stringify(newUser));
            setUser(newUser);

            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, error: 'Failed to create account profile' };
        }
    };

    // Login with Password (Legacy/Alternative - keeping mock for now or could be Firebase Email/Pass)
    const loginWithPassword = (mobile, password) => {
        // NOTE: Firebase Phone Auth doesn't support password directly in the same way.
        // We will keep the Mock implementation for Password for now, 
        // or we could disable it if we only want Real OTP.
        // For simplicity, let's keep the mock for this specific method 
        // OR warn the user that Password login is not connected to Firebase in this demo.

        const storedUser = localStorage.getItem('matricare_user');

        if (!storedUser) {
            return { success: false, error: 'Account not found.' };
        }

        const userData = JSON.parse(storedUser);
        if (userData.password && userData.password === password) {
            setUser(userData); // Simulated login
            setIsAuthenticated(true);
            return { success: true, user: userData };
        }

        return { success: false, error: 'Invalid credentials' };
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('matricare_auth_status'); // clear legacy flag
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Update user profile
    const updateProfile = (updates) => {
        if (!user) return { success: false };

        const updatedUser = { ...user, ...updates };
        localStorage.setItem('matricare_user', JSON.stringify(updatedUser)); // Update local DB
        setUser(updatedUser);
        return { success: true };
    };

    // Update profile picture
    const updateProfilePicture = (base64Image) => {
        if (!user) return { success: false };

        const updatedUser = { ...user, profilePicture: base64Image };
        localStorage.setItem('matricare_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
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
