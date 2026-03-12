import React from 'react';
import Hero from '../components/Hero';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { loading } = useAuth();

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    return (
        <div className="fade-in">
            <Hero />
            <section id="features" className="container" style={{ padding: '60px 0' }}>
                <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <i className="fas fa-seedling" style={{ fontSize: '3.5rem', color: 'var(--secondary)', marginBottom: '30px', display: 'block' }}></i>
                        <h3>100% Natural</h3>
                        <p>Our Kurdai and Papad are made with zero chemicals, using only high-quality locally sourced wheat and spices.</p>
                    </div>
                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <i className="fas fa-hand-holding-heart" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '30px', display: 'block' }}></i>
                        <h3>Rural Craftsmanship</h3>
                        <p>Prepared with love by women artisans in Shrigonda, preserving generations-old traditional recipes.</p>
                    </div>
                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <i className="fas fa-truck-fast" style={{ fontSize: '3.5rem', color: '#3498db', marginBottom: '30px', display: 'block' }}></i>
                        <h3>Fresh to Doorstep</h3>
                        <p>Fast, reliable delivery across all of Maharashtra, ensuring you get the freshest handmade delicacies.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
