import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateMobile, validateName, validateAge, validateOTP } from '../utils/validation';
import { formatDateForInput } from '../utils/dateUtils';
import Robot from '../components/Robot';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithPassword, signup, sendOTP, isAuthenticated } = useAuth();

    // UI State
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Login Form State
    const [loginMobile, setLoginMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    // Signup Form State
    const [signupData, setSignupData] = useState({
        name: '',
        mobile: '',
        age: '',
        lmpDate: '',
        password: ''
    });

    // Robot Animation State
    const [robotMood, setRobotMood] = useState('happy'); // happy, thinking, success

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Handle Login Flow
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateMobile(loginMobile)) {
            setError('Please enter a valid 10-digit mobile number');
            setRobotMood('thinking');
            return;
        }

        setLoading(true);
        const result = sendOTP(loginMobile);
        setTimeout(() => {
            setLoading(false);
            if (result.success) {
                setShowOtpInput(true);
                setSuccessMsg('OTP sent successfully!');
                setRobotMood('success');
            } else {
                setError(result.error);
            }
        }, 1000);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            let result;
            if (loginMethod === 'otp') {
                if (!validateOTP(otp)) {
                    setError('Please enter a valid 6-digit OTP');
                    setLoading(false);
                    return;
                }
                result = login(loginMobile, otp);
            } else {
                if (!password) {
                    setError('Please enter your password');
                    setLoading(false);
                    return;
                }
                result = loginWithPassword(loginMobile, password);
            }

            setLoading(false);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
                setRobotMood('thinking');
            }
        }, 1000);
    };

    // Handle Signup Flow
    const handleSignupChange = (e) => {
        setSignupData({
            ...signupData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!validateName(signupData.name)) return setError('Please enter your full name');
        if (!validateMobile(signupData.mobile)) return setError('Please enter a valid mobile number');
        if (!validateAge(signupData.age)) return setError('Please enter a valid age (18-55)');
        if (!signupData.lmpDate) return setError('Please select your LMP date');
        if (signupData.password.length < 6) return setError('Password must be at least 6 characters');

        setLoading(true);
        setTimeout(() => {
            const result = signup(signupData);
            setLoading(false);

            if (result.success) {
                navigate('/');
            } else {
                setError('Registration failed. Please try again.');
            }
        }, 1500);
    };

    // Toggle Mode
    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setSuccessMsg('');
        setShowOtpInput(false);
        setRobotMood(isLoginMode ? 'happy' : 'success'); // Change mood on toggle
    };

    return (
        <div className="login-page">
            {/* Animated Starry Background */}
            <div className="stars"></div>
            <div className="stars2"></div>
            <div className="stars3"></div>

            <div className="login-container">
                {/* Left Side - Form Section */}
                <div className="login-form-section">
                    <div className="form-content">
                        <h1 className="login-title">
                            {isLoginMode ? 'Welcome Back' : 'Join MatriCare'}
                        </h1>

                        {error && <div className="error-message">{error}</div>}
                        {successMsg && <div className="success-message">{successMsg}</div>}

                        {isLoginMode ? (
                            // Login Form
                            <div className="login-wrapper">
                                <div className="login-methods-toggle">
                                    <button
                                        className={`method-btn ${loginMethod === 'otp' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('otp'); setError(''); }}
                                    >
                                        Mobile OTP
                                    </button>
                                    <button
                                        className={`method-btn ${loginMethod === 'password' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('password'); setError(''); }}
                                    >
                                        Password
                                    </button>
                                </div>

                                <form onSubmit={loginMethod === 'otp' && !showOtpInput ? handleSendOTP : handleLoginSubmit} className="login-form">
                                    <div className="form-group">
                                        <label>Mobile Number</label>
                                        <input
                                            type="tel"
                                            placeholder="Enter your 10-digit mobile"
                                            value={loginMobile}
                                            onChange={(e) => setLoginMobile(e.target.value)}
                                            maxLength="10"
                                            className="form-input"
                                            disabled={showOtpInput && loginMethod === 'otp'}
                                        />
                                    </div>

                                    {loginMethod === 'otp' && showOtpInput && (
                                        <div className="form-group animate-slide-down">
                                            <label>Enter OTP</label>
                                            <input
                                                type="text"
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength="6"
                                                className="form-input"
                                                autoFocus
                                            />
                                            <small className="otp-hint">Check console for demo OTP</small>
                                        </div>
                                    )}

                                    {loginMethod === 'password' && (
                                        <div className="form-group animate-slide-down">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                    )}

                                    <button type="submit" className="sign-in-btn" disabled={loading}>
                                        {loading ? 'Processing...' : (
                                            loginMethod === 'otp' ? (showOtpInput ? 'Login securely' : 'Send OTP') : 'Login'
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            // Signup Form
                            <form onSubmit={handleSignupSubmit} className="login-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Your Name"
                                        value={signupData.name}
                                        onChange={handleSignupChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Mobile</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            placeholder="Mobile Number"
                                            value={signupData.mobile}
                                            onChange={handleSignupChange}
                                            maxLength="10"
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            placeholder="Years"
                                            value={signupData.age}
                                            onChange={handleSignupChange}
                                            className="form-input"
                                            min="18"
                                            max="55"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>LMP Date (Last Period)</label>
                                    <input
                                        type="date"
                                        name="lmpDate"
                                        value={signupData.lmpDate}
                                        onChange={handleSignupChange}
                                        className="form-input"
                                        max={formatDateForInput(new Date())}
                                    />
                                    <small className="field-hint">Used to calculate pregnancy week</small>
                                </div>

                                <div className="form-group">
                                    <label>Create Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        value={signupData.password}
                                        onChange={handleSignupChange}
                                        className="form-input"
                                    />
                                </div>

                                <button type="submit" className="sign-in-btn" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Start Your Journey'}
                                </button>
                            </form>
                        )}

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <div className="toggle-text">
                            {isLoginMode ? "First time here?" : "Already have an account?"}
                            <button onClick={toggleMode} className="toggle-btn">
                                {isLoginMode ? "Create Account" : "Login"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Welcome & Robot Panel */}
                <div className={`welcome-section ${isLoginMode ? 'login-bg' : 'signup-bg'}`}>
                    <div className="welcome-content">
                        {/* Robot Character Animation */}
                        <Robot mood={robotMood} />

                        <h2 className="welcome-title">
                            {isLoginMode ? 'Hello Mom!' : 'Welcome to MatriCare'}
                        </h2>
                        <p className="welcome-text">
                            {isLoginMode
                                ? 'Your personal companion for a healthy and happy pregnancy journey.'
                                : 'Join our community of mothers. Track your health, get expert advice, and stay stress-free.'}
                        </p>

                        <div className="feature-badges">
                            <span className="badge">🤰 Pregnancy Tracker</span>
                            <span className="badge">🤖 AI Assistant</span>
                            <span className="badge">🧘‍♀️ Yoga Guide</span>
                        </div>
                    </div>

                    {/* Floating Orbs */}
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
