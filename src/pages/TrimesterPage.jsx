import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import { trimesterContent } from '../data/yogaContent';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './TrimesterPage.css';

const TrimesterPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.yoga || translations.en.yoga;

    const trimesterTitles = {
        '1': t.trimester1,
        '2': t.trimester2,
        '3': t.trimester3
    };

    const commonText = {
        en: {
            backBtn: 'Back to Trimesters',
            yogaTips: 'YOGA TIPS',
            yogaExercises: 'YOGA EXERCISES',
            clickToLearn: 'Click to learn more',
            clickToFlip: 'Click to flip back',
            step: 'Step'
        },
        hi: {
            backBtn: 'तिमाही पर वापस जाएं',
            yogaTips: 'योग सुझाव',
            yogaExercises: 'योग व्यायाम',
            clickToLearn: 'अधिक जानने के लिए क्लिक करें',
            clickToFlip: 'वापस पलटने के लिए क्लिक करें',
            step: 'चरण'
        }
    };

    const common = commonText[language] || commonText.en;

    const [dynamicContent, setDynamicContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchYogaContent = async () => {
            try {
                const docRef = doc(db, "content", "yoga");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDynamicContent(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching yoga content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchYogaContent();
    }, []);

    const activeContent = dynamicContent?.[language] || trimesterContent[language] || trimesterContent.en;

    // Get tips and exercises for current trimester
    const trimesterTips = activeContent.tips[`tri${id}`] || [];
    const trimesterYoga = (activeContent.exercises[`tri${id}`] || []).map((ex, idx) => {
        const images = {
            '1': ["/tri1_constructive_rest.png", "/tri1_childs_pose.png", "/tri1_downward_dog.png", "/tri1_side_angle.png", "/tri1_goddess_pose.png"],
            '2': ["/tri2_tree_pose.png", "/yoga_side_plank.png", "/yoga_supported_fish.png", "/butterfly-pose.png", "/yoga_warrior.png"],
            '3': ["/yoga_kegels.png", "/yoga_home-icon-new.jpg", "/yoga_malasana.png", "/yoga_cat_cow.png", "/yoga_childs_pose.png"]
        };
        return {
            ...ex,
            image: images[id]?.[idx] || "/yoga-home-icon-new.jpg"
        };
    });

    const [selectedOption, setSelectedOption] = useState('tips');
    const [flippedCards, setFlippedCards] = React.useState({});

    const toggleCard = (index) => {
        setFlippedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className="trimester-page-container">
            <div className="container">
                <button className="back-btn" onClick={() => navigate('/yoga')}>
                    ← {common.backBtn}
                </button>

                <div className="trimester-page-header">
                    <h1>{trimesterTitles[id] || 'Trimester'}</h1>
                </div>

                <div className="yoga-content">
                    {/* Option Selector */}
                    <div className="option-selector">
                        <button
                            className={`option-btn ${selectedOption === 'tips' ? 'active' : ''}`}
                            onClick={() => setSelectedOption('tips')}
                        >
                            {common.yogaTips}
                        </button>
                        <button
                            className={`option-btn ${selectedOption === 'yoga' ? 'active' : ''}`}
                            onClick={() => setSelectedOption('yoga')}
                        >
                            {common.yogaExercises}
                        </button>
                    </div>

                    {/* Yoga Tips Section */}
                    {selectedOption === 'tips' && (
                        <div className="tips-section animate-fade-in">
                            <div className="tips-grid-vertical">
                                {trimesterTips.length > 0 ? trimesterTips.map((tip, index) => (
                                    <div key={index} className="tip-card">
                                        <h3>{tip.title}</h3>
                                        <p>{tip.content}</p>
                                    </div>
                                )) : <p>Tips loading or temporarily unavailable.</p>}
                            </div>
                        </div>
                    )}

                    {/* Yoga Exercises Section with Flip Cards */}
                    {selectedOption === 'yoga' && (
                        <div className="yoga-section animate-fade-in">
                            <div className="flip-cards-grid">
                                {trimesterYoga.length > 0 ? trimesterYoga.map((yoga, index) => (
                                    <div
                                        key={index}
                                        className={`flip-card ${flippedCards[index] ? 'flipped' : ''}`}
                                        onClick={() => toggleCard(index)}
                                    >
                                        <div className="flip-card-inner">
                                            <div className="flip-card-front">
                                                {yoga.image ? (
                                                    <img src={yoga.image} alt={yoga.name} className="yoga-pose-img" />
                                                ) : (
                                                    <div className="yoga-placeholder-box">Pose Image</div>
                                                )}
                                                <h3>{yoga.name}</h3>
                                                <p className="click-hint">{common.clickToLearn}</p>
                                            </div>
                                            <div className="flip-card-back">
                                                <h3>{yoga.name}</h3>
                                                {yoga.steps ? (
                                                    <ul className="step-list">
                                                        {yoga.steps.map((step, sIndex) => (
                                                            <li key={sIndex}>
                                                                <span className="step-num">{common.step} {sIndex + 1}:</span> {step}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>{yoga.description}</p>
                                                )}
                                                <p className="click-hint">{common.clickToFlip}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p>Exercises loading or temporarily unavailable.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrimesterPage;
