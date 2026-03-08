import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';

const CACHE_KEY = 'products_cache';
const CACHE_VERSION_KEY = 'products_cache_version';
const CURRENT_VERSION = 'v5';

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

    useEffect(() => {
        const fetchProducts = async () => {
            // Clear stale cache if version mismatch
            const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
            if (cachedVersion !== CURRENT_VERSION) {
                localStorage.removeItem(CACHE_KEY);
                localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
            }

            // Load from cache instantly — no white flash
            const cachedProducts = localStorage.getItem(CACHE_KEY);
            if (cachedProducts) {
                try {
                    const parsed = JSON.parse(cachedProducts);
                    const fixed = parsed.map(p => ({
                        ...p,
                        image: p.image?.replace('garvran-magic.netlify.app', 'gavran-magic.netlify.app')
                    }));
                    setProducts(fixed);
                    setLoading(false);
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            // Show "server waking" notice only if no cache after 3 seconds
            const wakingTimer = setTimeout(() => {
                setServerWaking(true);
            }, 3000);

            try {
                const response = await axios.get(`${API_BASE_URL}/api/products/`, {
                    timeout: 60000 // 60s — Render free tier can take up to 50s to wake
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
        <main className="container">
            <h2 className="section-title">Our Homemade Products</h2>

            {/* Server waking banner — only shows after 3 seconds of waiting */}
            {serverWaking && !products.length && (
                <div className="server-waking-banner">
                    <div className="waking-spinner"></div>
                    <div>
                        <strong>Server is starting up...</strong>
                        <p>Free server takes ~30 seconds to wake. Please wait ☕</p>
                    </div>
                </div>
            )}

            <div className="products-grid">
                {loading && !products.length
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))
                }
            </div>
        </main>
    );
}
