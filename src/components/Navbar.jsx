import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
    const { t } = useTranslation(['common', 'pages']);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

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

    const navLinks = user?.role === 'asha' ? [
        { name: t('common:navbar.analytics') || 'Dashboard', path: '/Adash' },
        { name: t('common:navbar.findCare'), path: '/find-care' },
    ] : [
        { name: t('common:navbar.home'), path: '/' },
        { name: t('common:navbar.health'), path: '/health' },
        { name: t('common:navbar.yoga'), path: '/yoga' },
        { name: t('common:navbar.findCare'), path: '/find-care' },
    ];

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
                            <span className="logo-main">Matri</span>
                            <span className="logo-accent">Care</span>
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
                                        src={user?.profilePicture || '/matricare-logo.png'}
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
                                        {user?.role === 'asha' && (
                                            <div className="asha-profile-summary">
                                                <div className="summary-item">
                                                    <span className="label">Employee ID:</span>
                                                    <span className="value">{user?.employeeId || 'N/A'}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="label">Village:</span>
                                                    <span className="value">{user?.village || 'N/A'}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="label">Registered:</span>
                                                    <span className="value">{user?.registrationDate || 'N/A'}</span>
                                                </div>
                                                <div className="summary-item assigned-box">
                                                    <span className="label">Patients Managed:</span>
                                                    <span className="value highlighting">{user?.assignedPatients || '0'}</span>
                                                </div>
                                            </div>
                                        )}
                                        <Link to="/settings" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                                            {t('common:navbar.settings') || 'Settings'}
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item logout-item"
                                            onClick={() => {
                                                logout();
                                                setShowProfileDropdown(false);
                                            }}
                                        >
                                            {t('common:buttons.logout') || 'Logout'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="nav-action-link login-btn">
                                {t('common:navbar.login')}
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
                                    <Link to={user?.role === 'asha' ? '/Adash' : '/dashboard'} className="mobile-action-link login-btn" onClick={() => setIsMobileMenuOpen(false)}>
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
                                    {t('common:navbar.login')}
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
