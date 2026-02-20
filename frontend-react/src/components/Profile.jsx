
import React, { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { API_BASE_URL } from '../config';

export default function Profile() {
    const { user } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/orders/user/${user.id}`),
                    axios.get(`${API_BASE_URL}/api/products/`) // Assuming this returns all products
                ]);
                setOrders(ordersRes.data);
                // Just pick 3 random products as "Featured for you"
                const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.products || [];
                setFeaturedProducts(products.sort(() => 0.5 - Math.random()).slice(0, 3));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (!user) return <div className="container" style={{ textAlign: 'center', padding: '50px' }}>Checking access...</div>;

    // Dashboard Styles
    const dashboardGrid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '60px'
    };

    const cardStyle = {
        background: 'white',
        padding: '30px',
        border: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.2s ease'
    };

    return (
        <div className="container" style={{ padding: '60px 0' }}>

            {/* --- Welcome Header --- */}
            <div style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '40px',
                marginBottom: '50px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Welcome, {user.firstName}!</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Ready to taste the magic of Maharashtra today?</p>
                </div>
                {/* <div>xxxxxxxxxx 
                    <SignOutButton>
                        <button className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
                            Log Out
                        </button>
                    </SignOutButton>
                </div> */}
            </div>

            {/* --- Quick Actions --- */}
            <h3 className="section-title" style={{ textAlign: 'left', marginTop: 0 }}>Quick Actions</h3>
            <div style={dashboardGrid}>
                <div style={cardStyle} className="hover-lift">
                    <i className="fas fa-shopping-basket" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px' }}></i>
                    <h3>Start Shopping</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Explore our fresh collection of handmade snacks.</p>
                    <Link to="/shop" className="btn">Browse Products</Link>
                </div>

                <div style={cardStyle} className="hover-lift">
                    <i className="fas fa-truck-fast" style={{ fontSize: '3rem', color: 'var(--secondary)', marginBottom: '20px' }}></i>
                    <h3>Track Orders</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Keep an eye on your delicious deliveries.</p>
                    <Link to="/tracking" className="btn btn-secondary">Track Now</Link>
                </div>

                <div style={cardStyle} className="hover-lift">
                    <i className="fas fa-headset" style={{ fontSize: '3rem', color: '#3498db', marginBottom: '20px' }}></i>
                    <h3>Need Help?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Contact our support for any queries.</p>
                    <a href="mailto:support@gavranmagic.com" className="btn btn-outline">Contact Us</a>
                </div>
            </div>

            {/* --- Recent Orders --- */}
            <h3 className="section-title" style={{ textAlign: 'left' }}>Your Recent Orders</h3>
            {loading ? (
                <p>Loading your history...</p>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                    <p>No orders yet. Why not try our famous Kurdai?</p>
                    <Link to="/shop" className="btn" style={{ marginTop: '20px' }}>Go to Shop</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {orders.slice(0, 3).map(order => ( // Show only last 3
                        <div key={order._id} style={{
                            background: 'var(--bg-card)', padding: '25px', borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)', border: '1px solid #eee', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
                        }}>
                            <div>
                                <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Order #{order._id.slice(-6).toUpperCase()}</strong>
                                <span style={{ display: 'block', fontSize: '0.9rem', color: '#777' }}>
                                    Placed on {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>{order.products.length} Items</span>
                                <span style={{ margin: '0 10px', color: '#ddd' }}>|</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{order.total_price}</span>
                            </div>
                            <div>
                                <span className="weight-badge" style={{
                                    background: getStatusBg(order.order_status),
                                    color: getStatusColorOriginal(order.order_status)
                                }}>
                                    {order.order_status}
                                </span>
                            </div>
                            <Link to={`/tracking/${order._id}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>View Details</Link>
                        </div>
                    ))}
                    {orders.length > 3 && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button className="btn btn-outline">View All Orders</button>
                        </div>
                    )}
                </div>
            )}

            {/* --- Recommended For You --- */}
            {featuredProducts.length > 0 && (
                <>
                    <h3 className="section-title" style={{ textAlign: 'left', marginTop: '80px' }}>Recommended For You</h3>
                    <div className="products-grid">
                        {featuredProducts.map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </>
            )}

        </div>
    );
}

function getStatusBg(status) {
    switch (status) {
        case 'Placed': return 'rgba(52, 152, 219, 0.1)';
        case 'Delivered': return 'rgba(46, 204, 113, 0.1)';
        case 'Cancelled': return 'rgba(192, 57, 43, 0.1)';
        default: return 'rgba(149, 165, 166, 0.1)';
    }
}

function getStatusColorOriginal(status) {
    switch (status) {
        case 'Placed': return '#3498db';
        case 'Delivered': return '#2ecc71';
        case 'Cancelled': return '#c0392b';
        default: return '#95a5a6';
    }
}
