import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { validateMobile, validateName } from '../utils/validation';
import './Login.css';
import cuteMotherImg from '../assets/cute-mother.jpg';

const Login = () => {
    const navigate = useNavigate();
    const { loginWithPassword, sendOTP, login, signup, isAuthenticated, user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language].login;

    // UI State
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Form State
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [userType, setUserType] = useState('patient'); // 'patient' or 'asha'

    // Signup State
    const [signupData, setSignupData] = useState({
        name: '',
        mobile: '',
        password: '',
        userType: 'patient'
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            const role = user.userType || user.role;
            navigate(role === 'asha' ? '/asha-dashboard' : '/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!mobile) return setError(t.errors.invalidMobile);

        setLoading(true);
        try {
            if (loginMethod === 'password') {
                if (!password) {
                    setLoading(false);
                    return setError(t.errors.invalidPassword);
                }
                const result = await loginWithPassword(mobile, password);
                if (!result.success) setError(result.error);
            } else {
                // OTP Login
                if (!otpSent) {
                    const result = await sendOTP(mobile);
                    if (result.success) {
                        setOtpSent(true);
                        setError('');
                    } else {
                        setError(result.error);
                    }
                } else {
                    if (!otp) {
                        setLoading(false);
                        return setError(t.errors.invalidOtp);
                    }
                    const result = await login(mobile, otp);
                    if (!result.success) setError(result.error);
                }
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateName(signupData.name)) return setError(t.errors.invalidName);
        if (!validateMobile(signupData.mobile)) return setError(t.errors.invalidMobile);
        if (signupData.password.length < 6) return setError(t.errors.shortPassword);

        setLoading(true);
        try {
            const result = await signup({ ...signupData, userType });
            if (!result.success) setError(result.error);
        } catch (err) {
            setError(t.errors.regFailed);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setOtpSent(false);
    };

    return (
        <div className="login-page">
            <div id="recaptcha-container"></div>
            <div className="login-card-container">
                <div className="login-card">
                    {/* Left Side: Form */}
                    <div className="login-form-pane">
                        <div className="form-inner-content">
                            <h2 className="welcome-heading">{isLoginMode ? t.welcomeBack : t.joinMatriCare}</h2>
                            <p className="welcome-sublabel">{isLoginMode ? "Nice to see you naturally" : t.signupDesc}</p>

                            <div className="role-tabs">
                                <button
                                    className={`role-tab ${userType === 'patient' ? 'active' : ''}`}
                                    onClick={() => setUserType('patient')}
                                >
                                    {t.rolePatient || 'Patient (Mother)'}
                                </button>
                                <button
                                    className={`role-tab ${userType === 'asha' ? 'active' : ''}`}
                                    onClick={() => setUserType('asha')}
                                >
                                    {t.roleAsha || 'ASHA Worker'}
                                </button>
                            </div>

                            {isLoginMode && (
                                <div className="method-tabs">
                                    <button
                                        className={`method-tab ${loginMethod === 'password' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('password'); setOtpSent(false); }}
                                    >
                                        {t.password}
                                    </button>
                                    <button
                                        className={`method-tab ${loginMethod === 'otp' ? 'active' : ''}`}
                                        onClick={() => setLoginMethod('otp')}
                                    >
                                        {t.mobileOtp || 'Via OTP'}
                                    </button>
                                </div>
                            )}

                            {error && <div className="login-error-msg">{error}</div>}

                            <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignupSubmit}>
                                {!isLoginMode && (
                                    <div className="input-field-group">
                                        <label>{t.fullName}</label>
                                        <input
                                            type="text"
                                            placeholder={t.namePlaceholder}
                                            value={signupData.name}
                                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="input-field-group">
                                    <label>{t.mobileLabel}</label>
                                    <input
                                        type="tel"
                                        placeholder={t.mobilePlaceholder}
                                        value={isLoginMode ? mobile : signupData.mobile}
                                        onChange={(e) => isLoginMode ? setMobile(e.target.value) : setSignupData({ ...signupData, mobile: e.target.value })}
                                        required
                                        maxLength="10"
                                    />
                                </div>

                                {isLoginMode ? (
                                    loginMethod === 'password' ? (
                                        <div className="input-field-group">
                                            <label>{t.passwordLabel}</label>
                                            <input
                                                type="password"
                                                placeholder={t.passwordPlaceholder}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    ) : (
                                        otpSent && (
                                            <div className="input-field-group">
                                                <label>{t.enterOtp}</label>
                                                <input
                                                    type="text"
                                                    placeholder={t.otpPlaceholder}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    required
                                                    maxLength="6"
                                                />
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="input-field-group">
                                        <label>{t.createPassword}</label>
                                        <input
                                            type="password"
                                            placeholder={t.createPassPlaceholder}
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                <button type="submit" className="login-submit-button" disabled={loading}>
                                    {loading ? t.processing : (isLoginMode ? (loginMethod === 'otp' && !otpSent ? t.sendOtp : t.loginBtn) : t.createAccount)}
                                </button>
                            </form>

                            <p className="toggle-mode-text">
                                {isLoginMode ? t.firstTime : t.alreadyHave}{' '}
                                <span onClick={toggleMode} className="toggle-action-link">
                                    {isLoginMode ? t.createAccount : t.loginBtn}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Welcome Side */}
                    <div className="login-welcome-pane">
                        <div className="welcome-content-wrapper">
                            <div className="welcome-avatar-circle">
                                <img src={cuteMotherImg} alt="Mother" className="welcome-avatar-img" />
                            </div>
                            <h2 className="hello-mom-text">{t.helloMom || "Hello Mom!"}</h2>
                            <p className="welcome-description-text">{t.loginDesc}</p>

                            <div className="feature-badges">
                                <div className="feature-badge">{t.badgeTracker}</div>
                                <div className="feature-badge">{t.badgeAI}</div>
                                <div className="feature-badge">{t.badgeYoga}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

