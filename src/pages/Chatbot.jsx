import React, { useState, useEffect, useRef } from 'react';
import Robot from '../components/Robot';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Chatbot.css';

const Chatbot = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language];

    const [messages, setMessages] = useState([
        { id: 1, text: t.chatbot.greeting, sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Update greeting when language changes
    useEffect(() => {
        setMessages([
            { id: 1, text: t.chatbot.greeting, sender: 'bot' }
        ]);
    }, [language, t.chatbot.greeting]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const botResponse = generateResponse(inputText);
            const botMessage = {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    // Simple rule-based chatbot logic for demo
    const generateResponse = (input) => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('yoga') || lowerInput.includes('योग') || lowerInput.includes('exercise') || lowerInput.includes('व्यायाम')) {
            return t.chatbot.responses.yoga;
        }
        if (lowerInput.includes('pain') || lowerInput.includes('दर्द') || lowerInput.includes('hurt')) {
            return t.chatbot.responses.pain;
        }
        if (lowerInput.includes('diet') || lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('आहार') || lowerInput.includes('खाना')) {
            return t.chatbot.responses.diet;
        }
        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('नमस्ते') || lowerInput.includes('हैलो')) {
            const name = user ? user.name.split(' ')[0] : (language === 'hi' ? 'दोस्त' : 'friend');
            return t.chatbot.responses.hello.replace('{name}', name);
        }
        return t.chatbot.responses.default;
    };

    return (
        <div className="chatbot-page">
            <div className="chatbot-container">
                <div className="chat-header">
                    <div className="chat-robot-wrapper">
                        <Robot mood={isTyping ? "thinking" : "happy"} scale={0.35} />
                    </div>
                    <div className="chat-header-info">
                        <h2>{t.chatbot.header}</h2>
                        <span className="status-dot"></span> {t.chatbot.online}
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                            <span className="message-time">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message bot typing">
                            <div className="typing-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-area">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t.chatbot.placeholder}
                        className="chat-input"
                    />
                    <button type="submit" className="send-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
