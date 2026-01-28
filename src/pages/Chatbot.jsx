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

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            // Use environment variable for API URL
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    language: language
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.detail || 'Failed to get response');

            const aiMsg = {
                id: Date.now() + 1,
                text: data.response, // Response from Gemini
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: language === 'hi' ? "क्षमा करें, मैं अभी कनेक्ट नहीं कर पा रही हूँ। कृपया बैकएंड की जाँच करें।" :
                    "I'm having trouble connecting to my brain right now. Please check if the backend is running.",
                sender: 'ai',
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
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
