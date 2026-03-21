import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Login.css';

const Login = () => {
    const { t } = useTranslation('pages');
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('patient'); // 'patient' or 'asha'
    const [method, setMethod] = useState('otp'); // 'otp' or 'password'

    // Form States
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [fullName, setFullName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [dob, setDob] = useState('');
    const [weight, setWeight] = useState('');
    const [stateName, setStateName] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [lmpDate, setLmpDate] = useState('');

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const { login, loginWithPassword, sendOTP, signup, isAuthenticated, user, loading } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    // If already authenticated, redirect to dashboard
    if (!loading && isAuthenticated && user) {
        const redirectPath = user?.role === 'asha' ? '/Adash' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);
        // Pass true as second argument to check if user exists before sending OTP
        const result = await sendOTP(mobile, true);
        setFormLoading(false);
        if (result.success) {
            setStep(2);
        } else {
            setError(result.error || 'Failed to send OTP');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);
        let result;
        if (method === 'otp') {
            result = await login(mobile, otp);
        } else {
            result = await loginWithPassword(mobile, password);
        }
        setFormLoading(false);
        if (result.success) {
            const userRole = result.user?.role || role;
            const redirectPath = userRole === 'asha' ? '/Adash' : '/dashboard';
            navigate(redirectPath, { replace: true });
        } else {
            setError(result.error || 'Login failed');
        }
    };

    const validatePassword = (pass) => {
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[^A-Za-z0-9]/.test(pass);
        const isLongEnough = pass.length >= 6;

        return {
            isValid: hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough,
            errors: {
                upper: !hasUpper,
                lower: !hasLower,
                number: !hasNumber,
                special: !hasSpecial,
                length: !isLongEnough
            }
        };
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        const validation = validatePassword(password);
        if (!validation.isValid) {
            let errorMsg = 'Password must contain: ';
            const missing = [];
            if (validation.errors.upper) missing.push('one uppercase letter');
            if (validation.errors.lower) missing.push('one lowercase letter');
            if (validation.errors.number) missing.push('one number');
            if (validation.errors.special) missing.push('one special character');
            if (validation.errors.length) missing.push('at least 6 characters');

            setError(errorMsg + missing.join(', ') + '.');
            return;
        }

        setFormLoading(true);
        const signupData = {
            mobile,
            password,
            role,
            fullName,
            dob,
            weight: role === 'patient' ? weight : null,
            state: stateName,
            district,
            village,
            location: window.tempLocation || null, // Include lat/lng if captured
            ...(role === 'patient' ? { lmpDate } : { employeeId })
        };
        const result = await signup(signupData);
        setFormLoading(false);
        if (result.success) {
            const redirectPath = role === 'asha' ? '/Adash' : '/dashboard';
            navigate(redirectPath, { replace: true });
        } else {
            setError(result.error || 'Signup failed');
        }
    };

    return (
        <div className="login-page-v2">
            <div className="login-split-container">
                {/* Left Side: Welcome & Features */}
                <div className="login-info-side">
                    <div className="login-info-content">
                        <div className="login-avatar-wrapper">
                            <img src="/login-logo.jpg" alt="MatriCare Logo" className="login-main-logo" />
                        </div>
                        <h2 className="welcome-heading">
                            {t('login.welcomeTo')}<br />{t('login.appName')}
                        </h2>
                        <p className="welcome-subtext">{t('login.tagline')}</p>

                        <div className="login-feature-tags">
                            {t('login.featureTags', { returnObjects: true }).map((tag, i) => (
                                <span key={i} className="feature-tag">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="login-form-side">
                    <div className="form-box-v2">
                        <h1 className="join-title">{t('login.joinTitle')}</h1>
                        <p className="join-sub">{isLogin ? t('login.welcomeBack') : t('login.createAccount')}</p>

                        {/* Role Toggle */}
                        <div className="role-toggle-v2">
                            <button
                                className={`role-btn-v2 ${role === 'patient' ? 'active' : ''}`}
                                onClick={() => setRole('patient')}
                            >
                                {t('login.rolePatient')}
                            </button>
                            <button
                                className={`role-btn-v2 ${role === 'asha' ? 'active' : ''}`}
                                onClick={() => setRole('asha')}
                            >
                                {t('login.roleAsha')}
                            </button>
                        </div>

                        {/* Login Method Toggle (Only on Login) */}
                        {isLogin && (
                            <div className="method-toggle-v2">
                                <button
                                    className={`method-btn-v2 ${method === 'otp' ? 'active' : ''}`}
                                    onClick={() => { setMethod('otp'); setStep(1); }}
                                >
                                    {t('login.otpLogin')}
                                </button>
                                <button
                                    className={`method-btn-v2 ${method === 'password' ? 'active' : ''}`}
                                    onClick={() => setMethod('password')}
                                >
                                    {t('login.passwordLogin')}
                                </button>
                            </div>
                        )}

                        <form className="main-form-v2" onSubmit={isLogin ? (method === 'otp' && step === 1 ? handleSendOTP : handleLogin) : handleSignup}>
                            {!isLogin && (
                                <div className="input-group-v2">
                                    <label>{t('login.fullNameLabel')}</label>
                                    <input type="text" placeholder={t('login.fullNamePlaceholder')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                </div>
                            )}

                            <div className="input-group-v2">
                                <label>{t('login.mobileLabel')}</label>
                                <input type="tel" placeholder={t('login.mobilePlaceholder')} value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                            </div>

                            {/* Signup Specific Fields */}
                            {!isLogin && (
                                <>
                                    <div className="input-group-v2">
                                        <label>{t('login.dobLabel')}</label>
                                        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                                    </div>
                                    <div className="input-group-v2">
                                        <label>{t('login.stateLabel')}</label>
                                        <input type="text" placeholder={t('login.statePlaceholder')} value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                                    </div>

                                    <div className="input-group-v2">
                                        <label>{t('login.districtLabel')}</label>
                                        <input type="text" placeholder={t('login.districtPlaceholder')} value={district} onChange={(e) => setDistrict(e.target.value)} required />
                                    </div>
                                    <div className="input-group-v2">
                                        <label>{t('login.villageLabel')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('login.villagePlaceholder') || "Enter your village"}
                                            value={village}
                                            onChange={(e) => setVillage(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="input-group-v2">
                                        <label>Location (GPS)</label>
                                        <button
                                            type="button"
                                            className="action-btn-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', fontSize: '0.9rem' }}
                                            onClick={() => {
                                                if (!navigator.geolocation) {
                                                    alert("Geolocation not supported");
                                                    return;
                                                }
                                                navigator.geolocation.getCurrentPosition((pos) => {
                                                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                    // Store temporarily in state (need to add location state)
                                                    window.tempLocation = loc;
                                                    alert(`✅ Located: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
                                                }, (err) => {
                                                    console.error(err);
                                                    alert("Could not get location. Please enable GPS.");
                                                });
                                            }}
                                        >
                                            📍 Use Current Location
                                        </button>
                                    </div>

                                    {role === 'patient' && (
                                        <div className="input-group-v2">
                                            <label>{t('login.weightLabel')}</label>
                                            <input
                                                type="number"
                                                placeholder={t('login.weightPlaceholder')}
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                min="30"
                                                max="150"
                                                required
                                            />
                                            <span className="input-hint">{t('login.weightPlaceholder')}</span>
                                        </div>
                                    )}

                                    {role === 'patient' ? (
                                        <div className="input-group-v2">
                                            <label>{t('login.lmpLabel')}</label>
                                            <input type="date" value={lmpDate} onChange={(e) => setLmpDate(e.target.value)} required />
                                            <span className="input-hint">{t('login.lmpPlaceholder')}</span>
                                        </div>
                                    ) : (
                                        <div className="input-group-v2">
                                            <label>{t('login.employeeIdLabel')}</label>
                                            <input type="text" placeholder={t('login.employeeIdPlaceholder')} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Login Password Field */}
                            {isLogin && method === 'password' && (
                                <div className="input-group-v2">
                                    <label>{t('login.passwordLabel')}</label>
                                    <input type="password" placeholder={t('login.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            )}

                            {/* Signup Password Field */}
                            {!isLogin && (
                                <div className="input-group-v2">
                                    <label>Create Password</label>
                                    <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    <div className="password-requirements">
                                        <p className={/[A-Z]/.test(password) ? 'valid' : ''}>• One uppercase letter</p>
                                        <p className={/[a-z]/.test(password) ? 'valid' : ''}>• One lowercase letter</p>
                                        <p className={/[0-9]/.test(password) ? 'valid' : ''}>• One number</p>
                                        <p className={/[^A-Za-z0-9]/.test(password) ? 'valid' : ''}>• One special character</p>
                                        <p className={password.length >= 6 ? 'valid' : ''}>• At least 6 characters</p>
                                    </div>
                                </div>
                            )}

                            {/* OTP Field */}
                            {isLogin && method === 'otp' && step === 2 && (
                                <div className="input-group-v2">
                                    <label>{t('login.otpLabel')}</label>
                                    <input type="text" placeholder={t('login.otpPlaceholder')} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                                </div>
                            )}

                            {error && <p className="form-error">{error}</p>}

                            <button 
                                type="submit" 
                                className="submit-btn-v2" 
                                disabled={formLoading}
                                onTouchEnd={() => {
                                    if (!formLoading) {
                                        const action = isLogin ? (method === 'otp' && step === 1 ? handleSendOTP : handleLogin) : handleSignup;
                                        // Creating a synthetic-like event for handlers that expect 'e'
                                        action({ preventDefault: () => {} });
                                    }
                                }}
                            >
                                {formLoading ? 'Processing...' : (isLogin ? (method === 'otp' && step === 1 ? t('login.sendOtp') : t('login.loginBtn')) : t('login.signupBtn'))}
                            </button>
                        </form>

                        <div className="form-footer-v2">
                            <p>
                                {isLogin ? t('login.switchToSignup') : t('login.switchToLogin')}
                                <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                                    {isLogin ? " Sign Up" : " Login"}
                                </span>
                            </p>
                        </div>
                        <div id="recaptcha-container"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
