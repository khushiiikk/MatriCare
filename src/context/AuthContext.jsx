import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
    const [loading, setLoading] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Helper: Find user by mobile in any collection
    const findUserByMobile = async (mobileNumber) => {
        if (!mobileNumber) return null;
        console.log("🔍 [DEBUG] Starting search for mobile:", mobileNumber);

        // Normalize: remove everything but digits and take last 10
        const digitsOnly = mobileNumber.replace(/\D/g, '');
        const normalized = digitsOnly.slice(-10);

        const stringVariants = [
            mobileNumber,
            digitsOnly,
            normalized,
            `+91${normalized}`,
            `91${normalized}`,
            `0${normalized}`
        ];

        // Add numeric variants (Firestore distinguishes between string and number)
        const numericVariants = stringVariants
            .map(v => parseInt(v, 10))
            .filter(n => !isNaN(n));

        // Final unique set of search terms
        const allVariants = Array.from(new Set([...stringVariants, ...numericVariants]));
        const fields = ["mobile", "phone", "phoneNumber", "userMobile"];
        const collections = ["patients", "asha_workers", "users"];

        try {
            // SECURITY BRIDGE: Ensure we have a session before querying
            if (!auth.currentUser) {
                console.log("🔐 [DEBUG] No session. Bootstrapping security bridge...");
                try {
                    await signInAnonymously(auth);
                } catch (anonErr) {
                    if (anonErr.code === 'auth/admin-restricted-operation') {
                        console.error("🚨 [CRITICAL] Firebase Anonymous Auth is DISABLED.");
                        throw new Error("ACCESS_DENIED_ANON_DISABLED");
                    }
                    throw anonErr;
                }
            }

            for (const collName of collections) {
                console.log(`🔍 [DEBUG] Checking collection: ${collName}`);
                for (const field of fields) {
                    try {
                        // Batch variants into chunks of 10 for Firestore 'in' query
                        const variantsToSearch = allVariants.slice(0, 10);
                        const q = query(collection(db, collName), where(field, "in", variantsToSearch));
                        const snap = await getDocs(q);
                        if (!snap.empty) {
                            const foundDoc = snap.docs[0];
                            const data = foundDoc.data();
                            console.log(`✅ [DEBUG] User Found in ${collName} via ${field}!`, { id: foundDoc.id });

                            // Determine role properly
                            let userRole = 'patient';
                            if (collName === 'asha_workers' || data.role === 'asha') userRole = 'asha';

                            return { ...data, uid: foundDoc.id, role: userRole };
                        }
                    } catch (innerErr) {
                        // Silently continue if field searching fails (e.g. index missing)
                        console.warn(`⚠️ [DEBUG] Search in ${collName}.${field} failed:`, innerErr.message);
                    }
                }
            }
            console.log("❌ [DEBUG] No user found with any variant in any collection.");
            return null;
        } catch (e) {
            if (e.message === "ACCESS_DENIED_ANON_DISABLED") return { error: 'ANON_DISABLED' };
            console.error("❌ [DEBUG] Critical error searching user by mobile:", e);
            return null;
        }
    };

    // Monitor Firebase Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("🔥 Auth State Change:", currentUser ? `User: ${currentUser.uid} (Anon: ${currentUser.isAnonymous})` : "No Session");

            if (currentUser) {
                setAuthError(null);
                // BRIDGE CHECK: Prevent anonymous sessions from overwriting real user profiles
                if (currentUser.isAnonymous) {
                    const storedUserString = localStorage.getItem('matricare_user');
                    if (storedUserString) {
                        try {
                            const storedUser = JSON.parse(storedUserString);
                            // If we have a stable mobile number or a non-anon UID, keep it!
                            if (storedUser.mobile || (storedUser.uid && !storedUser.uid.startsWith('anon_'))) {
                                console.log("🕯️ Security Bridge Active - Preserving existing profile");
                                setUser(storedUser);
                                setIsAuthenticated(true);
                                setLoading(false);
                                return;
                            }
                        } catch (e) {
                            console.error("Local user restore failed:", e);
                        }
                    }
                    console.log("👤 New Anonymous Guest Session");
                }

                // OTP User Login Flow
                let profileData = {};
                try {
                    // Try patients collection first
                    let userDoc = await getDoc(doc(db, "patients", currentUser.uid));
                    if (userDoc.exists()) {
                        profileData = { ...userDoc.data(), role: "patient" };
                    } else {
                        // Try asha_workers collection
                        userDoc = await getDoc(doc(db, "asha_workers", currentUser.uid));
                        if (userDoc.exists()) {
                            profileData = { ...userDoc.data(), role: "asha" };
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }

                const userData = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    phoneNumber: currentUser.phoneNumber,
                    ...profileData,
                    mobile: currentUser.phoneNumber || profileData.mobile
                };
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

                    // Bridge: Explicitly trigger and await the session bridge
                    console.log("🕯️ Initializing Security Bridge for persistent session...");
                    try {
                        setAuthError(null);
                        await signInAnonymously(auth);
                        // The listener will fire again with the user, so we return here
                        return;
                    } catch (e) {
                        console.error("Critical: Security Bridge Failed:", e);
                        setAuthError(e.message);
                    }
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
    const sendOTP = async (mobileNumber, isLogin = false) => {
        try {
            // SECURITY CHECK: If logging in, user must already exist
            if (isLogin) {
                const existing = await findUserByMobile(mobileNumber);
                if (existing?.error === 'ANON_DISABLED') {
                    return {
                        success: false,
                        error: '⚠️ Firebase Action Required: Please enable "Anonymous Authentication" in your Firebase Console (Build > Authentication > Sign-in method) to allow login verification.'
                    };
                }
                if (!existing) {
                    return { success: false, error: 'Mobile number not registered. Please sign up first.' };
                }
            }

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

            // Fetch profile from Firestore (check both collections)
            let userDoc = await getDoc(doc(db, "patients", user.uid));
            let userData = {};
            if (userDoc.exists()) {
                userData = { ...userDoc.data(), role: "patient" };
            } else {
                userDoc = await getDoc(doc(db, "asha_workers", user.uid));
                if (userDoc.exists()) {
                    userData = { ...userDoc.data(), role: "asha" };
                } else {
                    // New user via OTP - needs to complete signup
                    userData = {
                        uid: user.uid,
                        mobile: user.phoneNumber,
                        createdAt: new Date().toISOString()
                    }
                    // Don't create doc yet - wait for signup with role
                }
            }

            const userDataFinal = {
                uid: user.uid,
                email: user.email,
                phoneNumber: user.phoneNumber,
                ...userData
            };
            setUser(userDataFinal);
            localStorage.setItem('matricare_user', JSON.stringify(userDataFinal));
            setIsAuthenticated(true);
            return { success: true, user: userDataFinal };
        } catch (error) {
            console.error("Error verifying OTP:", error);
            return { success: false, error: 'Invalid OTP. Please try again.' };
        }
    };

    const signup = async (userData) => {
        try {
            // SECURITY BRIDGE FIRST
            if (!auth.currentUser) {
                console.log("🔐 [DEBUG] Signup: Bootstrapping security bridge...");
                await signInAnonymously(auth);
            }

            // UNIQUENESS CHECK
            const existing = await findUserByMobile(userData.mobile);
            if (existing && !existing.error) {
                return { success: false, error: 'This number is already registered. Please login instead.' };
            }

            // Use Firebase Auth UID if available to satisfy strict Firestore rules
            const uid = auth.currentUser?.uid || userData.uid || `user_${userData.mobile}_${Date.now()}`;

            const newUser = {
                ...userData,
                uid: uid,
                name: userData.fullName,
                createdAt: new Date().toISOString(),
                profilePicture: null,
                settings: {
                    notifications: true
                }
            };

            // Save to Firebase
            const collectionName = userData.role === "asha" ? "asha_workers" : "patients";
            await setDoc(doc(db, collectionName, uid), newUser);

            setUser(newUser);
            setIsAuthenticated(true);
            localStorage.setItem('matricare_user', JSON.stringify(newUser));

            return { success: true, user: newUser };
        } catch (error) {
            console.error("Signup Error:", error);
            if (error.message === "ACCESS_DENIED_ANON_DISABLED") {
                return { success: false, error: 'Firebase Action Required: Please enable "Anonymous Authentication" in your Firebase Console.' };
            }
            return { success: false, error: 'Failed to create account: ' + (error.code === 'permission-denied' ? 'Permission denied. Please check your Firebase rules.' : error.message) };
        }
    };

    // Login with Password - Production Ready
    const loginWithPassword = async (mobile, password) => {
        setLoading(true);
        try {
            // SECURITY BRIDGE FIRST
            if (!auth.currentUser) {
                console.log("🔐 [DEBUG] Password Login: Bootstrapping security bridge...");
                await signInAnonymously(auth);
            }

            // Check patients
            let q = query(collection(db, "patients"), where("mobile", "==", mobile), where("password", "==", password));
            let snap = await getDocs(q);

            if (!snap.empty) {
                const userData = { ...snap.docs[0].data(), uid: snap.docs[0].id, role: 'patient' };
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('matricare_user', JSON.stringify(userData));
                setLoading(false);
                return { success: true, user: userData };
            }

            // Check asha_workers
            q = query(collection(db, "asha_workers"), where("mobile", "==", mobile), where("password", "==", password));
            snap = await getDocs(q);
            if (!snap.empty) {
                const userData = { ...snap.docs[0].data(), uid: snap.docs[0].id, role: 'asha' };
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('matricare_user', JSON.stringify(userData));
                setLoading(false);
                return { success: true, user: userData };
            }

            setLoading(false);
            return { success: false, error: 'Invalid mobile number or password.' };
        } catch (e) {
            console.error("Login Error:", e);
            setLoading(false);
            return { success: false, error: 'Login failed. Please check your connection and try again.' };
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
            // Update Firestore in correct collection
            const collectionName = user.role === "asha" ? "asha_workers" : "patients";
            await setDoc(doc(db, collectionName, user.uid), updates, { merge: true });

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
        findUserByMobile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
