import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { pagesContent } from '../data/pagesContent';
import './Chatbot.css';

const Chatbot = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const content = pagesContent[language]?.chatbot || pagesContent.en.chatbot;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const findIntent = (text) => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('yoga') || lowerText.includes('exercise') || lowerText.includes('trimester') || lowerText.includes('योग')) {
            return {
                text: language === 'hi' ? 'मैं आपको योग अभ्यासों के बारे में दिखा सकती हूं। क्या आप वहां जाना चाहती हैं?' :
                    language === 'mr' ? 'मी तुम्हाला योगासनांबद्दल माहिती देऊ शकते. तुम्हाला तिथे जायचे आहे का?' :
                        language === 'ta' ? 'யோகா பயிற்சிகளை நான் உங்களுக்குக் காட்ட முடியும். நீங்கள் அங்கு செல்ல விரும்புகிறீர்களா?' :
                            "I can help you with yoga exercises. Would you like to go to the Yoga section?",
                action: () => navigate('/yoga'),
                btnText: language === 'hi' ? 'योग पर जाएं' : language === 'mr' ? 'योग वर जा' : language === 'ta' ? 'யோகாவுக்குச் செல்லுங்கள்' : "Go to Yoga"
            };
        }

        if (lowerText.includes('report') || lowerText.includes('analysis') || lowerText.includes('upload') || lowerText.includes('blood') || lowerText.includes('hemoglobin') || lowerText.includes('रिपोर्ट')) {
            return {
                text: language === 'hi' ? 'आप अपनी मेडिकल रिपोर्ट यहां अपलोड कर सकती हैं।' :
                    language === 'mr' ? 'तुम्ही तुमचे मेडिकल रिपोर्ट येथे अपलोड करू शकता.' :
                        language === 'ta' ? 'உங்கள் மருத்துவ அறிக்கைகளை இங்கே பதிவேற்றலாம்.' :
                            "You can upload and analyze your medical reports right here.",
                action: () => navigate('/health'),
                btnText: language === 'hi' ? 'एनालिटिक्स पर जाएं' : language === 'mr' ? 'एनालिटिक्सवर जा' : language === 'ta' ? 'பகுப்பாய்விற்குச் செல்லுங்கள்' : "Go to Analytics"
            };
        }

        if (lowerText.includes('hospital') || lowerText.includes('care') || lowerText.includes('find') || lowerText.includes('asha') || lowerText.includes('doctor') || lowerText.includes('अस्पताल') || lowerText.includes('देखभाल')) {
            return {
                text: language === 'hi' ? 'मैं आपको नजदीकी अस्पताल या स्वास्थ्य केंद्र खोजने में मदद कर सकती हूं।' :
                    language === 'mr' ? 'मी तुम्हाला जवळचे रुग्णालय किंवा आरोग्य केंद्र शोधण्यात मदत करू शकते.' :
                        language === 'ta' ? 'அருகிலுள்ள மருத்துவமனை அல்லது சுகாதார மையத்தைக் கண்டறிய நான் உங்களுக்கு உதவ முடியும்.' :
                            "I can help you find nearby hospitals, ASHA centers, or pharmacies.",
                action: () => navigate('/find-care'),
                btnText: language === 'hi' ? 'केयर खोजें' : language === 'mr' ? 'केअर शोधा' : language === 'ta' ? 'பராமரிப்பைக் கண்டறியவும்' : "Find Care"
            };
        }

        if (lowerText.includes('risk') || lowerText.includes('danger') || lowerText.includes('symptom') || lowerText.includes('pain') || lowerText.includes('जोखिम') || lowerText.includes('लक्षण')) {
            return {
                text: language === 'hi' ? 'गर्भावस्था के जोखिमों और लक्षणों के बारे में अधिक जानें।' :
                    language === 'mr' ? 'गर्भधारणेचे धोके आणि लक्षणांबद्दल अधिक जाणून घ्या.' :
                        language === 'ta' ? 'கர்ப்பகால அபாயங்கள் மற்றும் அறிகுறிகளைப் பற்றி மேலும் அறிக.' :
                            "Learn more about pregnancy risks and critical symptoms to watch out for.",
                action: () => navigate('/pregnancy-risks'),
                btnText: language === 'hi' ? 'जोखिम देखें' : language === 'mr' ? 'धोके पहा' : language === 'ta' ? 'அபாயங்களைக் காண்க' : "View Risks"
            };
        }

        if (lowerText.includes('diet') || lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('खाना') || lowerText.includes('आहार')) {
            return {
                text: language === 'hi' ? 'मैं आपको गर्भावस्था आहार योजना दिखा सकती हूं।' :
                    "I can show you the pregnancy diet plan.",
                action: () => navigate('/diet-plan'),
                btnText: language === 'hi' ? 'आहार योजना देखें' : "View Diet Plan"
            };
        }

        return null;
    };

    const sendMessage = (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        setTimeout(() => {
            const intent = findIntent(text);
            let responseText = language === 'hi' ? "मैं आपकी मदद के लिए यहां हूं!" : "I'm here to help you!";
            let actionBtn = null;

            if (intent) {
                responseText = intent.text;
                actionBtn = { label: intent.btnText, onClick: intent.action };
            }

            const aiMsg = {
                id: Date.now() + 1,
                text: responseText,
                sender: 'ai',
                action: actionBtn
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1200);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        sendMessage(inputText);
    };

    return (
        <div className="chatbot-page-container">
            <div className="cici-gradient-bg"></div>

            <div className="cici-glass-container">
                {/* Header Actions */}
                <div className="cici-header">
                    <button className="icon-btn">✕</button>
                    <span className="header-title">{content.headerTitle}</span>
                    <button className="icon-btn">⋯</button>
                </div>

                {/* Chat Area */}
                <div className="cici-chat-area">
                    {messages.length === 0 ? (
                        <div className="cici-welcome-view">
                            <div className="cici-avatar-large-container">
                                <div className="cici-avatar-halo"></div>
                                <img src="/chatbot-new.jpg" alt="AI" className="cici-avatar-large floating" />
                                <div className="cici-status-indicator"></div>
                            </div>
                            <h1 className="cici-welcome-title">{content.welcomeTitle}</h1>
                            <p className="cici-welcome-subtitle">{content.welcomeSubtitle}</p>

                            <div className="cici-quick-help-grid">
                                <button className="quick-help-btn" onClick={() => navigate('/yoga')}>
                                    <span className="btn-label">{content.quickHelp.yoga}</span>
                                </button>
                                <button className="quick-help-btn" onClick={() => navigate('/health')}>
                                    <span className="btn-label">{content.quickHelp.health}</span>
                                </button>
                                <button className="quick-help-btn" onClick={() => navigate('/find-care')}>
                                    <span className="btn-label">{content.quickHelp.findCare}</span>
                                </button>
                                <button className="quick-help-btn" onClick={() => navigate('/pregnancy-risks')}>
                                    <span className="btn-label">{content.quickHelp.risks}</span>
                                </button>
                            </div>

                            <p className="cici-or-text">{content.orText}</p>
                        </div>
                    ) : (
                        <div className="cici-messages-list">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`cici-message-row ${msg.sender}-row`}>
                                    {msg.sender === 'ai' && (
                                        <div className="cici-avatar-tiny">
                                            <img src="/chatbot-new.jpg" alt="AI" />
                                        </div>
                                    )}
                                    <div className={`cici-bubble ${msg.sender}-bubble`}>
                                        {msg.text}
                                        {msg.action && (
                                            <button
                                                className="cici-action-btn"
                                                onClick={msg.action.onClick}
                                            >
                                                {msg.action.label}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="cici-message-row ai-row">
                                    <div className="cici-avatar-tiny">
                                        <img src="/chatbot-new.jpg" alt="AI" />
                                    </div>
                                    <div className="cici-bubble ai-bubble typing-wave">
                                        <span>•</span><span>•</span><span>•</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form className="cici-input-bar" onSubmit={handleSendMessage}>
                    <button type="button" className="cici-input-icon">AI</button>
                    <input
                        type="text"
                        placeholder={content.placeholder}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="cici-send-btn" disabled={!inputText.trim()}>
                        ➔
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
