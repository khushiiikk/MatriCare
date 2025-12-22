import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { trimesterExercises } from '../utils/exerciseData';
import './TrimesterPage.css';
import './Home.css';

const Trimester3 = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const navigate = useNavigate();

    // Color palette for exercises
    const colors = ["#E5C4C0", "#9B7B7E", "#E8F0D7", "#EDE8C8", "#E5C4C0", "#9B7B7E"];

    // Get exercises from translations
    const exercises = t.trimesterPages.trimester3.exercises.map((ex, index) => ({
        id: index + 1,
        title: ex.title,
        desc: ex.desc,
        steps: ex.steps,
        color: colors[index],
        image: trimesterExercises.trimester3[index]?.image,
        video: trimesterExercises.trimester3[index]?.video
    }));

    return (
        <div className="trimester-page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← {t.trimesterPages.backButton}
                </button>

                <header className="trimester-header">
                    <h1>{t.trimesterPages.trimester3.title}</h1>
                    <p className="subtitle">{t.trimesterPages.trimester3.subtitle}</p>
                </header>

                <div className="exercises-grid">
                    {exercises.map((ex) => (
                        <div key={ex.id} className="exercise-card" style={{ borderLeftColor: ex.color }}>
                            {/* Exercise Image */}
                            <div className="exercise-image-container">
                                <img
                                    src={ex.image}
                                    alt={ex.title}
                                    className="exercise-image"
                                    style={{ borderColor: ex.color }}
                                />
                                {ex.video && (
                                    <a
                                        href={ex.video}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="watch-video-btn"
                                        style={{ backgroundColor: ex.color }}
                                    >
                                        ▶ {t.yoga?.watchVideo || "Watch Video"}
                                    </a>
                                )}
                            </div>

                            <h3 className="exercise-name" style={{ color: ex.color === '#EDE8C8' ? '#9B7B7E' : ex.color }}>
                                {ex.title}
                            </h3>
                            <p className="exercise-description">{ex.desc}</p>

                            <div className="exercise-instructions">
                                <h4>{t.trimesterPages.howToDoIt}</h4>
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
                    <strong>{t.trimesterPages.trimester3.note}</strong> {t.trimesterPages.trimester3.noteText}
                </div>
            </div>
        </div>
    );
};

export default Trimester3;
