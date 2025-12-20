import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { validateMobile, validateName, validateAge, validateOTP } from '../utils/validation';
import { formatDateForInput } from '../utils/dateUtils';
import Robot from '../components/Robot';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithPassword, signup, sendOTP, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const t = translations[language].login;

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
        dob: '',
        state: '',
        district: '',
        village: '',
        lmpDate: '',
        password: ''
    });

    // Robot Animation State
    const [robotMood, setRobotMood] = useState('happy'); // happy, thinking, success

    // Signup Step State
    const [signupStep, setSignupStep] = useState('details'); // 'details' or 'otp'
    const [signupOtp, setSignupOtp] = useState('');

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
            setError(t.errors.invalidMobile);
            setRobotMood('thinking');
            return;
        }

        setLoading(true);
        try {
            const result = await sendOTP(loginMobile);
            setLoading(false);

            if (result.success) {
                setShowOtpInput(true);
                setSuccessMsg(t.errors.otpSent);
                setRobotMood('success');
            } else {
                setError(result.error);
                setRobotMood('thinking');
            }
        } catch (err) {
            setLoading(false);
            setError('Failed to send OTP');
            setRobotMood('thinking');
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try {
            let result;
            if (loginMethod === 'otp') {
                if (!validateOTP(otp)) {
                    setError(t.errors.invalidOtp);
                    setLoading(false);
                    return;
                }
                result = await login(loginMobile, otp);
            } else {
                if (!password) {
                    setError(t.errors.invalidPassword);
                    setLoading(false);
                    return;
                }
                // loginWithPassword is currently sync, but awaiting it is safe/future-proof
                result = await loginWithPassword(loginMobile, password);
            }

            setLoading(false);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
                setRobotMood('thinking');
            }
        } catch (err) {
            setLoading(false);
            console.error(err);
            setError('Login failed. Please try again.');
            setRobotMood('thinking');
        }
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

        // Validation for the 'details' step
        if (signupStep === 'details') {
            if (!validateName(signupData.name)) return setError(t.errors.invalidName);
            if (!validateMobile(signupData.mobile)) return setError(t.errors.invalidMobile);
            if (!signupData.dob) return setError('Please enter your date of birth');
            if (!signupData.state) return setError('Please enter your state');
            if (!signupData.district) return setError('Please enter your district');
            if (!signupData.village) return setError('Please select your village');
            if (!signupData.lmpDate) return setError(t.errors.invalidLMP);
            if (signupData.password.length < 6) return setError(t.errors.shortPassword);

            setLoading(true);
            try {
                const result = await sendOTP(signupData.mobile);
                setLoading(false);
                if (result.success) {
                    setSignupStep('otp');
                    setSuccessMsg(t.errors.otpSent);
                    setRobotMood('success');
                } else {
                    setError(result.error);
                    setRobotMood('thinking');
                }
            } catch (err) {
                setLoading(false);
                setError('Failed to send OTP');
                setRobotMood('thinking');
            }
        } else {
            // Processing OTP step
            if (!validateOTP(signupOtp)) return setError(t.errors.invalidOtp);

            setLoading(true);
            try {
                const loginResult = await login(signupData.mobile, signupOtp);
                if (loginResult.success) {
                    // Phone verified, now save profile
                    const result = await signup(signupData);
                    setLoading(false);

                    if (result.success) {
                        setSuccessMsg('Account created successfully!');
                        setRobotMood('success');
                    } else {
                        setError(result.error || t.errors.regFailed);
                        setRobotMood('thinking');
                    }
                } else {
                    setLoading(false);
                    setError(loginResult.error);
                    setRobotMood('thinking');
                }
            } catch (err) {
                setLoading(false);
                setError('Signup failed. Please try again.');
                setRobotMood('thinking');
            }
        }
    };


    // Toggle Mode
    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setSuccessMsg('');
        setShowOtpInput(false);
        setSignupStep('details');
        setOtp('');
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
                            {isLoginMode ? t.welcomeBack : t.joinMatriCare}
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
                                        {t.mobileOtp}
                                    </button>
                                    <button
                                        className={`method-btn ${loginMethod === 'password' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('password'); setError(''); }}
                                    >
                                        {t.password}
                                    </button>
                                </div>

                                <form onSubmit={loginMethod === 'otp' && !showOtpInput ? handleSendOTP : handleLoginSubmit} className="login-form">
                                    <div className="form-group">
                                        <label>{t.mobileLabel}</label>
                                        <input
                                            type="tel"
                                            placeholder={t.mobilePlaceholder}
                                            value={loginMobile}
                                            onChange={(e) => setLoginMobile(e.target.value)}
                                            maxLength="10"
                                            className="form-input"
                                            disabled={showOtpInput && loginMethod === 'otp'}
                                        />
                                    </div>

                                    {loginMethod === 'otp' && showOtpInput && (
                                        <div className="form-group animate-slide-down">
                                            <label>{t.enterOtp}</label>
                                            <input
                                                type="text"
                                                placeholder={t.otpPlaceholder}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength="6"
                                                className="form-input"
                                                autoFocus
                                            />
                                            <small className="otp-hint">{t.otpHint}</small>
                                        </div>
                                    )}

                                    {loginMethod === 'password' && (
                                        <div className="form-group animate-slide-down">
                                            <label>{t.passwordLabel}</label>
                                            <input
                                                type="password"
                                                placeholder={t.passwordPlaceholder}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                    )}

                                    <button type="submit" className="sign-in-btn" disabled={loading}>
                                        {loading ? t.processing : (
                                            loginMethod === 'otp' ? (showOtpInput ? t.loginSecurely : t.sendOtp) : t.loginBtn
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            // Signup Form
                            <form onSubmit={handleSignupSubmit} className="login-form">
                                {signupStep === 'details' ? (
                                    <>
                                        <div className="form-group">
                                            <label>{t.fullName}</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder={t.namePlaceholder}
                                                value={signupData.name}
                                                onChange={handleSignupChange}
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{t.mobileRaw}</label>
                                            <input
                                                type="tel"
                                                name="mobile"
                                                placeholder={t.mobileRawPlaceholder}
                                                value={signupData.mobile}
                                                onChange={handleSignupChange}
                                                maxLength="10"
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{t.dob}</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={signupData.dob}
                                                onChange={handleSignupChange}
                                                className="form-input"
                                                max={formatDateForInput(new Date())}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{t.state}</label>
                                            <input
                                                type="text"
                                                name="state"
                                                placeholder={t.state}
                                                value={signupData.state}
                                                onChange={handleSignupChange}
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{t.district}</label>
                                            <input
                                                type="text"
                                                name="district"
                                                placeholder={t.district}
                                                value={signupData.district}
                                                onChange={handleSignupChange}
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{t.village}</label>
                                            <select
                                                name="village"
                                                value={signupData.village}
                                                onChange={handleSignupChange}
                                                className="form-input"
                                            >
                                                <option value="">Select Village</option>
                                                <option value="village1">Ramnagar</option>
                                                <option value="village2">Kishanpur</option>
                                                <option value="village3">Gopalpur</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>{t.lmpDate}</label>
                                            <input
                                                type="date"
                                                name="lmpDate"
                                                value={signupData.lmpDate}
                                                onChange={handleSignupChange}
                                                className="form-input"
                                                max={formatDateForInput(new Date())}
                                            />
                                            <small className="field-hint">{t.lmpHint}</small>
                                        </div>

                                        <div className="form-group">
                                            <label>{t.createPassword}</label>
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder={t.createPassPlaceholder}
                                                value={signupData.password}
                                                onChange={handleSignupChange}
                                                className="form-input"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="form-group animate-slide-down">
                                        <label>{t.enterOtp}</label>
                                        <input
                                            type="text"
                                            placeholder={t.otpPlaceholder}
                                            value={signupOtp}
                                            onChange={(e) => setSignupOtp(e.target.value)}
                                            maxLength="6"
                                            className="form-input"
                                            autoFocus
                                        />
                                        <small className="otp-hint">{t.otpHint}</small>
                                    </div>
                                )}

                                <button type="submit" className="sign-in-btn" disabled={loading}>
                                    {loading ? t.processing : (signupStep === 'details' ? t.sendOtp : t.createAccount)}
                                </button>
                            </form>
                        )}


                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <div className="toggle-text">
                            {isLoginMode ? t.firstTime : t.alreadyHave}
                            <button onClick={toggleMode} className="toggle-btn">
                                {isLoginMode ? t.createAccount : t.loginBtn}
                            </button>
                        </div>
                        <div id="recaptcha-container"></div>
                    </div>
                </div>

                {/* Right Side - Welcome & Robot Panel */}
                <div className={`welcome-section ${isLoginMode ? 'login-bg' : 'signup-bg'}`}>
                    <div className="welcome-content">
                        {/* Character Animation */}
                        <Robot mood={robotMood} />

                        <h2 className="welcome-title">
                            {isLoginMode ? t.helloMom : t.welcomeTitle}
                        </h2>
                        <p className="welcome-text">
                            {isLoginMode
                                ? t.loginDesc
                                : t.signupDesc}
                        </p>

                        <div className="feature-badges">
                            <span className="badge">{t.badgeTracker}</span>
                            <span className="badge">{t.badgeAI}</span>
                            <span className="badge">{t.badgeYoga}</span>
                        </div>
                    </div>

                    {/* Floating Orbs */}
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>
            </div>
        </div >
    );
};

export default Login;
