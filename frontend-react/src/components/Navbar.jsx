import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import '../index.css';

export default function Navbar() {
    const { isSignedIn, user, logout } = useAuth();
    const { cartCount } = useCart();
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        function handleKeyOrClick(event) {
            if (event.key === 'Escape') {
                setShowUserDropdown(false);
                setIsOpen(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleKeyOrClick);
        document.addEventListener("keydown", handleKeyOrClick);
        return () => {
            document.removeEventListener("mousedown", handleKeyOrClick);
            document.removeEventListener("keydown", handleKeyOrClick);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserDropdown(false);
        setIsOpen(false);
        navigate('/');
    };

    // Close nav when a normal link is clicked (but NOT for avatar li)
    const handleNavLinkClick = () => {
        setIsOpen(false);
        setShowUserDropdown(false);
    };

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.phone ? '#' : 'U');

    return (
        <header className="site-header">
            <div className="container">
                <nav>
                    {/* Logo - Breakthrough styling for prominent brand presence */}
                    <Link to="/" className="logo-breakout-container" onClick={handleNavLinkClick}>
                        <img
                            src="/images/company_logo.jpg"
                            alt="Gavran Magic Foods"
                            className="logo-breakout-img"
                        />
                    </Link>


                    {/* Nav Links — Main navigation links */}
                    <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
                        <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>{t('nav_home')}</NavLink></li>
                        <li><NavLink to="/shop" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>{t('nav_shop')}</NavLink></li>
                        <li>
                            <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>
                                {t('nav_cart')} {cartCount > 0 && <span id="cart-count">{cartCount}</span>}
                            </NavLink>
                        </li>
                        <li><NavLink to="/tracking" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>{t('nav_track')}</NavLink></li>
                        
                        {/* Profile inside Mobile Menu (Bottom) */}
                        {isSignedIn && (
                            <li className="mobile-only-profile">
                                <Link to="/profile" className="mobile-profile-link" onClick={handleNavLinkClick}>
                                    <div className="user-avatar-circle mini">{userInitial}</div>
                                    <span>{t('nav_profile')}</span>
                                </Link>
                                <button onClick={handleLogout} className="mobile-logout-btn">
                                    <i className="fas fa-sign-out-alt"></i> {t('nav_logout')}
                                </button>
                            </li>
                        )}
                    </ul>

                    {/* Nav Actions — Profile (Desktop), Lang, Hamburger */}
                    <div className="nav-actions">
                        {isSignedIn ? (
                            <div className="user-profile-item desktop-only-profile" ref={dropdownRef}>
                                <div
                                    className="mobile-user-row"
                                    onClick={() => {
                                        setShowUserDropdown(prev => !prev);
                                    }}
                                >
                                    <div className="user-avatar-circle">{userInitial}</div>
                                    <span className="user-name-text">{user?.name || user?.phone || 'My Account'}</span>
                                    <i className={`fas fa-chevron-${showUserDropdown ? 'up' : 'down'} user-chevron`}></i>
                                </div>

                                <div className={`user-dropdown-menu ${showUserDropdown ? 'show' : ''}`}>
                                    <div className="dropdown-header">
                                        <strong>{user.name || 'User'}</strong>
                                        <span>{user.phone}</span>
                                    </div>
                                    <Link to="/profile" className="dropdown-item" onClick={handleNavLinkClick}>
                                        <i className="fas fa-user-edit"></i> {t('nav_profile')}
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item logout-item">
                                        <i className="fas fa-sign-out-alt"></i> {t('nav_logout')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary desktop-only-profile" id="navbar-signin-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={handleNavLinkClick}>
                                {t('nav_signin')}
                            </Link>
                        )}

                        <button 
                            className="lang-toggle-btn" 
                            onClick={() => setLanguage(language === 'EN' ? 'MR' : 'EN')}
                            title={language === 'EN' ? "Switch to Marathi" : "Switch to English"}
                        >
                            <i className="fas fa-globe"></i>
                            {language === 'EN' ? 'MR' : 'EN'}
                        </button>

                        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
                            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
