import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Yoga.css';

const Yoga = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.yoga || translations.en.yoga;

    const trimesters = [
        {
            id: 1,
            title: t.trimester1,
            description: t.trimester1Desc,
            image: '/trimester1.png',
            color: '#E8F5E9'
        },
        {
            id: 2,
            title: t.trimester2,
            description: t.trimester2Desc,
            image: '/trimester2.png',
            color: '#FFF3E0'
        },
        {
            id: 3,
            title: t.trimester3,
            description: t.trimester3Desc,
            image: '/trimester3.png',
            color: '#F3E5F5'
        }
    ];

    return (
        <div className="yoga-container">
            <div className="container">
                <div className="page-header-standard">
                    <h1>{t.pageTitle}</h1>
                    <p>Gentle exercises for your pregnancy journey.</p>
                </div>

                <div className="page-grid-container">
                    {trimesters.map((trimester) => (
                        <div
                            key={trimester.id}
                            className="professional-card floating-subtle"
                            onClick={() => navigate(`/yoga/trimester/${trimester.id}`)}
                        >
                            <div className="professional-card-image-wrapper">
                                <img src={trimester.image} alt={trimester.title} />
                            </div>
                            <div className="professional-card-content">
                                <h2 className="professional-card-title">{trimester.title}</h2>
                                <p className="professional-card-text">{trimester.description}</p>
                                <button className="professional-card-btn">
                                    Explore →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Yoga;
