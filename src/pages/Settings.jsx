import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { useAuth } from '../context/AuthContext';
import { calculatePregnancyWeek, calculateDueDate, calculateAge } from '../utils/dateUtils';
import './Settings.css';

const Settings = () => {
    const { language } = useLanguage();
    const { user: currentUser, updateProfile } = useAuth();
    const langT = translations[language] || translations.en;
    const pt = langT.profile || {};
    const st = langT.security || {};

    const [activeTab, setActiveTab] = useState('profile');

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

        // Size check (max 1MB for Firestore storage)
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

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

    return (
        <div className="settings-container">
            <div className="settings-card">
                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => handleTabChange('profile')}
                    >
                        {pt.title}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => handleTabChange('security')}
                    >
                        {pt.security}
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'profile' ? (
                        <div className="profile-section">
                            <div className="profile-header">
                                <div className="profile-pic-container">
                                    <img
                                        src={currentUser?.profilePicture || "/default-avatar.png"}
                                        alt="Profile"
                                        className="profile-pic"
                                    />
                                    <label htmlFor="pfp-upload" className={`change-pic-btn ${uploading ? 'uploading' : ''}`}>
                                        {uploading ? '...' : 'Edit'}
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
                                <div className="profile-info-summary">
                                    <h2>{userData.name}</h2>
                                    <p>{userData.village}, {userData.district}, {userData.state}</p>
                                </div>
                            </div>

                            <form className="settings-form">
                                {currentUser?.role === 'asha' && (
                                    <div className="form-group">
                                        <label>Employee ID</label>
                                        <div className="static-value">{currentUser?.employeeId || 'N/A'}</div>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>{pt.village}</label>
                                    <input type="text" name="village" value={userData.village} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>{pt.state}</label>
                                    <input type="text" name="state" value={userData.state} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>District</label>
                                    <input type="text" name="district" value={userData.district} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>{pt.address}</label>
                                    <textarea name="address" value={userData.address} onChange={handleInputChange} />
                                </div>

                                {currentUser?.role !== 'asha' && (
                                    <>
                                        <div className="form-group">
                                            <label>{pt.age}</label>
                                            <input type="number" name="age" value={userData.age} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>{pt.weight} (kg)</label>
                                            <input type="number" name="weight" value={userData.weight} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Height (cm)</label>
                                            <input type="number" name="height" value={userData.height} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Blood Group</label>
                                            <input type="text" name="bloodGroup" value={userData.bloodGroup} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Chronic Conditions</label>
                                            <input type="text" name="conditions" value={userData.conditions} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-grid-inner">
                                            <div className="form-group">
                                                <label>Gravida (Pregnancies)</label>
                                                <input type="number" name="gravida" value={userData.gravida} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group">
                                                <label>Para (Live Births)</label>
                                                <input type="number" name="para" value={userData.para} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>{pt.edd}</label>
                                            <div className="static-value">{edd}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>{pt.currentWeek}</label>
                                            <div className="static-value">{pregnancyWeek} Weeks</div>
                                        </div>
                                    </>
                                )}
                                <button type="button" className="save-btn" onClick={handleSave}>{pt.save}</button>
                            </form>
                        </div>
                    ) : (
                        <div className="security-section">
                            <h3>{st.changePhone}</h3>
                            <form className="settings-form">
                                <div className="form-group">
                                    <label>{st.newPhone}</label>
                                    <input type="tel" name="phone" placeholder={userData.phone} />
                                </div>
                                <button type="button" className="save-btn" onClick={handleSave}>{pt.save}</button>
                            </form>

                            <hr className="divider" />

                            <h3>{st.updatePassword}</h3>
                            <form className="settings-form">
                                <div className="form-group">
                                    <label>{st.currentPassword}</label>
                                    <input type="password" />
                                </div>
                                <div className="form-group">
                                    <label>{st.newPassword}</label>
                                    <input type="password" />
                                </div>
                                <div className="form-group">
                                    <label>{st.confirmPassword}</label>
                                    <input type="password" />
                                </div>
                                <button type="button" className="save-btn">{st.updatePassword}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
