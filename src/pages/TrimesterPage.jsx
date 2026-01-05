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
            steps: [
                "Lie on your back with knees bent and feet flat.",
                "Place feet wider than hips.",
                "Let knees lean against each other.",
                "Rest arms by your sides.",
                "Breathe deeply for 20 counts."
            ],
            image: "/yoga_constructive_rest.png"
        },
        {
            name: "Child’s Pose (Balasana)",
            steps: [
                "Kneel on the floor, big toes touching.",
                "Widen knees to make room for your belly.",
                "Sit back on your heels.",
                "Fold forward, resting your forehead on a block or pillow."
            ],
            image: "/yoga_childs_pose.png"
        },
        {
            name: "Downward Facing Dog",
            steps: [
                "Start on hands and knees.",
                "Hands slightly ahead of shoulders.",
                "Lift knees, pressing hips high into an inverted V.",
                "Keep knees slightly bent if needed.",
                "Hold for 10 breaths."
            ],
            image: "/yoga_downward_dog.png"
        },
        {
            name: "Side Angle (Parsvakonasana)",
            steps: [
                "Stand with feet wide apart.",
                "Turn right foot out and bend right knee over ankle.",
                "Place right forearm on right thigh.",
                "Reach left arm over your ear.",
                "Hold for 15 breaths."
            ],
            image: "/yoga_side_angle_pose.png"
        },
        {
            name: "Goddess Pose (Utkata Konasana)",
            steps: [
                "Stand with feet wide, toes pointed out at 45 degrees.",
                "Bend knees deeply, aiming for thighs parallel to the floor.",
                "Bring arms to goalpost shape (90 degrees).",
                "Hold for 10 breaths."
            ],
            image: "/yoga_goddess_pose.png"
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
            steps: [
                "Stand tall and find your balance.",
                "Bend one knee and place the foot on your inner thigh or calf (avoid the knee).",
                "Bring hands to prayer position or reach overhead.",
                "Focus on a point and breathe for 10 counts."
            ],
            image: "/yoga_tree.png"
        },
        {
            name: "Side Plank (Vasisthasana)",
            steps: [
                "Start on all fours (Tabletop position).",
                "Extend your right leg behind you, resting the toes on the floor.",
                "Reach your right arm up towards the ceiling.",
                "Keep your left hand and knee grounded for support.",
                "Hold for 10 breaths."
            ],
            image: "/yoga_side_plank.png"
        },
        {
            name: "Supported Fish (Matsyasana)",
            steps: [
                "Place a bolster or pillow behind you.",
                "Slowly lie back over the support, keeping knees bent or legs extended.",
                "Let your arms fall to the sides, palms facing up.",
                "Open your chest and breathe deeply for 25 breaths."
            ],
            image: "/yoga_supported_fish.png"
        },
        {
            name: "Wide Straddle",
            steps: [
                "Sit with your legs spread wide in a comfortable V-shape.",
                "Place a bolster or cushion in front of you.",
                "Gently fold forward, resting your chest and forehead on the support.",
                "Breathe into your hips for 30 counts."
            ],
            image: "/butterfly-pose.png"
        },
        {
            name: "Warrior Pose (Virabhadrasana)",
            steps: [
                "Stand with feet wide apart.",
                "Turn your right foot out and bend your right knee.",
                "Reach your arms out to the sides at shoulder height.",
                "Gaze over your right hand and hold for 10 breaths."
            ],
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
            steps: [
                "Sit comfortably with legs crossed.",
                "Keep your spine straight and shoulders relaxed.",
                "Reach arms out and roll your wrists slowly.",
                "Breathe deeply for 20 counts."
            ],
            image: "/yoga_kegels.png"
        },
        {
            name: "Wide Chair Pose (Utkatasana)",
            steps: [
                "Stand with feet slightly wider than hip-width.",
                "Reach arms up towards the ceiling.",
                "Bend your knees and shift hips back as if sitting in a chair.",
                "Hold for 25 breaths."
            ],
            image: "/yoga_home-icon-new.jpg"
        },
        {
            name: "Dynamic Goddess (Utkata Konasana)",
            steps: [
                "Stand with feet wide, toes pointed out.",
                "Bend knees deeply and bring arms to 90 degrees.",
                "Inhale to stand back up, exhale to squat.",
                "Repeat 5 times, then hold for 10 breaths."
            ],
            image: "/yoga_malasana.png"
        },
        {
            name: "Tabletop Hammock Rocks",
            steps: [
                "Start on hands and knees (Tabletop).",
                "Shift your weight forward on the inhale.",
                "Gently rock back on the exhale.",
                "Repeat for 20 breaths to gently rock the baby."
            ],
            image: "/yoga_cat_cow.png"
        },
        {
            name: "Upper Back Opener",
            steps: [
                "Kneel in front of a chair, placing elbows on the seat.",
                "Bring palms together, fingertips pointing up.",
                "Gently lower your chest towards the floor.",
                "Hold for 20 breaths."
            ],
            image: "/yoga_childs_pose.png"
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
                                                    {yoga.steps ? (
                                                        <ul className="step-list">
                                                            {yoga.steps.map((step, sIndex) => (
                                                                <li key={sIndex}>
                                                                    <span className="step-num">Step {sIndex + 1}:</span> {step}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>{yoga.description}</p>
                                                    )}
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
                                                    {yoga.steps ? (
                                                        <ul className="step-list">
                                                            {yoga.steps.map((step, sIndex) => (
                                                                <li key={sIndex}>
                                                                    <span className="step-num">Step {sIndex + 1}:</span> {step}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>{yoga.description}</p>
                                                    )}
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
                                                    {yoga.steps ? (
                                                        <ul className="step-list">
                                                            {yoga.steps.map((step, sIndex) => (
                                                                <li key={sIndex}>
                                                                    <span className="step-num">Step {sIndex + 1}:</span> {step}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>{yoga.description}</p>
                                                    )}
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
