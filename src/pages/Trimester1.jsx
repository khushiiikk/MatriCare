import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Home.css'; // Reusing styles

const Trimester1 = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const navigate = useNavigate();

    // Color palette for exercises
    const colors = ["#E5C4C0", "#9B7B7E", "#E8F0D7", "#EDE8C8", "#E5C4C0", "#9B7B7E"];

    // Get exercises from translations
    const exercises = t.trimesterPages.trimester1.exercises.map((ex, index) => ({
        id: index + 1,
        title: ex.title,
        desc: ex.desc,
        steps: ex.steps,
        color: colors[index]
    }));

    return (
        <div className="trimester-page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← {t.trimesterPages.backButton}
                </button>

                <header className="trimester-header">
                    <h1>{t.trimesterPages.trimester1.title}</h1>
                    <p className="subtitle">{t.trimesterPages.trimester1.subtitle}</p>
                </header>

                <div className="exercises-list">
                    {exercises.map((ex) => (
                        <div key={ex.id} className="exercise-detail" style={{ borderLeftColor: ex.color }}>
                            {/* Animation Placeholder */}
                            <div className="exercise-animation-placeholder" style={{ backgroundColor: `${ex.color}33` }}>
                                <div className="play-icon">▶</div>
                                <span className="animation-text">{t.trimesterPages.viewAnimation}</span>
                            </div>

                            <h3 className="exercise-name" style={{ color: ex.color === '#EDE8C8' ? '#9B7B7E' : ex.color }}>
                                {ex.title}
                            </h3>
                            <p className="exercise-description">{ex.desc}</p>

                            <div className="exercise-instructions">
                                <strong>{t.trimesterPages.howToDoIt}</strong>
                                <ol>
                                    {ex.steps.map((step, idx) => (
                                        <li key={idx}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="trimester-note" style={{ marginTop: '30px' }}>
                    <strong>{t.trimesterPages.trimester1.note}</strong> {t.trimesterPages.trimester1.noteText}
                </div>
            </div>
        </div>
    );
};

export default Trimester1;
