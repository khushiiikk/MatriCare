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
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Input mobile/pass, 2: OTP verification
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginWithPassword, sendOTP, signup } = useAuth();
    const { language } = useLanguage();
    const t = translations[language].navbar; // We might need to add specific login translations later
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

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
            navigate(from, { replace: true });
        } else {
            setError(result.error || 'Login failed');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await signup({ mobile, password, role });
        setLoading(false);
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error || 'Signup failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="role-tabs">
                    <button
                        className={`role-tab ${role === 'patient' ? 'active' : ''}`}
                        onClick={() => setRole('patient')}
                    >
                        Patient
                    </button>
                    <button
                        className={`role-tab ${role === 'asha' ? 'active' : ''}`}
                        onClick={() => setRole('asha')}
                    >
                        ASHA Worker
                    </button>
                </div>

                <div className="login-header">
                    <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
                    <p>{role === 'patient' ? 'Access your maternal health dashboard' : 'Manage your assigned rural zones'}</p>
                </div>

                {isLogin && (
                    <div className="method-tabs">
                        <button
                            className={`method-tab ${method === 'otp' ? 'active' : ''}`}
                            onClick={() => { setMethod('otp'); setStep(1); }}
                        >
                            OTP Login
                        </button>
                        <button
                            className={`method-tab ${method === 'password' ? 'active' : ''}`}
                            onClick={() => { setMethod('password'); setStep(1); }}
                        >
                            Password
                        </button>
                    </div>
                )}

                <form className="login-form" onSubmit={isLogin ? (method === 'otp' && step === 1 ? handleSendOTP : handleLogin) : handleSignup}>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                            disabled={step === 2 || loading}
                        />
                    </div>

                    {isLogin && method === 'password' && (
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    {!isLogin && (
                        <div className="form-group">
                            <label>Create Password</label>
                            <input
                                type="password"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-group animate-pop">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (
                            isLogin
                                ? (method === 'otp' && step === 1 ? 'Send OTP' : 'Login')
                                : 'Sign Up'
                        )}
                    </button>

                    <div id="recaptcha-container"></div>
                </form>

                <div className="login-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button onClick={() => { setIsLogin(!isLogin); setStep(1); setError(''); }}>
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
