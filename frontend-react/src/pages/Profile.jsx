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

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || '',
                city: user.city || '',
                pincode: user.pincode || ''
            });
        }
    }, [user]);

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
                loginWithToken(token, response.data.user);
                setMessage('Profile saved successfully!');
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container section-padding">
            <div className="profile-edit-form">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div className="user-avatar-circle" style={{ width: '80px', height: '80px', fontSize: '2.5rem', margin: '0 auto 15px' }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : '#'}
                    </div>
                    <h2>{user.name && !user.name.startsWith('User ') ? 'My Profile' : 'Complete Your Profile'}</h2>
                    <p style={{ color: '#666' }}>
                        {user.name && !user.name.startsWith('User ')
                            ? `Welcome back, ${user.name.split(' ')[0]}! 👋`
                            : 'Help us deliver your magic treats better!'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
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
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Delivery Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            required
                            placeholder="House No, Street, Landmark"
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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Profile & Continue'}
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
        </main>
    );
}
