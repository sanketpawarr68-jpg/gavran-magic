import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../index.css';

export default function Navbar() {
    const { isSignedIn, user, logout } = useAuth();
    const { cartCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
                    {/* Logo */}
                    <Link to="/" className="logo" onClick={handleNavLinkClick}>
                        <img
                            src="/images/logo.jpg"
                            alt="Gavran Magic"
                            style={{ height: '40px', width: 'auto', borderRadius: '50%' }}
                        />
                        <span>Gavran <span>Magic</span></span>
                    </Link>

                    {/* Hamburger */}
                    <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
                        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </div>

                    {/* Nav Links — NO onClick on the ul itself */}
                    <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
                        <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>Home</NavLink></li>
                        <li><NavLink to="/shop" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>Shop</NavLink></li>
                        <li>
                            <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>
                                Cart {cartCount > 0 && <span id="cart-count">{cartCount}</span>}
                            </NavLink>
                        </li>
                        <li><NavLink to="/tracking" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavLinkClick}>Track Order</NavLink></li>

                        {isSignedIn ? (
                            <li className="user-profile-item" ref={dropdownRef}>
                                {/* Avatar row — clicking avatar toggles the dropdown */}
                                <div
                                    className="mobile-user-row"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowUserDropdown(prev => !prev);
                                    }}
                                >
                                    <div className="user-avatar-circle">{userInitial}</div>
                                    <span className="mobile-user-name">{user?.name || user?.phone || 'My Account'}</span>
                                    <i className={`fas fa-chevron-${showUserDropdown ? 'up' : 'down'} mobile-chevron`}></i>
                                </div>

                                {/* Dropdown — always rendered, shown/hidden by CSS */}
                                <div className={`user-dropdown-menu ${showUserDropdown ? 'show' : ''}`}>
                                    <div className="dropdown-header">
                                        <strong>{user.name || 'User'}</strong>
                                        <span>{user.phone}</span>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="dropdown-item"
                                        onClick={handleNavLinkClick}
                                    >
                                        <i className="fas fa-user-edit"></i> Profile
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item logout-item">
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </div>
                            </li>
                        ) : (
                            <li>
                                <Link to="/login" className="btn btn-primary" id="navbar-signin-btn" onClick={handleNavLinkClick}>Sign In</Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
