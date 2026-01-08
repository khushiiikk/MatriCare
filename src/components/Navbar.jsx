import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { language } = useLanguage();
    const t = translations[language]?.navbar || {};

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-menu-container')) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navLinks = [
        { name: t.home, path: '/' },
        { name: t.health, path: '/health' },
        { name: t.yoga, path: '/yoga' },
        { name: t.findCare, path: '/find-care' },
    ].filter(link => {
        if (user?.role === 'asha' && link.path === '/yoga') return false;
        return true;
    });

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-content">
                    {/* Left: Logos Group */}
                    <div className="logos-group">
                        <div className="college-logo-container">
                            <img src="/iit-delhi-logo.png" alt="IIT Delhi" className="college-logo circle-logo" />
                        </div>
                        <div className="college-logo-container">
                            <img src="/thapar-university-logo.jpg" alt="Thapar University" className="college-logo circle-logo" />
                        </div>
                        <div className="brand-logo-container">
                            <img src="/matricare-logo.png" alt="MatriCare Logo" className="brand-logo" />
                        </div>
                        <Link to="/" className="navbar-logo-text">
                            <span className="logo-hindi">मातृ</span>
                            <span className="logo-english">Care</span>
                        </Link>
                    </div>

                    {/* Center: Navigation Pill */}
                    <div className="nav-pill-container">
                        <ul className="nav-pill">
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`nav-pill-link ${isActive(link.path) ? 'active' : ''}`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li className="nav-pill-item">
                                <LanguageSwitcher />
                            </li>
                        </ul>
                    </div>

                    {/* Right: Actions */}
                    <div className="nav-actions">
                        {isAuthenticated ? (
                            <div className="profile-menu-container">
                                <button
                                    className="nav-profile-btn"
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                    title="Profile & Settings"
                                >
                                    <img
                                        src={user?.profilePicture || '/default-avatar.png'}
                                        alt="Profile"
                                        className="nav-user-pfp"
                                    />
                                </button>

                                {showProfileDropdown && (
                                    <div className="profile-dropdown-menu">
                                        <div className="dropdown-header">
                                            <span className="dropdown-user-name">{user?.name || 'User'}</span>
                                            <span className="dropdown-user-role">{user?.role === 'asha' ? 'ASHA Worker' : 'Expectant Mother'}</span>
                                        </div>
                                        <Link to="/dashboard" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                                            Dashboard
                                        </Link>
                                        <Link to="/settings" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                                            {t.settings || 'Settings'}
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item logout-item"
                                            onClick={() => {
                                                logout();
                                                setShowProfileDropdown(false);
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="nav-action-link login-btn">
                                {t.login}
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-menu-list">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link to={link.path} className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                        <li className="mobile-actions">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="mobile-action-link login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                                        My Dashboard
                                    </Link>
                                    <Link to="/settings" className="mobile-action-link" onClick={() => setIsMobileMenuOpen(false)}>
                                        Settings
                                    </Link>
                                    <button
                                        className="mobile-action-link logout-btn-mobile"
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="mobile-action-link login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t.login}
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
