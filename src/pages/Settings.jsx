import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { useAuth } from '../context/AuthContext';
import { calculatePregnancyWeek, calculateDueDate } from '../utils/dateUtils';
import './Settings.css';

const Settings = () => {
    const { language } = useLanguage();
    const { currentUser } = useAuth();
    const t = translations[language];
    const pt = t.profile;
    const st = t.security;

    const [activeTab, setActiveTab] = useState('profile');

    // Mock user data - in a real app, this would come from AuthContext or Firestore
    const [userData, setUserData] = useState({
        name: currentUser?.displayName || 'User Name',
        village: 'Kalyanpur',
        state: 'Uttar Pradesh',
        address: 'House No. 12, Main Road',
        age: 26,
        lmpDate: '2024-10-15', // Example LMP date
        weight: 62,
        phone: currentUser?.phoneNumber || '+91 9876543210'
    });

    const pregnancyWeek = calculatePregnancyWeek(userData.lmpDate);
    const edd = calculateDueDate(userData.lmpDate);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
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
                                    <img src="/default-avatar.png" alt="Profile" className="profile-pic" />
                                    <button className="change-pic-btn">Edit</button>
                                </div>
                                <div className="profile-info-summary">
                                    <h2>{userData.name}</h2>
                                    <p>{userData.village}, {userData.state}</p>
                                </div>
                            </div>

                            <form className="settings-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>{pt.village}</label>
                                        <input type="text" name="village" value={userData.village} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>{pt.state}</label>
                                        <input type="text" name="state" value={userData.state} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>{pt.address}</label>
                                        <textarea name="address" value={userData.address} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>{pt.age}</label>
                                        <input type="number" name="age" value={userData.age} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>{pt.weight} (kg)</label>
                                        <input type="number" name="weight" value={userData.weight} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>{pt.edd}</label>
                                        <div className="static-value">{edd}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>{pt.currentWeek}</label>
                                        <div className="static-value">{pregnancyWeek} Weeks</div>
                                    </div>
                                </div>
                                <button type="button" className="save-btn">{pt.save}</button>
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
                                <button type="button" className="save-btn">{pt.save}</button>
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
