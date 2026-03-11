import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';

const CACHE_KEY = 'products_cache';
const CACHE_VERSION_KEY = 'products_cache_version';
const CURRENT_VERSION = 'v7';

// Skeleton card shown while products load
function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-img skeleton-pulse"></div>
            <div className="skeleton-body">
                <div className="skeleton-line skeleton-pulse" style={{ width: '70%' }}></div>
                <div className="skeleton-line skeleton-pulse" style={{ width: '50%', marginTop: '8px' }}></div>
                <div className="skeleton-line skeleton-pulse" style={{ width: '40%', marginTop: '16px' }}></div>
            </div>

        </div>
    );
}

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverWaking, setServerWaking] = useState(false);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Handmade Kurdai', 'Traditional Papad', 'Vermicelli (Shevai)', 'Traditional Masalas'];

    useEffect(() => {
        const fetchProducts = async () => {
            // ... (keep cache logic)
            const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
            if (cachedVersion !== CURRENT_VERSION) {
                localStorage.removeItem(CACHE_KEY);
                localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
            }

            const cachedProducts = localStorage.getItem(CACHE_KEY);
            if (cachedProducts) {
                try {
                    const parsed = JSON.parse(cachedProducts);
                    const fixed = parsed.map(p => ({
                        ...p,
                        image: p.image?.replace('garvran-magic.netlify.app', 'gavran-magic.netlify.app')
                    }));
                    const filtered = fixed.filter(p => p.status === 'active' || p.status === undefined);
                    setProducts(filtered);
                    setLoading(false);
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            const wakingTimer = setTimeout(() => {
                setServerWaking(true);
            }, 3000);

            try {
                const response = await axios.get(`${API_BASE_URL}/api/products/`, {
                    timeout: 60000
                });
                const data = Array.isArray(response.data) ? response.data : response.data.products || [];
                const fixed = data.map(p => ({
                    ...p,
                    image: p.image?.replace('garvran-magic.netlify.app', 'gavran-magic.netlify.app')
                }));

                const filtered = fixed.filter(p => p.status === 'active' || p.status === undefined);

                setProducts(filtered);
                localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
            } catch (err) {
                if (!products.length) {
                    setError(err.message);
                }
            } finally {
                clearTimeout(wakingTimer);
                setServerWaking(false);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category === activeCategory);

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '80px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
                <h3 style={{ marginBottom: '8px' }}>Could not load products</h3>
                <p style={{ color: '#888', marginBottom: '20px' }}>
                    The server might be down. Please try again.
                </p>
                <button className="btn btn-primary" onClick={() => { setError(null); setLoading(true); window.location.reload(); }}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <main className="container fade-in">
            <h1 className="section-title" style={{ marginTop: '40px' }}>Gavran Magic Shop</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Authentic Maharashtrian Homemade Delicacies</p>

            {/* Maharashtra Delivery Notice */}
            <div className="delivery-notice">
                <i className="fas fa-truck-moving"></i>
                <span>Fast Delivery Available All Across <strong>Maharashtra</strong></span>
            </div>

            {/* Category Filters */}
            <div className="category-filters">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Server waking banner */}
            {serverWaking && !products.length && (
                <div className="server-waking-banner">
                    <div className="waking-spinner"></div>
                    <div>
                        <strong>Server is starting up...</strong>
                        <p>Our traditional kitchen is preparing the catalog. Please wait ~30 seconds. ☕</p>
                    </div>
                </div>
            )}

            <div className="products-grid">
                {loading && !products.length
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : filteredProducts.length > 0
                        ? filteredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                        : (
                            <div className="no-results" style={{ gridColumn: '1/-1' }}>
                                <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: '15px', color: '#ddd' }}></i>
                                <h3>No products found in this category</h3>
                                <p>Try checking "All" products for our full collection.</p>
                                <button className="btn btn-sm" style={{ marginTop: '15px', background: '#f5f5f5' }} onClick={() => setActiveCategory('All')}>
                                    View All Products
                                </button>
                            </div>
                        )
                }
            </div>
        </main>
    );
}
