import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { validateMobile, validateName } from '../utils/validation';
import { formatDateForInput } from '../utils/dateUtils';
import Robot from '../components/Robot';
import './Login.css';
import plantIllustration from '../assets/fetus.png'; // Fallback for missing illustration

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
    const [loginMethod, setLoginMethod] = useState('password');

    // Signup Form State
    const [userType, setUserType] = useState('patient');
    const [signupData, setSignupData] = useState({
        name: '',
        mobile: '',
        dob: '',
        state: '',
        district: '',
        village: '',
        lmpDate: '',
        employeeId: '',
        password: '',
        weight: '' // Added weight field
    });

    // Robot Animation Stats
    const [robotMood, setRobotMood] = useState('happy');

    useEffect(() => {
        if (isAuthenticated && user) {
            const role = user.userType || user.role;
            if (role === 'asha') {
                navigate('/asha-dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!loginMobile || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const result = await loginWithPassword(loginMobile, password);
            setLoading(false);

            if (result.success) {
                console.log("Login successful, role:", result.user.role || result.user.userType);
                setRobotMood('success');
                // Navigation handled by useEffect
            } else {
                console.error("Login failed:", result.error);
                setError(result.error || 'Login failed');
                setRobotMood('thinking');
            }
        } catch (err) {
            setLoading(false);
            console.error("Login exception:", err);
            setError('Login failed. Please try again.');
            setRobotMood('thinking');
        }
    };

    const handleSignupChange = (e) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value });
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validations
        if (!validateName(signupData.name)) return setError(t.errors.invalidName);
        if (!validateMobile(signupData.mobile)) return setError(t.errors.invalidMobile);
        if (signupData.password.length < 6) return setError(t.errors.shortPassword);

        // Specific Validations
        if (userType === 'patient') {
            if (!signupData.dob) return setError('Date of Birth is required');
            if (!signupData.lmpDate) return setError(t.errors.invalidLMP);
        } else {
            if (!signupData.employeeId) return setError(t.errors.employeeId || 'Employee ID required');
        }

        if (!signupData.state || !signupData.district || !signupData.village) {
            return setError('Please fill in location details');
        }

        setLoading(true);
        try {
            const payload = { ...signupData, userType, role: userType };
            if (userType === 'asha') {
                delete payload.dob;
                delete payload.lmpDate;
            } else {
                delete payload.employeeId;
            }

            console.log("Submitting signup payload:", payload);
            const result = await signup(payload);
            setLoading(false);

            if (result.success) {
                console.log("Signup success, navigating...");
                setRobotMood('success');
                // Navigation will be handled by useEffect but explicit fallback:
                setTimeout(() => {
                    const dest = userType === 'asha' ? '/asha-dashboard' : '/dashboard';
                    console.log("Navigating to:", dest);
                    navigate(dest);
                }, 100);
            } else {
                console.error("Signup failed:", result.error);
                setError(result.error || t.errors.regFailed);
                setRobotMood('thinking');
            }
        } catch (err) {
            setLoading(false);
            console.error("Signup exception:", err);
            setError('Registration failed. Please try again.');
            setRobotMood('thinking');
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setSuccessMsg('');
    };

    return (
        <div className="login-page">
            <div className="login-glass-card">
                {/* Form Section */}
                <div className="login-form-side">
                    <div className="login-form-inner">
                        <header className="form-header">
                            <h2 className="brand-name">MatriCare</h2>
                            <h1 className="form-title">
                                {isLoginMode ? 'Login' : 'Sign Up'}
                            </h1>
                            <p className="form-subtitle">
                                {isLoginMode ? 'Welcome back, please enter your details' : 'Join our community of healthy mothers'}
                            </p>
                        </header>

                        {error && <div className="error-pill">{error}</div>}

                        <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignupSubmit}>
                            <div className="user-role-toggle">
                                <button
                                    type="button"
                                    className={userType === 'patient' ? 'active' : ''}
                                    onClick={() => setUserType('patient')}
                                >
                                    Patient
                                </button>
                                <button
                                    type="button"
                                    className={userType === 'asha' ? 'active' : ''}
                                    onClick={() => setUserType('asha')}
                                >
                                    ASHA Worker
                                </button>
                            </div>

                            {!isLoginMode && (
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={signupData.name}
                                            onChange={handleSignupChange}
                                            placeholder="Your name"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Mobile Number</label>
                                    <input
                                        type="tel"
                                        name={isLoginMode ? "loginMobile" : "mobile"}
                                        value={isLoginMode ? loginMobile : signupData.mobile}
                                        onChange={(e) => isLoginMode ? setLoginMobile(e.target.value) : handleSignupChange(e)}
                                        placeholder="10-digit number"
                                        maxLength="10"
                                    />
                                </div>
                            </div>

                            {!isLoginMode && (
                                <>
                                    <div className="form-row multi">
                                        {userType === 'patient' ? (
                                            <div className="input-group">
                                                <label>DOB</label>
                                                <input type="date" name="dob" value={signupData.dob} onChange={handleSignupChange} max={formatDateForInput(new Date())} />
                                            </div>
                                        ) : (
                                            <div className="input-group">
                                                <label>Employee ID</label>
                                                <input type="text" name="employeeId" value={signupData.employeeId} onChange={handleSignupChange} placeholder="ID Number" />
                                            </div>
                                        )}
                                        <div className="input-group">
                                            <label>State</label>
                                            <input type="text" name="state" value={signupData.state} onChange={handleSignupChange} placeholder="State" />
                                        </div>
                                    </div>

                                    <div className="form-row multi">
                                        <div className="input-group">
                                            <label>District</label>
                                            <input type="text" name="district" value={signupData.district} onChange={handleSignupChange} placeholder="District" />
                                        </div>
                                        <div className="input-group">
                                            <label>Village</label>
                                            <input type="text" name="village" value={signupData.village} onChange={handleSignupChange} placeholder="Village" />
                                        </div>
                                    </div>

                                    {userType === 'patient' && (
                                        <div className="form-row">
                                            <div className="input-group">
                                                <label>LMP Date</label>
                                                <input type="date" name="lmpDate" value={signupData.lmpDate} onChange={handleSignupChange} max={formatDateForInput(new Date())} />
                                            </div>
                                        </div>
                                    )}

                                    {userType === 'patient' && (
                                        <div className="form-row">
                                            <div className="input-group">
                                                <label>Mother's Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    name="weight"
                                                    value={signupData.weight}
                                                    onChange={handleSignupChange}
                                                    placeholder="Current weight in kg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name={isLoginMode ? "loginPassword" : "password"}
                                        value={isLoginMode ? password : signupData.password}
                                        onChange={(e) => isLoginMode ? setPassword(e.target.value) : handleSignupChange(e)}
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-action-btn" disabled={loading}>
                                {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
                            </button>
                        </form>

                        <footer className="form-footer">
                            <p>
                                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                                <button onClick={toggleMode} className="inline-toggle-btn">
                                    {isLoginMode ? 'Create Account' : 'Login'}
                                </button>
                            </p>
                        </footer>
                    </div>
                </div>

                {/* Illustration Section */}
                <div className="login-visual-side">
                    <div className="visual-container">
                        <div className="illustration-wrapper">
                            <img src={plantIllustration} alt="Wellness" className="floating-plant" />
                            <div className="glow-effect"></div>
                        </div>
                        <div className="robot-mini">
                            <Robot mood={robotMood} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="bg-blur-circle pink"></div>
            <div className="bg-blur-circle purple"></div>
        </div>
    );
};

export default Login;
