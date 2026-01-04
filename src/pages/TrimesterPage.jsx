import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
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

    // Content for 1st trimester
    const firstTrimesterTips = [
        {
            title: "Learn Under a Qualified Teacher",
            content: "Learn these asanas under expert guidance rather than just watching videos."
        },
        {
            title: "Continue with Your Practice",
            content: "Experienced yogis can continue practice with gentle modifications."
        },
        {
            title: "Be Gentle with Your Body",
            content: "Focus on gentle practice as the fetus is still implanting. Use props for balance."
        },
        {
            title: "Adjust Your Practice",
            content: "Avoid inversions, closed twists, and deep backbends that compress the uterus."
        },
        {
            title: "Relax into Mindfulness",
            content: "Allot sufficient time for relaxation and focused breathing meditation."
        },
        {
            title: "Trust in Yourself",
            content: "Use yoga to discover your body's strength and trust your instincts."
        }
    ];

    // Content for 1st trimester - Yoga exercises
    const firstTrimesterYoga = [
        {
            name: "Constructive Rest",
            description: "Lie on back with knees bent, feet wide. Inhale arms into T, exhale hug chest. 20 breaths.",
            image: null
        },
        {
            name: "Child’s Pose (Balasana)",
            description: "On knees, big toes together. Use a pillow. Widen knees for comfort and baby. Rest forehead on block.",
            image: "/yoga_childs_pose.png"
        },
        {
            name: "Downward Facing Dog",
            description: "Hands ahead of shoulders. Lift knees, press legs straight or keep bent. Hold for 10 breaths.",
            image: null
        },
        {
            name: "Side Angle (Parsvakonasana)",
            description: "Wide feet, bend right knee over ankle. Right forearm on thigh, reach left arm over ear. 15 breaths.",
            image: null
        },
        {
            name: "Goddess Pose (Utkata Konasana)",
            description: "Feet wide, toes out 45 deg. Bend knees deeply, thighs parallel to floor. 10 breaths.",
            image: "/yoga_malasana.png"
        }
    ];

    // Content for 2nd trimester - Tips
    const secondTrimesterTips = [
        {
            title: "Build Strength and Stamina",
            content: "Use this 'golden period' to build leg strength and improve balance."
        },
        {
            title: "Open Your Hips",
            content: "Practice gentle hip openers like Goddess Pose to prepare for childbirth."
        },
        {
            title: "Maintain Good Posture",
            content: "Strengthen your back to support your growing belly and prevent pair."
        },
        {
            title: "Avoid Deep Twists",
            content: "Twist only from the shoulders, never the belly, to avoid compression."
        },
        {
            title: "Stay Hydrated",
            content: "Drink plenty of water before and after practice. Your body needs extra fluids."
        },
        {
            title: "Listen to Your Body",
            content: "Rest when needed and honor your limits as your body changes daily."
        }
    ];

    // Content for 2nd trimester - Yoga exercises
    const secondTrimesterYoga = [
        {
            name: "Tree Pose (Vrksasana)",
            description: "Bend left knee, place foot above/below right knee. Hands in prayer then reach overhead. 10 breaths.",
            image: "/yoga_tree.png"
        },
        {
            name: "Side Plank (Vasisthasana)",
            description: "Start on all fours, extend right leg. Place left hand under shoulder. Reach right arm up. 10 breaths.",
            image: null
        },
        {
            name: "Supported Fish (Matsyasana)",
            description: "Blocks under shoulders/head. Lower back onto blocks. Arms out, palms up. Hold for 25 breaths.",
            image: null
        },
        {
            name: "Wide Straddle",
            description: "Seated, legs wide. Use blocks/bolster for pillow. Fold forward, rest on bolster. 30 breaths.",
            image: null
        },
        {
            name: "Warrior Pose (Virabhadrasana)",
            description: "Feet wide, bend right knee over ankle. Arms at shoulder height, gaze over right hand. 10 breaths.",
            image: "/yoga_warrior.png"
        }
    ];

    // Content for 3rd trimester - Tips
    const thirdTrimesterTips = [
        {
            title: "Focus on Breathing",
            content: "Practice deep belly breathing to stay calm and prepare for labor contractions."
        },
        {
            title: "Strengthen Pelvic Floor",
            content: "Daily Kegels prepare you for delivery and aid faster postpartum recovery."
        },
        {
            title: "Use Props Generously",
            content: "Use blocks and bolsters for safety and comfort as your belly grows large."
        },
        {
            title: "Practice Relaxation",
            content: "Focus on restorative poses like Side-Lying Shavasana to reduce anxiety."
        },
        {
            title: "Avoid Lying on Back",
            content: "Avoid flat-back poses after 20 weeks to prevent blood vessel compression."
        },
        {
            title: "Prepare for Labor",
            content: "Practice squats and pelvic tilts to help baby move into optimal position."
        }
    ];

    // Content for 3rd trimester - Yoga exercises
    const thirdTrimesterYoga = [
        {
            name: "Easy Pose (Sukhasana)",
            description: "Seated, cross legs. Reach arms out, roll wrists in circles (5 breaths each side). Total 20 breaths.",
            image: "/yoga_kegels.png"
        },
        {
            name: "Wide Chair Pose (Utkatasana)",
            description: "Feet hip-width, reach arms up. Bend knees, shift hips back like sitting. Hold for 25 breaths.",
            image: null
        },
        {
            name: "Dynamic Goddess (Utkata Konasana)",
            description: "Feet wide, bend knees deeply. arms at 90 deg. Repeat 5x, on 5th hold for 10 breaths.",
            image: null
        },
        {
            name: "Tabletop Hammock Rocks",
            description: "On hands/knees. Shift forward on inhale, back on exhale. Rock baby with breath for 20 breaths.",
            image: "/yoga_cat_cow.png"
        },
        {
            name: "Upper Back Opener",
            description: "Kneel before chair, elbows on seat. Fingertips up, head between arms, chest to ground. 20 breaths.",
            image: null
        }
    ];

    const [selectedOption, setSelectedOption] = React.useState('tips');
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
                    ← Back to Trimesters
                </button>

                <div className="trimester-page-header">
                    <h1>{trimesterTitles[id] || 'Trimester'}</h1>
                </div>

                {id === '1' ? (
                    <div className="yoga-content">
                        {/* Option Selector */}
                        <div className="option-selector">
                            <button
                                className={`option-btn ${selectedOption === 'tips' ? 'active' : ''}`}
                                onClick={() => setSelectedOption('tips')}
                            >
                                YOGA TIPS
                            </button>
                            <button
                                className={`option-btn ${selectedOption === 'yoga' ? 'active' : ''}`}
                                onClick={() => setSelectedOption('yoga')}
                            >
                                YOGA EXERCISES
                            </button>
                        </div>

                        {/* Yoga Tips Section */}
                        {selectedOption === 'tips' && (
                            <div className="tips-section">
                                <div className="tips-grid-vertical">
                                    {firstTrimesterTips.map((tip, index) => (
                                        <div key={index} className="tip-card">
                                            <h3>{tip.title}</h3>
                                            <p>{tip.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Yoga Exercises Section with Flip Cards */}
                        {selectedOption === 'yoga' && (
                            <div className="yoga-section">
                                <div className="flip-cards-grid">
                                    {firstTrimesterYoga.map((yoga, index) => (
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
                                                    <p className="click-hint">Click to learn more</p>
                                                </div>
                                                <div className="flip-card-back">
                                                    <h3>{yoga.name}</h3>
                                                    <p>{yoga.description}</p>
                                                    <p className="click-hint">Click to flip back</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : id === '2' ? (
                    <div className="yoga-content">
                        {/* Option Selector */}
                        <div className="option-selector">
                            <button
                                className={`option-btn ${selectedOption === 'tips' ? 'active' : ''}`}
                                onClick={() => setSelectedOption('tips')}
                            >
                                YOGA TIPS
                            </button>
                            <button
                                className={`option-btn ${selectedOption === 'yoga' ? 'active' : ''}`}
                                onClick={() => setSelectedOption('yoga')}
                            >
                                YOGA EXERCISES
                            </button>
                        </div>

                        {/* Yoga Tips Section */}
                        {selectedOption === 'tips' && (
                            <div className="tips-section">
                                <div className="tips-grid-vertical">
                                    {secondTrimesterTips.map((tip, index) => (
                                        <div key={index} className="tip-card">
                                            <h3>{tip.title}</h3>
                                            <p>{tip.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Yoga Exercises Section with Flip Cards */}
                        {selectedOption === 'yoga' && (
                            <div className="yoga-section">
                                <div className="flip-cards-grid">
                                    {secondTrimesterYoga.map((yoga, index) => (
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
                                                    <p className="click-hint">Click to learn more</p>
                                                </div>
                                                <div className="flip-card-back">
                                                    <h3>{yoga.name}</h3>
                                                    <p>{yoga.description}</p>
                                                    <p className="click-hint">Click to flip back</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : id === '3' ? (
                    <div className="yoga-content">
                        {/* Option Selector */}
                        <div className="option-selector">
                            <button
                                className={`option-btn ${selectedOption === 'tips' ? 'active' : ''}`}
                                onClick={() => setSelectedOption('tips')}
                            >
                                YOGA TIPS
                            </button>
                            <button
                                className={`option-btn ${selectedOption === 'yoga' ? 'active' : ''}`}
                                onClick={() => setSelectedOption('yoga')}
                            >
                                YOGA EXERCISES
                            </button>
                        </div>

                        {/* Yoga Tips Section */}
                        {selectedOption === 'tips' && (
                            <div className="tips-section">
                                <div className="tips-grid-vertical">
                                    {thirdTrimesterTips.map((tip, index) => (
                                        <div key={index} className="tip-card">
                                            <h3>{tip.title}</h3>
                                            <p>{tip.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Yoga Exercises Section with Flip Cards */}
                        {selectedOption === 'yoga' && (
                            <div className="yoga-section">
                                <div className="flip-cards-grid">
                                    {thirdTrimesterYoga.map((yoga, index) => (
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
                                                    <p className="click-hint">Click to learn more</p>
                                                </div>
                                                <div className="flip-card-back">
                                                    <h3>{yoga.name}</h3>
                                                    <p>{yoga.description}</p>
                                                    <p className="click-hint">Click to flip back</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="exercises-placeholder">
                        <img src="/yoga-home-icon-new.jpg" alt="Yoga" style={{ width: '80px', marginBottom: '20px' }} />
                        <h2>Exercises Coming Soon</h2>
                        <p>Content for Trimester {id} will be available soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrimesterPage;
