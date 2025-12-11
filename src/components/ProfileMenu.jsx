import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // Inherit navbar styles

const ProfileMenu = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    if (!user) return null;

    // Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="profile-menu-container" ref={menuRef}>
            <button
                className="profile-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="profile-avatar" />
                ) : (
                    <div className="profile-avatar-placeholder">
                        {getInitials(user.name)}
                    </div>
                )}
                <span className="profile-name-short">{user.name.split(' ')[0]}</span>
                <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="profile-dropdown">
                    <div className="dropdown-header">
                        <div className="user-info">
                            <p className="user-name">{user.name}</p>
                            <p className="user-mobile">{user.mobile}</p>
                        </div>
                    </div>
                    <ul className="dropdown-list">
                        <li>
                            <Link to="/settings" onClick={() => setIsOpen(false)}>
                                ⚙️ Settings
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="logout-btn">
                                🚪 Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;
