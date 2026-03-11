
import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <section className="hero">
            <div className="container">
                <h1>Authentic Taste of Maharashtra</h1>
                <p>Experience the joy of handmade Vermicelli, crispy Kurdai, and traditional Papad delivered straight to your doorstep.</p>
                <div className="hero-actions" style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link to="/shop" className="btn btn-primary">Shop Now</Link>
                    <a href="#features" className="btn btn-outline" style={{ border: '2.5px solid white', color: 'white' }}>Learn More</a>
                </div>
            </div>
        </section>
    );
}
