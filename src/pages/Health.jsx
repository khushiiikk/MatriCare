import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import MedicalAnalysis from '../components/MedicalAnalysis';
import './Health.css';

const Health = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    return (
        <div className="health-container">
            <div className="container">
                {/* Header */}
                <div className="page-header-standard fade-in-up">
                    <h1>Medical Analysis</h1>
                    <p>Upload your medical reports for instant AI health insights.</p>
                </div>

                {/* Medical Analysis Component */}
                <div className="fade-in-up">
                    <MedicalAnalysis />
                </div>
            </div>
        </div>
    );
};

export default Health;
