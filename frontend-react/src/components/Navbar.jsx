import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import LocationPicker from './LocationPicker';
import '../index.css';

export default function Navbar() {
    const { isSignedIn, isLoaded } = useUser();
    const { cartCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header>
            <div className="container">
                <nav>
                    {/* Logo */}
                    <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
                        <img
                            src="/images/logo.jpg"
                            alt="Gavran Magic"
                            style={{ height: '48px', width: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c0392b' }}
                        />
                        <span style={{ marginLeft: '8px' }}>Gavran <span>Magic</span></span>
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
                        {!isLoaded ? (
                            <li><div style={{ width: '32px', height: '32px', background: '#eee', borderRadius: '50%' }}></div></li>
                        ) : isSignedIn ? (
                            <li><UserButton /></li>
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
