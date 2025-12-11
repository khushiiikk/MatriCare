import React, { createContext, useState, useContext, useEffect } from 'react';

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

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('matricare_user');
        const authStatus = localStorage.getItem('matricare_auth_status');

        if (storedUser && authStatus === 'true') {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('matricare_user');
                localStorage.removeItem('matricare_auth_status');
            }
        }
        setLoading(false);
    }, []);

    // Sign up new user
    const signup = (userData) => {
        try {
            const newUser = {
                ...userData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                profilePicture: null, // Initial profile picture is null
                settings: {
                    theme: 'light',
                    notifications: true
                }
            };

            // Save to local storage
            localStorage.setItem('matricare_user', JSON.stringify(newUser));
            localStorage.setItem('matricare_auth_status', 'true');

            setUser(newUser);
            setIsAuthenticated(true);

            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, error: 'Failed to create account' };
        }
    };

    // Login existing user with OTP
    const login = (mobile, otp) => {
        const storedUser = localStorage.getItem('matricare_user');

        if (!storedUser) {
            return { success: false, error: 'Account not found. Please sign up.' };
        }

        try {
            const userData = JSON.parse(storedUser);

            if (userData.mobile !== mobile) {
                return { success: false, error: 'Mobile number does not match records.' };
            }

            // In production, verify OTP with backend
            // For demo, accept '123456' or any 6-digit OTP provided in validation
            if (!/^\d{6}$/.test(otp)) {
                return { success: false, error: 'Invalid OTP format.' };
            }

            localStorage.setItem('matricare_auth_status', 'true');
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    // Login with Password
    const loginWithPassword = (mobile, password) => {
        const storedUser = localStorage.getItem('matricare_user');

        if (!storedUser) {
            return { success: false, error: 'Account not found. Please sign up.' };
        }

        try {
            const userData = JSON.parse(storedUser);

            if (userData.mobile !== mobile) {
                return { success: false, error: 'Mobile number does not match records.' };
            }

            // Verify password
            // In a real app, you would hash this. For demo, plain text comparison.
            if (!userData.password || userData.password !== password) {
                return { success: false, error: 'Invalid password.' };
            }

            localStorage.setItem('matricare_auth_status', 'true');
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('matricare_auth_status');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Update user profile
    const updateProfile = (updates) => {
        if (!user) return { success: false };

        const updatedUser = { ...user, ...updates };
        localStorage.setItem('matricare_user', JSON.stringify(updatedUser));
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

    // Send OTP (simulated)
    const sendOTP = (mobile) => {
        // In production, call backend API
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.group('📱 OTP Service');
        console.log(`Sending OTP to ${mobile}: ${otp}`);
        console.groupEnd();

        return { success: true, message: 'OTP sent! Check console.' };
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
