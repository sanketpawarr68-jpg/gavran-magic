
import React from 'react';
import Hero from '../components/Hero';
import Profile from '../components/Profile';
import { useUser } from '@clerk/clerk-react';

export default function Home() {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    if (isSignedIn) {
        return <Profile />;
    }

    return (
        <>
            <Hero />
            <section id="features" className="container" style={{ padding: '80px 0' }}>
                <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', textAlign: 'center' }}>
                    <div className="product-card" style={{ padding: '40px', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                        <i className="fas fa-seedling" style={{ fontSize: '3rem', color: 'var(--secondary)', marginBottom: '20px' }}></i>
                        <h3>100% Natural</h3>
                        <p>Made with chemical-free, locally sourced ingredients.</p>
                    </div>
                    <div className="product-card" style={{ padding: '40px', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                        <i className="fas fa-hand-holding-heart" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px' }}></i>
                        <h3>Handmade with Love</h3>
                        <p>Prepared by rural women artisans preserving traditional recipes.</p>
                    </div>
                    <div className="product-card" style={{ padding: '40px', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                        <i className="fas fa-truck-fast" style={{ fontSize: '3rem', color: '#3498db', marginBottom: '20px' }}></i>
                        <h3>Fast Delivery</h3>
                        <p>Delivered fresh across Maharashtra via Shiprocket.</p>
                    </div>
                </div>
            </section>
        </>
    );
}
