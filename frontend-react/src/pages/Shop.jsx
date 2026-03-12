import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';

const CACHE_KEY = 'products_cache';
const CACHE_VERSION_KEY = 'products_cache_version';
const CURRENT_VERSION = 'v8';

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
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Handmade Kurdai', 'Traditional Papad', 'Vermicelli (Shevai)', 'Traditional Masalas'];

    useEffect(() => {
        const fetchProducts = async () => {
            // ... (keep cache logic)
            const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
            if (cachedVersion !== CURRENT_VERSION) {
                localStorage.removeItem(CACHE_KEY);
                localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
            }

            // We skip loading from cache to ensure the user sees the absolute latest 
            // product statuses (Active/Hidden) from the server immediately.

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

                setProducts(fixed);
                localStorage.setItem(CACHE_KEY, JSON.stringify(fixed));
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

    const filteredProducts = products.filter(p => {
        // 1. Search Query Match
        const matchesSearch = !searchQuery ||
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Category Match
        const prodCat = (p.category || '').toLowerCase().trim();
        const activeCat = activeCategory.toLowerCase().trim();
        const matchesCategory = activeCategory === 'All' || prodCat === activeCat;

        // 3. Keyword fallback if no direct category match (existing logic improved)
        const keywords = activeCategory.toLowerCase()
            .replace(/traditional|handmade|other|\(|\)/g, '')
            .trim()
            .split(' ')
            .filter(w => w.length > 2);

        const smartCatMatch = activeCategory !== 'All' && keywords.some(word =>
            p.name?.toLowerCase().includes(word) ||
            p.description?.toLowerCase().includes(word)
        );

        return matchesSearch && (matchesCategory || smartCatMatch);
    });

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
            <section className="shop-header" style={{ textAlign: 'center', padding: '60px 0 40px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '15px' }}>Our Traditional Kitchen</h1>
                <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px' }}>
                    Authentic handmade Maharashtrian delicacies prepared with love and tradition.
                    <span style={{ display: 'block', marginTop: '10px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        🚚 Delivery across all of Maharashtra
                    </span>
                </p>

                {/* New Search Bar */}
                <div className="search-container" style={{ maxWidth: '500px', margin: '0 auto 30px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search for Kurdai, Papad, Masala..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 50px 16px 25px',
                            borderRadius: '50px',
                            border: '2px solid #eee',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s',
                            background: '#fff',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#eee'}
                    />
                    <i className="fas fa-search" style={{
                        position: 'absolute',
                        right: '25px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#999'
                    }}></i>
                </div>

                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(cat);
                                if (cat === 'All') setSearchQuery('');
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>
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
                                <h3>Product is Currently Not Available</h3>
                                <p>We are currently preparing fresh stock. Try checking "All" products.</p>
                                <button className="btn" style={{ marginTop: '15px', padding: '10px 25px', background: 'var(--dark)', color: 'white' }} onClick={() => setActiveCategory('All')}>
                                    View All Products
                                </button>
                            </div>
                        )
                }
            </div>
        </main>
    );
}
