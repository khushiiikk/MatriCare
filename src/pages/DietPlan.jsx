import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DietPlan.css';

const DietPlan = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('chart');

    const sevenDayPlan = [
        {
            day: 1,
            early: "Dry fruits (8-12 pcs)",
            breakfast: "Moong dal chilla with chutney",
            midMorning: "Blueberry shake",
            lunch: "Mutton biryani with Raita",
            evening: "Sweet potato salad & Tea",
            dinner: "Wheat dosa with Bitter gourd sabji"
        },
        {
            day: 2,
            early: "Fresh fruit juice",
            breakfast: "Wheat dosa with Tomato sabji",
            midMorning: "Vegetable broccoli soup",
            lunch: "Rice with Chicken & Broccoli",
            evening: "Mixed fruit salad",
            dinner: "Moong dal chilla with chutney"
        },
        {
            day: 3,
            early: "Banana milkshake",
            breakfast: "Veggie upma + 2 Parathas",
            midMorning: "Pumpkin soup",
            lunch: "Mutton biryani with Raita",
            evening: "Dry fruits (10-14 pcs)",
            dinner: "Multigrain toast with 2 Eggs"
        },
        {
            day: 4,
            early: "Carrot juice",
            breakfast: "Oatmeal + 2 Boiled eggs",
            midMorning: "Banana milkshake",
            lunch: "Rice, Mutton, and Masoor dal",
            evening: "Mixed fruit salad",
            dinner: "Veggie poha & Moong dal chillas"
        },
        {
            day: 5,
            early: "Plain glass of milk",
            breakfast: "Veggie poha & Moong dal chillas",
            midMorning: "Tomato soup",
            lunch: "Chicken biryani with Raita",
            evening: "Vegetable salad",
            dinner: "Multigrain toast with 2 Eggs"
        },
        {
            day: 6,
            early: "Banana milkshake",
            breakfast: "Oatmeal + 2 Boiled eggs",
            midMorning: "Pumpkin soup",
            lunch: "Rice, Mutton, and Masoor dal",
            evening: "Dry fruits (10-14 pcs)",
            dinner: "Wheat dosa with Tomato sabji"
        },
        {
            day: 7,
            early: "Plain glass of milk",
            breakfast: "Veggie upma + 2 Parathas",
            midMorning: "Peach milkshake",
            lunch: "Veg khichdi, Chicken, and Dahi",
            evening: "Avocado with Peanut butter",
            dinner: "Veggie poha & Moong dal chillas"
        }
    ];

    const recommendedFoods = [
        { icon: "🥛", title: "Dairy", desc: "Calcium for bone development" },
        { icon: "🫘", title: "Legumes", desc: "Folate, iron, and fiber" },
        { icon: "🥚", title: "Eggs", desc: "High-quality protein & choline" },
        { icon: "🥦", title: "Leafy Greens", desc: "Vitamins A, C, and antioxidants" }
    ];

    return (
        <div className="diet-page-wrapper">
            {/* Background Geometric Shapes */}
            <div className="geo-shape circle-1"></div>
            <div className="geo-shape circle-2"></div>
            <div className="geo-shape square-1"></div>
            <div className="geo-shape square-2"></div>

            <div className="diet-container">
                <header className="diet-header-premium">
                    <button className="back-pill" onClick={() => navigate(-1)}>← Dashboard</button>
                    <h1>Nurture <span className="highlight">Daily</span></h1>
                    <p className="subtitle">Indian Pregnancy Diet Plan by Experts</p>
                </header>

                <div className="diet-tabs-modern">
                    <button
                        className={activeTab === 'chart' ? 'active' : ''}
                        onClick={() => setActiveTab('chart')}
                    >
                        7-Day Chart
                    </button>
                    <button
                        className={activeTab === 'guidelines' ? 'active' : ''}
                        onClick={() => setActiveTab('guidelines')}
                    >
                        Guidelines
                    </button>
                </div>

                <div className="diet-main-content">
                    {activeTab === 'chart' && (
                        <div className="chart-section animate-slide-up">
                            <div className="chart-grid">
                                {sevenDayPlan.map((d) => (
                                    <div key={d.day} className="day-card">
                                        <div className="day-header">
                                            <span className="day-num">Day 0{d.day}</span>
                                        </div>
                                        <div className="meal-segments">
                                            <div className="segment">
                                                <label>Pre-Breakfast</label>
                                                <p>{d.early}</p>
                                            </div>
                                            <div className="segment">
                                                <label>Breakfast</label>
                                                <p>{d.breakfast}</p>
                                            </div>
                                            <div className="segment">
                                                <label>Lunch</label>
                                                <p>{d.lunch}</p>
                                            </div>
                                            <div className="segment">
                                                <label>Dinner</label>
                                                <p>{d.dinner}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'guidelines' && (
                        <div className="guidelines-section animate-fade-in">
                            <div className="guidelines-grid">
                                <div className="guide-card recommendations">
                                    <h3>Foods to Embrace</h3>
                                    <div className="icon-list">
                                        {recommendedFoods.map((f, i) => (
                                            <div key={i} className="icon-item">
                                                <span className="i-box">{f.icon}</span>
                                                <div className="i-text">
                                                    <h4>{f.title}</h4>
                                                    <p>{f.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="guide-card avoided">
                                    <h3>Foods to Avoid</h3>
                                    <ul className="danger-list">
                                        <li>High-Mercury Fish (Raw)</li>
                                        <li>Unpasteurized Milk/Cheese</li>
                                        <li>Raw or Undercooked Eggs</li>
                                        <li>Excessive Caffeine</li>
                                    </ul>
                                    <div className="hydration-badge">
                                        💧 Drink 8-11 glasses of water daily
                                    </div>
                                    <div className="caution-box">
                                        ⚠️ Consult your doctor for specific allergies.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="diet-footer">
                    <p>Source from: <a href="https://www.maxhealthcare.in/blogs/indian-diet-plan-pregnancy" target="_blank" rel="noopener noreferrer">Max Healthcare Blog</a></p>
                </footer>
            </div>
        </div>
    );
};

export default DietPlan;
