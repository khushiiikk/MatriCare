import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations/translations';
import LanguageSwitcher from './LanguageSwitcher';

import ProfileMenu from './ProfileMenu';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth(); // Get auth state
    const t = translations[language].navbar;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filter nav items based on auth state if needed
    // Currently all items visible, but login link logic will change
    const navItems = [
        { name: t.home, path: '/' },
        { name: t.yoga, path: '/yoga', isScroll: true },
        // Add Chatbot link explicitly here or below
    ];

    // Add Login link only if NOT authenticated
    if (!isAuthenticated) {
        navItems.push({ name: t.login, path: '/login' });
    }

    const isActive = (path) => {
        if (path === '/yoga') return false; // Yoga is a section, not a page
        return location.pathname === path;
    };

    const handleNavigation = (item, e) => {
        if (item.isScroll) {
            e.preventDefault();

            // If not on home page, navigate to home first
            if (location.pathname !== '/') {
                navigate('/');
                // Wait for navigation to complete, then scroll
                setTimeout(() => {
                    scrollToYogaSection();
                }, 100);
            } else {
                scrollToYogaSection();
            }

            setIsMobileMenuOpen(false);
        }
    };

    const scrollToYogaSection = () => {
        const yogaSection = document.getElementById('yoga-section');
        if (yogaSection) {
            const navbarHeight = 80; // Height of navbar
            const offsetPosition = yogaSection.offsetTop - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <img src="/matricare-logo.png" alt="MatriCare Logo" className="logo-image" />
                        <span className="logo-text">
                            <span className="logo-hindi">मातृ</span>
                            <span className="logo-english">Care</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="navbar-menu">
                        {/* Static Links + Chatbot */}
                        <li>
                            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
                                {t.home}
                            </Link>
                        </li>
                        <li>
                            <a
                                href="/#yoga-section"
                                className="navbar-link"
                                onClick={(e) => handleNavigation({ isScroll: true }, e)}
                            >
                                {t.yoga}
                            </a>
                        </li>

                        {/* Chatbot Link */}
                        <li>
                            <Link to="/chatbot" className={`navbar-link ${isActive('/chatbot') ? 'active' : ''}`}>
                                {t.chatbot}
                            </Link>
                        </li>

                        {/* Find Care Link */}
                        <li>
                            <Link to="/find-care" className={`navbar-link ${isActive('/find-care') ? 'active' : ''}`}>
                                Find Care
                            </Link>
                        </li>

                        <li>
                            <Link to="/analytics" className={`navbar-link ${isActive('/analytics') ? 'active' : ''}`}>
                                {t.analytics}
                            </Link>
                        </li>

                        <li>
                            <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>
                                {t.about}
                            </Link>
                        </li>

                        {!isAuthenticated && (
                            <li>
                                <Link to="/login" className={`navbar-link ${isActive('/login') ? 'active' : ''}`}>
                                    {t.login}
                                </Link>
                            </li>
                        )}


                        <li>
                            <LanguageSwitcher />
                        </li>
                        {/* Profile Menu for Desktop */}
                        {isAuthenticated && (
                            <li>
                                <ProfileMenu />
                            </li>
                        )}
                    </ul>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    </button>
                </div>

                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-menu-list">
                        {/* Mobile Profile Menu at top if logged in */}
                        {isAuthenticated && (
                            <li className="mobile-profile-section" style={{ padding: '0 10px 10px' }}>
                                <ProfileMenu />
                            </li>
                        )}

                        {/* Mobile Links */}
                        <li>
                            <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.home}
                            </Link>
                        </li>
                        <li>
                            <a href="/#yoga-section" className="mobile-menu-link" onClick={(e) => {
                                handleNavigation({ isScroll: true }, e);
                                setIsMobileMenuOpen(false);
                            }}>
                                {t.yoga}
                            </a>
                        </li>

                        <li>
                            <Link to="/chatbot" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.chatbot}
                            </Link>
                        </li>

                        <li>
                            <Link to="/analytics" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.analytics}
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.about}
                            </Link>
                        </li>

                        {!isAuthenticated && (
                            <li>
                                <Link to="/login" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t.login}
                                </Link>
                            </li>
                        )}

                        <li className="mobile-lang-switcher" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <LanguageSwitcher />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
