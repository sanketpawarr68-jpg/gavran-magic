import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../config';

export default function Home() {
    const { loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/products`);
                // Get active products and take first 4 as "featured"
                const active = response.data.filter(p => p.status !== 'inactive').slice(0, 4);
                setFeaturedProducts(active);
            } catch (error) {
                console.error("Error fetching featured products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchFeatured();
    }, []);

    if (authLoading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    return (
        <div className="fade-in">
            <Hero />

            {/* Featured Products Section */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                        <div>
                            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>{t('featured_title')}</h2>
                            <p style={{ color: '#666', fontSize: '1.1rem' }}>{t('featured_subtitle')}</p>
                        </div>
                        <Link to="/shop" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {t('view_all')} <i className="fas fa-arrow-right-long"></i>
                        </Link>
                    </div>

                    {loadingProducts ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section id="features" className="container" style={{ padding: '60px 0' }}>
                <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <img src="/images/illus_natural.png" alt="Natural" className="illustration-icon" />
                        <h3>{t('feature_natural')}</h3>
                        <p>{t('feature_natural_desc')}</p>
                    </div>
                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <img src="/images/illus_craft.png" alt="Handmade" className="illustration-icon" />
                        <h3>{t('feature_rural')}</h3>
                        <p>{t('feature_rural_desc')}</p>
                    </div>
                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <img src="/images/illus_delivery.png" alt="Delivery" className="illustration-icon" />
                        <h3>{t('feature_fresh')}</h3>
                        <p>{t('feature_fresh_desc')}</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '80px 0', background: '#f8fafc' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.2rem', fontWeight: 800 }}>{t('testimonials_title')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        {[1, 2, 3].map(id => (
                            <div key={id} style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'relative' }}>
                                <i className="fas fa-quote-left" style={{ position: 'absolute', top: '20px', left: '25px', fontSize: '2rem', color: '#eee' }}></i>
                                <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '25px', position: 'relative', zIndex: 1, color: '#444' }}>
                                    "{t(`testimonial_${id}_text`)}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        {t(`testimonial_${id}_name`).charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{t(`testimonial_${id}_name`)}</h4>
                                        <div style={{ color: '#f1c40f', fontSize: '0.8rem' }}>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
