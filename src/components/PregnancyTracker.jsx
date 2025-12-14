import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './PregnancyTracker.css';

const PregnancyTracker = ({ lmpDate, userName }) => {
    const { language } = useLanguage();
    const t = translations[language].tracker;

    const stats = useMemo(() => {
        if (!lmpDate) return null;

        const start = new Date(lmpDate);
        const now = new Date();
        const due = new Date(start);
        due.setDate(start.getDate() + 280); // 40 weeks

        const totalDuration = 280 * 24 * 60 * 60 * 1000;
        const elapsed = now - start;

        // Calculations
        let percentage = Math.floor((elapsed / totalDuration) * 100);
        percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0-100

        const daysPassed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const weeksPassed = Math.floor(daysPassed / 7);

        const daysLeft = 280 - daysPassed;
        const monthsLeft = Math.max(0, (daysLeft / 30).toFixed(1));

        // Fruit size logic (Simplified)
        let fruit = "🌱";
        if (weeksPassed > 4) fruit = "🫐"; // Blueberry
        if (weeksPassed > 8) fruit = "🍒"; // Cherry
        if (weeksPassed > 12) fruit = "🍋"; // Lemon
        if (weeksPassed > 16) fruit = "🥑"; // Avocado
        if (weeksPassed > 20) fruit = "🍌"; // Banana
        if (weeksPassed > 24) fruit = "🌽"; // Corn
        if (weeksPassed > 28) fruit = "🍆"; // Eggplant
        if (weeksPassed > 32) fruit = "🥥"; // Coconut
        if (weeksPassed > 36) fruit = "🍉"; // Watermelon

        return {
            percentage,
            monthsLeft,
            weeksPassed,
            dueDate: due.toLocaleDateString(),
            fruit
        };
    }, [lmpDate]);

    if (!stats) return null;

    return (
        <div className="pregnancy-tracker-container animate-fade-in">
            <div className="tracker-header">
                <h2>{t.greeting} {userName && `, ${userName}`}!</h2>
                <div className="baby-fruit-icon">{stats.fruit}</div>
            </div>

            <div className="tracker-card">
                <div className="progress-section">
                    <div className="progress-label">
                        <span>{t.progress}</span>
                        <span className="percentage-text">{stats.percentage}%</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${stats.percentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-item pink-theme">
                        <span className="stat-value">{stats.weeksPassed}</span>
                        <span className="stat-label">{t.weeksPassed}</span>
                    </div>
                    <div className="stat-item purple-theme">
                        <span className="stat-value">{stats.monthsLeft}</span>
                        <span className="stat-label">{t.monthsLeft}</span>
                    </div>
                </div>

                <div className="due-date-chip">
                    📅 {t.deliveryDate}: {stats.dueDate}
                </div>
            </div>
        </div>
    );
};

export default PregnancyTracker;
