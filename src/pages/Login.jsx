import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Login.css';

const Login = () => {
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
    const [loading, setLoading] = useState(false);

    const { login, loginWithPassword, sendOTP, signup } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await sendOTP(mobile);
        setLoading(false);
        if (result.success) {
            setStep(2);
        } else {
            setError(result.error || 'Failed to send OTP');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        let result;
        if (method === 'otp') {
            result = await login(mobile, otp);
        } else {
            result = await loginWithPassword(mobile, password);
        }
        setLoading(false);
        if (result.success) {
            const userRole = result.user?.role || role;
            const redirectPath = userRole === 'asha' ? '/Adash' : '/dashboard';
            navigate(redirectPath, { replace: true });
        } else {
            setError(result.error || 'Login failed');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
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
            ...(role === 'patient' ? { lmpDate } : { employeeId })
        };
        const result = await signup(signupData);
        setLoading(false);
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
                        <h2 className="welcome-heading">Welcome to<br />MatriCare</h2>
                        <p className="welcome-subtext">Track health, stay happy.</p>

                        <div className="login-feature-tags">
                            <span className="feature-tag">Tracker</span>
                            <span className="feature-tag">AI Assistant</span>
                            <span className="feature-tag">Yoga</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="login-form-side">
                    <div className="form-box-v2">
                        <h1 className="join-title">Join MatriCare</h1>
                        <p className="join-sub">{isLogin ? 'Welcome back!' : "Create a free account"}</p>

                        {/* Role Toggle */}
                        <div className="role-toggle-v2">
                            <button
                                className={`role-btn-v2 ${role === 'patient' ? 'active' : ''}`}
                                onClick={() => setRole('patient')}
                            >
                                Patient (Mother)
                            </button>
                            <button
                                className={`role-btn-v2 ${role === 'asha' ? 'active' : ''}`}
                                onClick={() => setRole('asha')}
                            >
                                ASHA Worker
                            </button>
                        </div>

                        {/* Login Method Toggle (Only on Login) */}
                        {isLogin && (
                            <div className="method-toggle-v2">
                                <button
                                    className={`method-btn-v2 ${method === 'otp' ? 'active' : ''}`}
                                    onClick={() => { setMethod('otp'); setStep(1); }}
                                >
                                    OTP Login
                                </button>
                                <button
                                    className={`method-btn-v2 ${method === 'password' ? 'active' : ''}`}
                                    onClick={() => setMethod('password')}
                                >
                                    Password Login
                                </button>
                            </div>
                        )}

                        <form className="main-form-v2" onSubmit={isLogin ? (method === 'otp' && step === 1 ? handleSendOTP : handleLogin) : handleSignup}>
                            {!isLogin && (
                                <div className="input-group-v2">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                </div>
                            )}

                            <div className="input-group-v2">
                                <label>Mobile</label>
                                <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                            </div>

                            {/* Signup Specific Fields */}
                            {!isLogin && (
                                <>
                                    <div className="input-group-v2">
                                        <label>Date of Birth</label>
                                        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                                    </div>
                                    <div className="input-group-v2">
                                        <label>State</label>
                                        <input type="text" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                                    </div>

                                    <div className="input-group-v2">
                                        <label>District</label>
                                        <input type="text" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                                    </div>
                                    <div className="input-group-v2">
                                        <label>Village</label>
                                        <select value={village} onChange={(e) => setVillage(e.target.value)} required>
                                            <option value="">Select Village</option>
                                            <option value="v1">Village 1</option>
                                            <option value="v2">Village 2</option>
                                        </select>
                                    </div>

                                    {role === 'patient' && (
                                        <div className="input-group-v2">
                                            <label>Weight (kg)</label>
                                            <input
                                                type="number"
                                                placeholder="Enter weight in kg"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                min="30"
                                                max="150"
                                                required
                                            />
                                            <span className="input-hint">Current weight for health tracking</span>
                                        </div>
                                    )}

                                    {role === 'patient' ? (
                                        <div className="input-group-v2">
                                            <label>LMP Date (Last Period)</label>
                                            <input type="date" value={lmpDate} onChange={(e) => setLmpDate(e.target.value)} required />
                                            <span className="input-hint">Used to calculate pregnancy week</span>
                                        </div>
                                    ) : (
                                        <div className="input-group-v2">
                                            <label>ASHA Worker ID</label>
                                            <input type="text" placeholder="Enter your ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Login Password Field */}
                            {isLogin && method === 'password' && (
                                <div className="input-group-v2">
                                    <label>Password</label>
                                    <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            )}

                            {/* Signup Password Field */}
                            {!isLogin && (
                                <div className="input-group-v2">
                                    <label>Create Password</label>
                                    <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            )}

                            {/* OTP Field */}
                            {isLogin && method === 'otp' && step === 2 && (
                                <div className="input-group-v2">
                                    <label>Enter OTP</label>
                                    <input type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                                </div>
                            )}

                            {error && <p className="form-error">{error}</p>}

                            <button type="submit" className="submit-btn-v2" disabled={loading}>
                                {loading ? 'Processing...' : (isLogin ? (method === 'otp' && step === 1 ? 'Send OTP' : 'Login') : 'Create Account')}
                            </button>
                        </form>

                        <div className="form-footer-v2">
                            <p>
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                <span className="toggle-link" onClick={() => { setIsLogin(!isLogin); setStep(1); setError(''); }}>
                                    {isLogin ? 'Sign Up' : 'Login'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
