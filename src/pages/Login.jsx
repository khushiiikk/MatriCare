import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { validateMobile, validateName } from '../utils/validation';
import { formatDateForInput } from '../utils/dateUtils';
import Robot from '../components/Robot';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { loginWithPassword, signup, isAuthenticated, user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language].login;

    // UI State
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Login Form State
    const [loginMobile, setLoginMobile] = useState('');
    const [password, setPassword] = useState('');

    // Signup Form State
    const [userType, setUserType] = useState('patient'); // 'patient' or 'asha'
    const [signupData, setSignupData] = useState({
        name: '',
        mobile: '',
        dob: '',
        state: '',
        district: '',
        village: '',
        lmpDate: '',
        employeeId: '',
        password: ''
    });

    // Robot Animation State
    const [robotMood, setRobotMood] = useState('happy'); // happy, thinking, success

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.userType === 'asha' || user.role === 'asha') {
                navigate('/asha-dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);



    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try {
            if (!password) {
                setError(t.errors.invalidPassword);
                setLoading(false);
                return;
            }
            const result = await loginWithPassword(loginMobile, password);

            setLoading(false);

            if (result.success) {
                navigate('/dashboard');
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

        if (!validateName(signupData.name)) return setError(t.errors.invalidName);
        if (!validateMobile(signupData.mobile)) return setError(t.errors.invalidMobile);

        // Conditional Validation based on User Type
        if (userType === 'patient') {
            if (!signupData.dob) return setError(t.errors.invalidAge || 'Please enter valid DOB'); // Fallback reusing invalidAge
            if (!signupData.lmpDate) return setError(t.errors.invalidLMP);
        } else if (userType === 'asha') {
            if (!signupData.employeeId) return setError(t.errors.employeeId || 'Please enter Employee ID');
        }

        if (!signupData.state) return setError('Please enter your state');
        if (!signupData.district) return setError('Please enter your district');
        if (!signupData.village) return setError('Please select your village');
        if (signupData.password.length < 6) return setError(t.errors.shortPassword);

        setLoading(true);
        try {
            const payload = { ...signupData, userType };
            // Remove irrelevant fields for cleaner data
            if (userType === 'asha') {
                delete payload.dob;
                delete payload.lmpDate;
            } else {
                delete payload.employeeId;
            }

            const result = await signup(payload);
            setLoading(false);

            if (result.success) {
                setSuccessMsg('Account created successfully!');
                setRobotMood('success');
            } else {
                setError(result.error || t.errors.regFailed);
                setRobotMood('thinking');
            }
        } catch (err) {
            setLoading(false);
            console.error(err);
            setError('Signup failed. Please try again.');
            setRobotMood('thinking');
        }
    };


    // Toggle Mode
    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setSuccessMsg('');
        setRobotMood(isLoginMode ? 'happy' : 'success'); // Change mood on toggle
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Side - Form Section */}
                <div className="login-form-section">
                    <div className="form-content">
                        <h1 className="login-title">
                            {isLoginMode ? t.welcomeBack : t.joinMatriCare}
                        </h1>
                        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '30px' }}>
                            {isLoginMode ? 'Nice to see you naturally' : 'Create an account. It\'s free'}
                        </p>

                        {error && <div className="error-message">{error}</div>}
                        {successMsg && <div className="success-message">{successMsg}</div>}

                        {isLoginMode ? (
                            // Login Form
                            <div className="login-wrapper">
                                <form onSubmit={handleLoginSubmit} className="login-form">
                                    <div className="form-group">
                                        <label>{t.mobileLabel}</label>
                                        <input
                                            type="tel"
                                            placeholder={t.mobilePlaceholder}
                                            value={loginMobile}
                                            onChange={(e) => setLoginMobile(e.target.value)}
                                            maxLength="10"
                                            className="form-input"
                                        />
                                    </div>

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

                                    <button type="submit" className="sign-in-btn" disabled={loading}>
                                        {loading ? t.processing : t.loginBtn}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            // Signup Form
                            <form onSubmit={handleSignupSubmit} className="login-form">
                                {/* User Type Toggle */}
                                <div className="user-type-selector" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <button
                                        type="button"
                                        className={`type-btn ${userType === 'patient' ? 'active' : ''}`}
                                        onClick={() => setUserType('patient')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: `2px solid ${userType === 'patient' ? 'var(--color-mauve)' : '#eee'}`,
                                            backgroundColor: userType === 'patient' ? 'var(--color-mauve)' : '#f9f9f9',
                                            color: userType === 'patient' ? 'white' : '#666',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {t.rolePatient || 'Patient'}
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn ${userType === 'asha' ? 'active' : ''}`}
                                        onClick={() => setUserType('asha')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: `2px solid ${userType === 'asha' ? 'var(--color-mauve)' : '#eee'}`,
                                            backgroundColor: userType === 'asha' ? 'var(--color-mauve)' : '#f9f9f9',
                                            color: userType === 'asha' ? 'white' : '#666',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {t.roleAsha || 'ASHA Worker'}
                                    </button>
                                </div>

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

                                {userType === 'patient' && (
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
                                )}

                                {userType === 'asha' && (
                                    <div className="form-group">
                                        <label>{t.employeeId || 'Employee ID'}</label>
                                        <input
                                            type="text"
                                            name="employeeId"
                                            placeholder={t.employeeId || 'Enter ID'}
                                            value={signupData.employeeId}
                                            onChange={handleSignupChange}
                                            className="form-input"
                                        />
                                    </div>
                                )}

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

                                {userType === 'patient' && (
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
                                )}

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

                                <button type="submit" className="sign-in-btn" disabled={loading}>
                                    {loading ? t.processing : t.createAccount}
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
