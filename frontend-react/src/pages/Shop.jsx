
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            // Try to load from cache first for "instant" feel
            const cachedProducts = localStorage.getItem('products_cache');
            if (cachedProducts) {
                try {
                    setProducts(JSON.parse(cachedProducts));
                    setLoading(false); // Hide loading if we have cached data
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/products/`, {
                    timeout: 20000 // 20s timeout
                });
                const data = Array.isArray(response.data) ? response.data : response.data.products || [];
                setProducts(data);
                localStorage.setItem('products_cache', JSON.stringify(data));
            } catch (err) {
                // Only show error if we don't even have cached data
                if (!products.length) {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
                <h3>Loading tasty products...</h3>
                <p style={{ color: '#666' }}>
                    (Please wait up to 60 seconds if the free server is waking up)
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
                <h3>Error loading products</h3>
                <p>Ensure the backend is running and reachable.</p>
                <p>Check console for details ({error})</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <main className="container">
            <h2 className="section-title">Our Homemade Products</h2>
            <div className="products-grid">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </main>
    );
}
