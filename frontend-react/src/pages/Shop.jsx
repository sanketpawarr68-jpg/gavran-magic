import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const CACHE_KEY = 'products_cache';
const CACHE_VERSION_KEY = 'products_cache_version';
const CURRENT_VERSION = 'v8';

// Skeleton card shown while products load
function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-img skeleton-shimmer"></div>
            <div className="skeleton-body">
                <div className="skeleton-line skeleton-shimmer" style={{ width: '70%' }}></div>
                <div className="skeleton-line skeleton-shimmer" style={{ width: '50%' }}></div>
                <div className="skeleton-line skeleton-shimmer" style={{ width: '40%' }}></div>
            </div>
        </div>
    );
}

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverWaking, setServerWaking] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useLanguage();

    const categoryOptions = [
        { key: 'All', label: t('cat_all') },
        { key: 'Kurdai', label: t('cat_kurdai') },
        { key: 'Papad', label: t('cat_papad') },
        { key: 'Shevai', label: t('cat_shevai') },
        { key: 'Masala', label: t('cat_masalas') }
    ];

    const [activeCategoryKey, setActiveCategoryKey] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
            if (cachedVersion !== CURRENT_VERSION) {
                localStorage.removeItem(CACHE_KEY);
                localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
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
        const q = searchQuery.toLowerCase();
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();

        // Simple search expansion: if searching for Marathi words, also search for English equivalents
        let expandedQuery = q;
        if (q.includes('कुरडई')) expandedQuery += ' kurdai';
        if (q.includes('पापड')) expandedQuery += ' papad';
        if (q.includes('शेवई')) expandedQuery += ' shevai';
        if (q.includes('मसाला')) expandedQuery += ' masala';

        const matchesSearch = !searchQuery || 
            expandedQuery.split(' ').some(word => 
                name.includes(word) || desc.includes(word) || cat.includes(word)
            );

        // 2. Category Match
        const prodCat = (p.category || '').toLowerCase();
        const activeKey = activeCategoryKey.toLowerCase();
        const matchesCategory = activeCategoryKey === 'All' || prodCat.includes(activeKey);

        // 3. Smart fallback: if category key doesn't match, try matching original name
        const smartMatch = activeCategoryKey !== 'All' && (
            name.includes(activeKey) || 
            desc.includes(activeKey)
        );

        return matchesSearch && (matchesCategory || smartMatch);
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
                    {t('nav_home') === 'होम' ? 'पुन्हा प्रयत्न करा' : 'Try Again'}
                </button>
            </div>
        );
    }

    return (
        <main className="container fade-in">
            <section className="shop-header" style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px' }}>{t('shop_title')}</h1>
                <p style={{ color: '#666', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 10px' }}>
                    {t('shop_subtitle')}
                    <span style={{ display: 'block', marginTop: '10px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        🚚 {t('delivery_maharashtra')}
                    </span>
                </p>

                {/* New Search Bar */}
                <div className="search-container" style={{ maxWidth: '500px', margin: '0 auto 15px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
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
                    {categoryOptions.map(opt => (
                        <button
                            key={opt.key}
                            className={`filter-chip ${activeCategoryKey === opt.key ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategoryKey(opt.key);
                                if (opt.key === 'All') setSearchQuery('');
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </section>
            {/* Server waking banner */}
            {serverWaking && !products.length && (
                <div className="server-waking-banner" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', padding: '40px' }}>
                    <img src="/images/illus_kitchen.png" alt="Kitchen" style={{ width: '150px', marginBottom: '20px', margin: '0 auto' }} />
                    <div className="waking-spinner" style={{ margin: '15px auto' }}></div>
                    <div>
                        <strong>{t('server_waking')}</strong>
                        <p>{t('server_waking_msg')}</p>
                    </div>
                </div>
            )}

            {loading && !products.length && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div className="spinner"></div>
                    <h3 className="loading-text">{t('loading_products')}</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('loading_msg')}</p>
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
                                <h3>{t('product_not_available')}</h3>
                                <p>{t('preparing_fresh_stock')}</p>
                                <button className="btn" style={{ marginTop: '15px', padding: '10px 25px', background: 'var(--dark)', color: 'white' }} onClick={() => setActiveCategoryKey('All')}>
                                    {t('view_all')}
                                </button>
                            </div>
                        )
                }
            </div>
        </main>
    );
}
