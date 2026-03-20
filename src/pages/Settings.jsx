import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { useAuth } from '../context/AuthContext';
import { calculatePregnancyWeek, calculateDueDate, calculateAge } from '../utils/dateUtils';
import Navbar from '../components/Navbar';
import './Settings.css';

const Settings = () => {
    const { language } = useLanguage();
    const { user: currentUser, updateProfile } = useAuth();
    const langT = translations[language] || translations.en;
    const pt = langT.profile || {};
    const st = langT.security || {};

    const [userData, setUserData] = useState({
        name: currentUser?.displayName || currentUser?.fullName || currentUser?.name || '',
        village: currentUser?.village || '',
        state: currentUser?.state || '',
        district: currentUser?.district || '',
        address: currentUser?.address || '',
        age: currentUser?.dob ? calculateAge(currentUser.dob) : (currentUser?.age || ''),
        lmpDate: currentUser?.lmpDate || '',
        weight: currentUser?.weight || '',
        height: currentUser?.height || '',
        bloodGroup: currentUser?.bloodGroup || '',
        conditions: currentUser?.conditions || '',
        gravida: currentUser?.gravida || '',
        para: currentUser?.para || '',
        phone: currentUser?.phoneNumber || currentUser?.mobile || ''
    });

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            alert('Image too large. Please select an image under 1MB.');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            const result = await updateProfile({ profilePicture: base64String });
            setUploading(false);
            if (!result.success) {
                alert('Upload failed: ' + result.error);
            }
        };
        reader.readAsDataURL(file);
    };

    const pregnancyWeek = calculatePregnancyWeek(userData.lmpDate);
    const edd = calculateDueDate(userData.lmpDate);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const result = await updateProfile(userData);
        if (result.success) {
            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile: ' + result.error);
        }
    };

    // Default ASHA worker avatar (professional icon)
    const getDefaultAvatar = () => {
        if (currentUser?.role === 'asha') {
            return '/default-avatar.jpg'; // Professional avatar for ASHA workers
        }
        return '/matricare-logo.png';
    };

    return (
        <>
            <Navbar />
            <div className="settings-container-landscape">
                <div className="settings-wrapper">
                    <div className="settings-landscape-grid">
                        {/* Left Panel - Profile Card */}
                        <div className="settings-profile-panel">
                            <div className="profile-card-compact">
                                <div className="profile-avatar-section">
                                    <div className="avatar-wrapper">
                                        <img
                                            src={currentUser?.profilePicture || getDefaultAvatar()}
                                            alt="Profile"
                                            className="avatar-image"
                                        />
                                        <label 
                                            htmlFor="pfp-upload" 
                                            className={`avatar-edit-btn ${uploading ? 'uploading' : ''}`}
                                            onTouchEnd={() => {
                                                if (!uploading) document.getElementById('pfp-upload').click();
                                            }}
                                        >
                                            {uploading ? '⏳' : '📷'}
                                        </label>

                                        <input
                                            type="file"
                                            id="pfp-upload"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </div>
                                </div>
                                <div className="profile-identity">
                                    <h2>{userData.name}</h2>
                                    <p className="role-badge">
                                        {currentUser?.role === 'asha' ? '👩‍⚕️ ASHA WORKER' : '🤰 EXPECTANT MOTHER'}
                                    </p>
                                </div>

                                {currentUser?.role === 'asha' && (
                                    <div className="asha-stats-compact">
                                        <div className="stat-item">
                                            <span className="stat-label">Employee ID</span>
                                            <span className="stat-value">{currentUser?.employeeId || 'N/A'}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Village</span>
                                            <span className="stat-value">{userData.village || 'N/A'}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Patients Managed</span>
                                            <span className="stat-value highlight">{currentUser?.assignedPatients || '0'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel - Settings Form */}
                        <div className="settings-form-panel">
                            <div className="settings-sections">
                                {/* Profile Information Section */}
                                <div className="settings-section">
                                    <h3 className="section-heading">📋 Profile Information</h3>
                                    <div className="form-grid-landscape">
                                        <div className="form-field">
                                            <label>Full Name</label>
                                            <input type="text" name="name" value={userData.name} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Village</label>
                                            <input type="text" name="village" value={userData.village} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>District</label>
                                            <input type="text" name="district" value={userData.district} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>State</label>
                                            <input type="text" name="state" value={userData.state} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field full-width">
                                            <label>Address</label>
                                            <textarea name="address" value={userData.address} onChange={handleInputChange} rows="2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div className="settings-section">
                                    <h3 className="section-heading">🔒 Security & Contact</h3>
                                    <div className="form-grid-landscape">
                                        <div className="form-field">
                                            <label>Phone Number</label>
                                            <input type="tel" name="phone" value={userData.phone} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Current Password</label>
                                            <input type="password" placeholder="Enter to change password" />
                                        </div>
                                        <div className="form-field">
                                            <label>New Password</label>
                                            <input type="password" placeholder="Leave blank to keep current" />
                                        </div>
                                        <div className="form-field">
                                            <label>Confirm Password</label>
                                            <input type="password" placeholder="Confirm new password" />
                                        </div>
                                    </div>
                                </div>

                                {/* Pregnancy Info (Only for non-ASHA users) */}
                                {currentUser?.role !== 'asha' && (
                                    <div className="settings-section">
                                        <h3 className="section-heading">🤰 Pregnancy Information</h3>
                                        <div className="form-grid-landscape">
                                            <div className="form-field">
                                                <label>Age</label>
                                                <input type="number" name="age" value={userData.age} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-field">
                                                <label>Weight (kg)</label>
                                                <input type="number" name="weight" value={userData.weight} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-field">
                                                <label>Height (cm)</label>
                                                <input type="number" name="height" value={userData.height} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-field">
                                                <label>Blood Group</label>
                                                <input type="text" name="bloodGroup" value={userData.bloodGroup} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-field">
                                                <label>Gravida (Pregnancies)</label>
                                                <input type="number" name="gravida" value={userData.gravida} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-field">
                                                <label>Para (Live Births)</label>
                                                <input type="number" name="para" value={userData.para} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-field">
                                                <label>Expected Due Date</label>
                                                <div className="static-display">{edd}</div>
                                            </div>
                                            <div className="form-field">
                                                <label>Current Week</label>
                                                <div className="static-display">{pregnancyWeek} Weeks</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="settings-actions">
                                    <button 
                                        type="button" 
                                        className="btn-save-primary" 
                                        onClick={handleSave}
                                        onTouchEnd={handleSave}
                                    >
                                        💾 Save All Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-cancel" 
                                        onClick={() => window.history.back()}
                                        onTouchEnd={() => window.history.back()}
                                    >
                                        ← Back to Dashboard
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;
