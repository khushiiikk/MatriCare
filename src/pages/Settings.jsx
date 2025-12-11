import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { calculatePregnancyWeek, calculateDueDate, formatDateForInput } from '../utils/dateUtils';
import './Settings.css';

const Settings = () => {
    const { user, updateProfile, updateProfilePicture, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        lmpDate: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setFormData({
            name: user.name || '',
            age: user.age || '',
            lmpDate: user.lmpDate || ''
        });
    }, [user, navigate]);

    // Handle Profile Picture Upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfilePicture(reader.result);
                setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Profile Update
    const handleProfileUpdate = (e) => {
        e.preventDefault();
        const result = updateProfile(formData);
        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        }
    };

    // Calculated fields
    const pregnancyWeek = formData.lmpDate ? calculatePregnancyWeek(formData.lmpDate) : 0;
    const dueDate = formData.lmpDate ? calculateDueDate(formData.lmpDate) : '';

    if (!user) return null;

    return (
        <div className="settings-page">
            <div className="container">
                <h1 className="settings-title">Account Settings</h1>

                <div className="settings-container">
                    {/* Sidebar */}
                    <div className="settings-sidebar">
                        <div className="profile-summary">
                            <div className="profile-pic-wrapper">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="profile-pic" />
                                ) : (
                                    <div className="profile-pic-placeholder">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <label htmlFor="profile-upload" className="edit-overlay">
                                    📷
                                </label>
                                <input
                                    type="file"
                                    id="profile-upload"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <h3>{user.name}</h3>
                            <p>{user.mobile}</p>
                        </div>

                        <nav className="settings-nav">
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 Profile Information
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                🔒 Security
                            </button>
                            <button
                                className="nav-item logout"
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                            >
                                🚪 Logout
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="settings-content">
                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                                <button onClick={() => setMessage({ type: '', text: '' })} className="close-msg">×</button>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="tab-content">
                                <h2>Profile Information</h2>
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Age</label>
                                            <input
                                                type="number"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>Mobile</label>
                                            <input
                                                type="text"
                                                value={user.mobile}
                                                disabled
                                                className="form-input disabled"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>LMP Date</label>
                                        <input
                                            type="date"
                                            value={formData.lmpDate}
                                            onChange={(e) => setFormData({ ...formData, lmpDate: e.target.value })}
                                            className="form-input"
                                            max={formatDateForInput(new Date())}
                                        />
                                    </div>

                                    <div className="pregnancy-info-card">
                                        <div className="info-item">
                                            <span className="label">Current Week</span>
                                            <span className="value">{pregnancyWeek} Weeks</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Estimated Due Date</span>
                                            <span className="value">{dueDate}</span>
                                        </div>
                                    </div>

                                    <button type="submit" className="save-btn">Save Changes</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="tab-content">
                                <h2>Security Settings</h2>
                                <p className="section-desc">Manage your password and account security.</p>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    setMessage({ type: 'success', text: 'Password updated successfully!' });
                                }}>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input type="password" placeholder="Enter new password" className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input type="password" placeholder="Confirm new password" className="form-input" />
                                    </div>

                                    <button type="submit" className="save-btn secondary">Update Password</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
