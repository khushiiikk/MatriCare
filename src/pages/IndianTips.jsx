import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // UPDATED
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './IndianTips.css';

const IndianTips = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('pages'); // UPDATED: Use 'pages' namespace
    const [dynamicContent, setDynamicContent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Removed hardcoded localContent - now using i18n JSONs

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const docRef = doc(db, "content", "tips");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDynamicContent(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching tips from Firestore:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTips();
    }, []);

    // Get sections from i18n
    const sections = t('indianTips.sections', { returnObjects: true });
    // Safety check: ensure sections is an array (in case of loading/error)
    const safeSections = Array.isArray(sections) ? sections : [];

    return (
        <div className="indian-tips-container fade-in">
            <div className="mandala-bg-pattern"></div>

            <button className="back-btn" onClick={() => navigate(-1)}>← {t('indianTips.back')}</button>

            <header className="tips-header">
                <h1>{t('indianTips.pageTitle')}</h1>
                <p>{t('indianTips.subtitle')}</p>
            </header>

            <div className="tips-content">
                {safeSections.map((section, sIdx) => (
                    <section key={sIdx} className="tips-section">
                        <div className="section-title">
                            <span className="section-icon">{section.icon}</span>
                            <h2>{section.title}</h2>
                        </div>
                        <div className="tips-grid">
                            {section.tips && section.tips.map((tip, tIdx) => (
                                <div key={tIdx} className="tip-premium-card">
                                    <div className="tip-category">{section.category}</div>
                                    <h3>{tip.title}</h3>
                                    <p>{tip.content}</p>
                                    <div className="tip-benefit-tag">
                                        <span>{t('indianTips.focus')}</span> {tip.benefit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="tips-disclaimer">
                <p>{t('indianTips.disclaimer')}</p>
            </footer>
        </div>
    );
};

export default IndianTips;
