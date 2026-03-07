import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LocationPicker from './LocationPicker';
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
        navigate('/');
    };

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.phone ? '#' : 'U');

    return (
        <header>
            <div className="container">
                <nav>
                    {/* Logo */}
                    <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
                        <img
                            src="/images/logo.jpg"
                            alt="Gavran Magic"
                            style={{ height: '40px', width: 'auto', borderRadius: '50%' }}
                        />
                        <span>Gavran <span>Magic</span></span>
                    </Link>

                    {/* Location Picker — Amazon style */}
                    <LocationPicker />

                    {/* Hamburger */}
                    <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
                        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </div>

                    {/* Nav Links */}
                    <ul className={`nav-links ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
                        <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
                        <li><NavLink to="/shop" className={({ isActive }) => isActive ? "active" : ""}>Shop</NavLink></li>
                        <li>
                            <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>
                                Cart {cartCount > 0 && <span id="cart-count">{cartCount}</span>}
                            </NavLink>
                        </li>
                        <li><NavLink to="/tracking" className={({ isActive }) => isActive ? "active" : ""}>Track Order</NavLink></li>

                        {isSignedIn ? (
                            <li className="user-profile-item" ref={dropdownRef}>
                                <div
                                    className="user-avatar-circle"
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                >
                                    {userInitial}
                                </div>
                                {showUserDropdown && (
                                    <div className="user-dropdown-menu">
                                        <div className="dropdown-header">
                                            <strong>{user.name || 'User'}</strong>
                                            <span>{user.phone}</span>
                                        </div>
                                        <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                                            <i className="fas fa-user-edit"></i> Profile
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-item">
                                            <i className="fas fa-sign-out-alt"></i> Logout
                                        </button>
                                    </div>
                                )}
                            </li>
                        ) : (
                            <li>
                                <Link to="/login" className="btn btn-primary" id="navbar-signin-btn">Sign In</Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
