import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();

    const handleChange = (e) => {
        changeLanguage(e.target.value);
    };

    return (
        <div className="language-select-container">
            <select
                className="language-select"
                value={language}
                onChange={handleChange}
                aria-label="Select Language"
            >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
                <option value="ta">தமிழ்</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;


