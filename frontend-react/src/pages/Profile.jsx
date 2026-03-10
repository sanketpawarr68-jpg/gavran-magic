import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Profile() {
    const { user, loginWithToken } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: user?.address || '',
        city: user?.city || '',
        pincode: user?.pincode || ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || '',
                city: user.city || '',
                pincode: user.pincode || ''
            });
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/user/${user.id || user._id}`);
            setOrders(response.data);
        } catch (err) {
            console.error("Orders fetch error:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    if (!user) {
        return <div className="loader"></div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('gavran_token');
            const response = await axios.post(`${API_BASE_URL}/api/auth/update-profile`, {
                phone: user.phone,
                ...formData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.user) {
                const wasIncomplete = !user.name || user.name.startsWith('User ');
                loginWithToken(token, response.data.user);
                setMessage('Profile saved successfully!');

                if (wasIncomplete) {
                    setTimeout(() => navigate('/'), 1200);
                }
            }
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'Placed': { bg: '#e1f5fe', text: '#0288d1' },
            'Confirmed': { bg: '#e8f5e9', text: '#2e7d32' },
            'Shipped': { bg: '#fff3e0', text: '#ef6c00' },
            'Delivered': { bg: '#f1f8e9', text: '#33691e' },
            'Cancelled': { bg: '#ffeaf0', text: '#d81b60' },
            'Declined': { bg: '#fff1f0', text: '#cf1322' }
        };
        const style = colors[status] || { bg: '#f5f5f5', text: '#757575' };
        return (
            <span style={{
                background: style.bg,
                color: style.text,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase'
            }}>
                {status}
            </span>
        );
    };

    return (
        <main className="container section-padding">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #eee' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent',
                            fontWeight: '600',
                            color: activeTab === 'profile' ? 'var(--dark)' : '#999',
                            cursor: 'pointer'
                        }}
                    >
                        My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
                            fontWeight: '600',
                            color: activeTab === 'orders' ? 'var(--dark)' : '#999',
                            cursor: 'pointer'
                        }}
                    >
                        Order History ({orders.length})
                    </button>
                </div>

                {activeTab === 'profile' ? (
                    <div className="profile-edit-form">
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div className="user-avatar-circle" style={{
                                width: '100px',
                                height: '100px',
                                fontSize: '3rem',
                                margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, var(--primary) 0%, #e67e22 100%)',
                                border: '4px solid white',
                                boxShadow: '0 10px 20px rgba(211, 84, 0, 0.2)'
                            }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : '#'}
                            </div>
                            <h2>{user.name && !user.name.startsWith('User ') ? 'Personal Information' : 'Complete Your Profile'}</h2>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>Update your shipping and contact details below</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '5px' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address (Optional)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Delivery Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="4"
                                        required
                                        placeholder="Flat/House No, Street, Apartment, Landmark"
                                    ></textarea>
                                </div>

                                <div className="city-pincode-grid">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                            placeholder="6-digit Pincode"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '18px', fontSize: '1rem' }} disabled={loading}>
                                {loading ? 'Saving Changes...' : 'Update Details'}
                            </button>

                            {message && (
                                <div
                                    className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}
                                    style={{ marginTop: '20px' }}
                                >
                                    {message}
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="order-history">
                        {ordersLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div className="spinner"></div>
                                <p style={{ marginTop: '10px', color: '#666' }}>Fetching your orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
                                <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '20px' }}></i>
                                <h3>No Orders Yet</h3>
                                <p style={{ color: '#777', marginBottom: '20px' }}>Your treats are waiting for you in the shop!</p>
                                <button onClick={() => navigate('/shop')} className="btn">Go to Shop</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {orders.map(order => (
                                    <div key={order._id} style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        border: '1px solid #eee',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: '700', color: '#333' }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                                <StatusBadge status={order.order_status} />
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#777' }}>
                                                Placed on {new Date(order.created_at).toLocaleDateString()} • ₹{order.total_price}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/tracking/${order._id}`)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Track
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
