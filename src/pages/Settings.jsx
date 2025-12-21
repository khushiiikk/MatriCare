import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { calculatePregnancyWeek, calculateDueDate, formatDateForInput, calculateAge } from '../utils/dateUtils';
import './Settings.css';

const Settings = () => {
    const { user, updateProfile, updateProfilePicture, logout } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    // Translations
    const t = {
        en: {
            title: 'Account Settings',
            profileInfo: 'Profile Information',
            security: 'Security',
            logout: 'Logout',
            fullName: 'Full Name',
            age: 'Age (years)',
            mobile: 'Mobile',
            state: 'State',
            district: 'District',
            village: 'Village',
            lmpDate: 'LMP Date',
            currentWeek: 'Current Week',
            weeks: 'Weeks',
            dueDate: 'Estimated Due Date',
            saveChanges: 'Save Changes',
            securitySettings: 'Security Settings',
            securityDesc: 'Manage your password and account security.',
            newPassword: 'New Password',
            confirmPassword: 'Confirm Password',
            updatePassword: 'Update Password',
            enterNewPassword: 'Enter new password',
            confirmNewPassword: 'Confirm new password',
            profileUpdated: 'Profile updated successfully!',
            passwordUpdated: 'Password updated successfully!',
            imageSizeError: 'Image size should be less than 5MB',
            pictureUpdated: 'Profile picture updated successfully!',
            employeeId: 'Employee ID',
            role: 'User Role',
            rolePatient: 'Patient (Mother)',
            roleAsha: 'ASHA Worker'
        },
        hi: {
            title: 'खाता सेटिंग्स',
            profileInfo: 'प्रोफ़ाइल जानकारी',
            security: 'सुरक्षा',
            logout: 'लॉगआउट',
            fullName: 'पूरा नाम',
            age: 'उम्र (वर्ष)',
            mobile: 'मोबाइल',
            state: 'राज्य',
            district: 'जिला',
            village: 'गाँव',
            lmpDate: 'एलएमपी तारीख',
            currentWeek: 'वर्तमान सप्ताह',
            weeks: 'सप्ताह',
            dueDate: 'अनुमानित नियत तारीख',
            saveChanges: 'परिवर्तन सहेजें',
            securitySettings: 'सुरक्षा सेटिंग्स',
            securityDesc: 'अपना पासवर्ड और खाता सुरक्षा प्रबंधित करें।',
            newPassword: 'नया पासवर्ड',
            confirmPassword: 'पासवर्ड की पुष्टि करें',
            updatePassword: 'पासवर्ड अपडेट करें',
            enterNewPassword: 'नया पासवर्ड दर्ज करें',
            confirmNewPassword: 'नए पासवर्ड की पुष्टि करें',
            profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!',
            passwordUpdated: 'पासवर्ड सफलतापूर्वक अपडेट हो गया!',
            imageSizeError: 'छवि का आकार 5MB से कम होना चाहिए',
            pictureUpdated: 'प्रोफ़ाइल चित्र सफलतापूर्वक अपडेट हो गया!',
            employeeId: 'कर्मचारी आईडी',
            role: 'उपयोगकर्ता भूमिका',
            rolePatient: 'रोगी (Mother)',
            roleAsha: 'आशा वर्कर (ASHA)'
        },
        mr: {
            title: 'खाते सेटिंग्ज',
            profileInfo: 'प्रोफाइल माहिती',
            security: 'सुरक्षा',
            logout: 'लॉगआउट',
            fullName: 'पूर्ण नाव',
            age: 'वय (वर्षे)',
            mobile: 'मोबाइल',
            state: 'राज्य',
            district: 'जिल्हा',
            village: 'गाव',
            lmpDate: 'एलएमपी तारीख',
            currentWeek: 'सध्याचा आठवडा',
            weeks: 'आठवडे',
            dueDate: 'अंदाजे नियत तारीख',
            saveChanges: 'बदल जतन करा',
            securitySettings: 'सुरक्षा सेटिंग्ज',
            securityDesc: 'तुमचा पासवर्ड आणि खाते सुरक्षा व्यवस्थापित करा.',
            newPassword: 'नवीन पासवर्ड',
            confirmPassword: 'पासवर्डची पुष्टी करा',
            updatePassword: 'पासवर्ड अपडेट करा',
            enterNewPassword: 'नवीन पासवर्ड प्रविष्ट करा',
            confirmNewPassword: 'नवीन पासवर्डची पुष्टी करा',
            profileUpdated: 'प्रोफाइल यशस्वीरित्या अपडेट झाले!',
            passwordUpdated: 'पासवर्ड यशस्वीरित्या अपडेट झाला!',
            imageSizeError: 'प्रतिमेचा आकार 5MB पेक्षा कमी असावा',
            pictureUpdated: 'प्रोफाइल चित्र यशस्वीरित्या अपडेट झाले!',
            employeeId: 'कर्मचारी आयडी',
            role: 'वापरकर्ता भूमिका',
            rolePatient: 'रुग्ण (Mother)',
            roleAsha: 'आशा वर्कर (ASHA)'
        },
        ta: {
            title: 'கணக்கு அமைப்புகள்',
            profileInfo: 'சுயவிவர தகவல்',
            security: 'பாதுகாப்பு',
            logout: 'வெளியேறு',
            fullName: 'முழு பெயர்',
            age: 'வயது (ஆண்டுகள்)',
            mobile: 'மொபைல்',
            state: 'மாநிலம்',
            district: 'மாவட்டம்',
            village: 'கிராமம்',
            lmpDate: 'எல்எம்பி தேதி',
            currentWeek: 'தற்போதைய வாரம்',
            weeks: 'வாரங்கள்',
            dueDate: 'மதிப்பிடப்பட்ட நிலையான தேதி',
            saveChanges: 'மாற்றங்களை சேமி',
            securitySettings: 'பாதுகாப்பு அமைப்புகள்',
            securityDesc: 'உங்கள் கடவுச்சொல் மற்றும் கணக்கு பாதுகாப்பை நிர்வகிக்கவும்.',
            newPassword: 'புதிய கடவுச்சொல்',
            confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
            updatePassword: 'கடவுச்சொல்லை புதுப்பிக்கவும்',
            enterNewPassword: 'புதிய கடவுச்சொல்லை உள்ளிடவும்',
            confirmNewPassword: 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
            profileUpdated: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
            passwordUpdated: 'கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
            imageSizeError: 'படத்தின் அளவு 5MB க்கும் குறைவாக இருக்க வேண்டும்',
            pictureUpdated: 'சுயவிவர படம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
            employeeId: 'பணியாளர் அடையாள எண்',
            role: 'பயனர் பங்கு',
            rolePatient: 'நோயாளி (Mother)',
            roleAsha: 'ஆஷா பணியாளர் (ASHA)'
        }
    };

    const content = t[language] || t.en;

    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        state: '',
        district: '',
        village: '',
        lmpDate: '',
        employeeId: '',
        weight: '',
        dob: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setFormData({
            name: user.name || '',
            age: user.age || '',
            state: user.state || '',
            district: user.district || '',
            village: user.village || '',
            lmpDate: user.lmpDate || '',
            employeeId: user.employeeId || '',
            weight: user.weight || '',
            dob: user.dob || '',
            age: user.dob ? calculateAge(user.dob) : (user.age || '')
        });
    }, [user, navigate]);


    // Handle Profile Picture Upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                setMessage({ type: 'error', text: content.imageSizeError });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfilePicture(reader.result);
                setMessage({ type: 'success', text: content.pictureUpdated });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Profile Update
    const handleProfileUpdate = (e) => {
        e.preventDefault();
        const result = updateProfile(formData);
        if (result.success) {
            setMessage({ type: 'success', text: content.profileUpdated });
        }
    };

    // Calculated fields
    const pregnancyWeek = formData.lmpDate ? calculatePregnancyWeek(formData.lmpDate) : 0;
    const dueDate = formData.lmpDate ? calculateDueDate(formData.lmpDate) : '';

    const isPatient = user.userType === 'patient' || !user.userType;
    const isAsha = user.userType === 'asha';

    if (!user) return null;

    return (
        <div className="settings-page">
            <div className="container">
                <h1 className="settings-title">{content.title}</h1>

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
                            <p className="user-role-badge">
                                {isAsha ? content.roleAsha : content.rolePatient}
                            </p>
                            <p>{user.mobile}</p>
                        </div>

                        <nav className="settings-nav">
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 {content.profileInfo}
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                🔒 {content.security}
                            </button>
                            <button
                                className="nav-item logout"
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                            >
                                🚪 {content.logout}
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
                                <h2>{content.profileInfo}</h2>
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="form-group">
                                        <label>{content.fullName}</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>{content.age}</label>
                                            <input
                                                type="number"
                                                value={formData.dob ? calculateAge(formData.dob) : formData.age}
                                                readOnly
                                                className="form-input disabled"
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>Weight (kg)</label>
                                            <input
                                                type="number"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                className="form-input"
                                                max={formatDateForInput(new Date())}
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>{content.mobile}</label>
                                            <input
                                                type="text"
                                                value={user.mobile}
                                                disabled
                                                className="form-input disabled"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>{content.state}</label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>{content.district}</label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>{content.village}</label>
                                        <select
                                            value={formData.village}
                                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                            className="form-input"
                                        >
                                            <option value="">Select Village</option>
                                            <option value="village1">Ramnagar</option>
                                            <option value="village2">Kishanpur</option>
                                            <option value="village3">Gopalpur</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {isPatient && (
                                        <div className="form-group">
                                            <label>{content.lmpDate}</label>
                                            <input
                                                type="date"
                                                value={formData.lmpDate}
                                                onChange={(e) => setFormData({ ...formData, lmpDate: e.target.value })}
                                                className="form-input"
                                                max={formatDateForInput(new Date())}
                                            />
                                        </div>
                                    )}

                                    {isAsha && (
                                        <div className="form-group">
                                            <label>{content.employeeId}</label>
                                            <input
                                                type="text"
                                                value={formData.employeeId}
                                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                                className="form-input"
                                                placeholder={content.employeeId}
                                            />
                                        </div>
                                    )}

                                    {isPatient && (
                                        <div className="pregnancy-info-card">
                                            <div className="info-item">
                                                <span className="label">{content.currentWeek}</span>
                                                <span className="value">{pregnancyWeek} {content.weeks}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">{content.dueDate}</span>
                                                <span className="value">{dueDate}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" className="save-btn">{content.saveChanges}</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="tab-content">
                                <h2>{content.securitySettings}</h2>
                                <p className="section-desc">{content.securityDesc}</p>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    setMessage({ type: 'success', text: content.passwordUpdated });
                                }}>
                                    <div className="form-group">
                                        <label>{content.newPassword}</label>
                                        <input type="password" placeholder={content.enterNewPassword} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>{content.confirmPassword}</label>
                                        <input type="password" placeholder={content.confirmNewPassword} className="form-input" />
                                    </div>

                                    <button type="submit" className="save-btn secondary">{content.updatePassword}</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Settings;
