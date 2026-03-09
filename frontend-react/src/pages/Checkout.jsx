import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';


const CheckoutSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Required'),
    address: Yup.string().required('Required'),
    city: Yup.string().required('Required'),
    pincode: Yup.string().matches(/^[4][0-9]{5}$/, 'Must start with 4 and be 6 digits').required('Required'),
    paymentMethod: Yup.string().required('Please select a payment method'),
});

export default function Checkout() {
    const { cart, total, clearCart, getEffectivePrice } = useCart();
    const { user, isSignedIn, loading } = useAuth();
    const navigate = useNavigate();

    const [shippingInfo, setShippingInfo] = useState(null);
    const [loadingShipping, setLoadingShipping] = useState(false);

    const [addressMode, setAddressMode] = useState(user && user.address ? 'profile' : 'manual');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState('');

    const handleLocationDetect = () => {
        setGpsLoading(true);
        setGpsError('');
        if (!navigator.geolocation) {
            setGpsError('Geolocation not supported by your browser.');
            setGpsLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const data = await res.json();

                    const city = data.address.city || data.address.town || data.address.village || data.address.district || '';
                    const address = data.display_name.split(',').slice(0, 3).join(',').trim();
                    const postcode = data.address.postcode || '';

                    formik.setFieldValue('address', address);
                    formik.setFieldValue('city', city);
                    formik.setFieldValue('pincode', postcode);
                } catch (err) {
                    setGpsError('Could not auto-fill location. Please check internet.');
                } finally {
                    setGpsLoading(false);
                }
            },
            () => {
                setGpsError('Location access denied. Please enter manually.');
                setGpsLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleAddressModeChange = (mode, addrObj = null) => {
        setAddressMode(mode);
        setGpsError('');

        if (mode === 'profile' && user) {
            formik.setFieldValue('address', user.address || '');
            formik.setFieldValue('city', user.city || '');
            formik.setFieldValue('pincode', user.pincode || '');
        } else if (mode.startsWith('saved_') && addrObj) {
            formik.setFieldValue('address', addrObj.address);
            formik.setFieldValue('city', addrObj.city);
            formik.setFieldValue('pincode', addrObj.pincode);
        } else if (mode === 'current') {
            formik.setFieldValue('address', '');
            formik.setFieldValue('city', '');
            formik.setFieldValue('pincode', '');
            handleLocationDetect();
        } else if (mode === 'manual') {
            formik.setFieldValue('address', '');
            formik.setFieldValue('city', '');
            formik.setFieldValue('pincode', '');
        }
    };

    const fetchShippingCost = async (pincode, isCOD) => {
        if (!/^[4][0-9]{5}$/.test(pincode)) return;

        setLoadingShipping(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/orders/shipping-cost`, {
                pincode: pincode,
                weight: 0.5,
                cod: isCOD ? 1 : 0
            });
            setShippingInfo(response.data);
        } catch (error) {
            console.error("Shipping Rate Error:", error);
            setShippingInfo(null);
        } finally {
            setLoadingShipping(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            name: user ? user.name || '' : '',
            phone: user ? user.phone || '' : '',
            address: user ? user.address || '' : '',
            city: user ? user.city || '' : '',
            pincode: user ? user.pincode || '' : '',
            paymentMethod: 'COD',
            saveAddressToProfile: true,
        },
        enableReinitialize: true,
        validationSchema: CheckoutSchema,
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const orderData = {
                    user_id: user ? (user._id || user.id) : 'guest',
                    name: values.name,
                    phone: values.phone,
                    address: values.address,
                    city: values.city,
                    pincode: values.pincode,
                    payment_method: values.paymentMethod,
                    products: cart.map(item => ({
                        product_id: item._id,
                        quantity: item.quantity,
                        price: getEffectivePrice(item),
                        name: item.name
                    })),
                    total_price: total + (shippingInfo ? shippingInfo.total_shipping : 0)
                };

                if (values.saveAddressToProfile && user) {
                    const token = localStorage.getItem('gavran_token');
                    if (token) {
                        try {
                            await axios.post(`${API_BASE_URL}/api/auth/update-profile`, {
                                phone: user.phone,
                                save_as_new_address: true,
                                address: values.address,
                                city: values.city,
                                pincode: values.pincode
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        } catch (err) {
                            console.error('Silent profile update error:', err);
                        }
                    }
                }

                const response = await axios.post(`${API_BASE_URL}/api/orders/`, orderData);

                if (response.data && response.data.order_id) {
                    clearCart();
                    navigate(`/tracking/${response.data.order_id}`);
                } else {
                    setStatus("Order placed but no ID returned.");
                }
            } catch (error) {
                console.error("Order Error:", error);
                setStatus(error.response?.data?.message || 'Order failed. Please try again.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        if (formik.values.pincode.length === 6) {
            fetchShippingCost(formik.values.pincode, formik.values.paymentMethod === 'COD');
        }
    }, [formik.values.pincode, formik.values.paymentMethod]);

    if (loading) return <div className="loader"></div>;

    if (!isSignedIn) {
        navigate('/login?redirect=/checkout');
        return <p>Please sign in to checkout...</p>;
    }

    return (
        <main style={{ minHeight: '100vh', background: '#f4f6f8', padding: '60px 20px', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>Checkout</h1>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Complete your Gavran Magic order securely.</p>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                        {/* LEFT COLUMN: Forms */}
                        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                            {/* SECTION: Personal Details */}
                            <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#222', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
                                    Contact Information
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Full Name</label>
                                        <input type="text" id="name" {...formik.getFieldProps('name')} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e1e4e8', background: '#f9fafb', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }} placeholder="John Doe" />
                                        {formik.touched.name && formik.errors.name && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '6px' }}>{formik.errors.name}</div>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Phone Number</label>
                                        <input type="text" id="phone" {...formik.getFieldProps('phone')} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e1e4e8', background: '#f9fafb', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }} placeholder="10-digit number" />
                                        {formik.touched.phone && formik.errors.phone && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '6px' }}>{formik.errors.phone}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: Delivery Address */}
                            <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#222', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
                                    Where should we deliver?
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                    {/* Profile Default */}
                                    {user && user.address && (
                                        <div onClick={() => handleAddressModeChange('profile')} style={{ padding: '20px', borderRadius: '16px', border: addressMode === 'profile' ? '2px solid var(--primary)' : '2px solid #f0f0f0', background: addressMode === 'profile' ? '#fffbf5' : '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                                            {addressMode === 'profile' && <i className="fas fa-check-circle" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>}
                                            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1a1a1a', marginBottom: '8px' }}><i className="fas fa-home" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>Home</div>
                                            <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>{user.address}<br />{user.city} - {user.pincode}</div>
                                        </div>
                                    )}

                                    {/* Saved Addresses */}
                                    {user?.saved_addresses?.map((addr, idx) => (
                                        <div key={idx} onClick={() => handleAddressModeChange(`saved_${idx}`, addr)} style={{ padding: '20px', borderRadius: '16px', border: addressMode === `saved_${idx}` ? '2px solid var(--primary)' : '2px solid #f0f0f0', background: addressMode === `saved_${idx}` ? '#fffbf5' : '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                                            {addressMode === `saved_${idx}` && <i className="fas fa-check-circle" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>}
                                            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1a1a1a', marginBottom: '8px' }}><i className="fas fa-bookmark" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>Saved {idx + 1}</div>
                                            <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>{addr.address}<br />{addr.city} - {addr.pincode}</div>
                                        </div>
                                    ))}

                                    {/* Current Location */}
                                    <div onClick={() => handleAddressModeChange('current')} style={{ padding: '20px', borderRadius: '16px', border: addressMode === 'current' ? '2px solid var(--primary)' : '2px solid #f0f0f0', background: addressMode === 'current' ? '#fffbf5' : '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                                        {addressMode === 'current' && <i className="fas fa-check-circle" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>}
                                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1a1a1a', marginBottom: '8px' }}><i className="fas fa-location-arrow" style={{ color: '#3b82f6', marginRight: '8px' }}></i>Use Current GPS</div>
                                        <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>Auto-detect location {gpsLoading && <span className="auth-spinner" style={{ width: '12px', height: '12px', marginLeft: '6px' }}></span>}</div>
                                        {gpsError && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '6px' }}>{gpsError}</div>}
                                    </div>

                                    {/* Manual Entry */}
                                    <div onClick={() => handleAddressModeChange('manual')} style={{ padding: '20px', borderRadius: '16px', border: addressMode === 'manual' ? '2px solid var(--primary)' : '2px solid #f0f0f0', background: addressMode === 'manual' ? '#fffbf5' : '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '110px' }}>
                                        {addressMode === 'manual' && <i className="fas fa-check-circle" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>}
                                        <i className="fas fa-plus" style={{ fontSize: '1.5rem', color: '#999', marginBottom: '8px' }}></i>
                                        <div style={{ fontWeight: '600', color: '#555' }}>Add New Address</div>
                                    </div>
                                </div>

                                {/* Review/Edit Fields for Current & Manual Modes */}
                                {(addressMode === 'manual' || addressMode === 'current') && (
                                    <div style={{ marginTop: '25px', padding: '25px', background: '#fafbfc', borderRadius: '16px', border: '1px dashed #d1d5db', animation: 'fadeIn 0.3s ease-out' }}>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
                                            {addressMode === 'current' ? 'Review & Update Location' : 'Enter Address Details'}
                                        </h3>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Complete Address</label>
                                            <textarea id="address" {...formik.getFieldProps('address')} rows="2" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e1e4e8', fontSize: '1rem', outline: 'none', resize: 'vertical' }} placeholder="Flat, House no., Building, Area" />
                                            {formik.touched.address && formik.errors.address && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '6px' }}>{formik.errors.address}</div>}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Town/City</label>
                                                <input type="text" id="city" {...formik.getFieldProps('city')} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e1e4e8', fontSize: '1rem', outline: 'none' }} placeholder="Pune" />
                                                {formik.touched.city && formik.errors.city && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '6px' }}>{formik.errors.city}</div>}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Pincode</label>
                                                <input type="text" id="pincode" {...formik.getFieldProps('pincode')} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e1e4e8', fontSize: '1rem', outline: 'none' }} placeholder="411001" />
                                                {formik.touched.pincode && formik.errors.pincode && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '6px' }}>{formik.errors.pincode}</div>}
                                            </div>
                                        </div>
                                        {user && (
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', cursor: 'pointer', userSelect: 'none' }}>
                                                <input type="checkbox" name="saveAddressToProfile" checked={formik.values.saveAddressToProfile} onChange={formik.handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                                <span style={{ fontSize: '0.95rem', color: '#444', fontWeight: '500' }}>Save this delivery address for future orders</span>
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* SECTION: Payment Method */}
                            <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#222', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
                                    Payment Method
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div onClick={() => formik.setFieldValue('paymentMethod', 'UPI')} style={{ padding: '24px 20px', borderRadius: '16px', border: formik.values.paymentMethod === 'UPI' ? '2px solid var(--primary)' : '2px solid #f0f0f0', background: formik.values.paymentMethod === 'UPI' ? '#fffbf5' : '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', textAlign: 'center' }}>
                                        {formik.values.paymentMethod === 'UPI' && <i className="fas fa-check-circle" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>}
                                        <i className="fas fa-qrcode" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '16px' }}></i>
                                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#222' }}>Online / UPI</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>Pay instantly & securely</div>
                                    </div>
                                    <div onClick={() => formik.setFieldValue('paymentMethod', 'COD')} style={{ padding: '24px 20px', borderRadius: '16px', border: formik.values.paymentMethod === 'COD' ? '2px solid var(--primary)' : '2px solid #f0f0f0', background: formik.values.paymentMethod === 'COD' ? '#fffbf5' : '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', textAlign: 'center' }}>
                                        {formik.values.paymentMethod === 'COD' && <i className="fas fa-check-circle" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>}
                                        <i className="fas fa-hand-holding-usd" style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '16px' }}></i>
                                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#222' }}>Cash on Delivery</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>Pay when you receive</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Order Summary Floating Card */}
                        <div style={{ flex: '0 0 380px', width: '100%' }}>
                            <div style={{ background: '#fff', borderRadius: '24px', padding: '35px', boxShadow: '0 15px 50px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: '#1a1a1a' }}>Order Summary</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '25px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {cart.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ background: '#f8f9fa', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#444' }}>
                                                    {item.quantity}x
                                                </div>
                                                <span style={{ fontSize: '0.95rem', color: '#333', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>{item.name}</span>
                                            </div>
                                            <span style={{ fontWeight: '700', color: '#222', fontSize: '1rem' }}>₹{(getEffectivePrice(item) * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ height: '1px', background: '#e1e4e8', margin: '20px 0' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.05rem', color: '#555' }}>
                                    <span>Subtotal</span>
                                    <span style={{ fontWeight: '700', color: '#1a1a1a' }}>₹{total.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.05rem', color: '#555' }}>
                                    <span>Shipping</span>
                                    <span style={{ fontWeight: '700', color: shippingInfo ? '#1a1a1a' : '#9ca3af' }}>{shippingInfo ? `₹${shippingInfo.total_shipping}` : 'Pending PIN'}</span>
                                </div>

                                <div style={{ height: '1px', background: '#e1e4e8', margin: '20px 0' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#444' }}>Total</span>
                                    <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', lineHeight: '1' }}>₹{shippingInfo ? (total + shippingInfo.total_shipping).toFixed(2) : total.toFixed(2)}</span>
                                </div>

                                <button type="submit" disabled={formik.isSubmitting || loadingShipping} style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, #ff8a00 100%)', color: 'white', border: 'none', padding: '18px', fontSize: '1.15rem', fontWeight: '700', borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 10px 25px rgba(255, 138, 0, 0.3)', opacity: (formik.isSubmitting || loadingShipping) ? 0.7 : 1 }}>
                                    {formik.isSubmitting ? 'Processing Order...' : 'Confirm & Pay'} <i className="fas fa-lock" style={{ marginLeft: '8px', fontSize: '0.9rem' }}></i>
                                </button>

                                {formik.status && <div style={{ color: '#c53030', textAlign: 'center', marginTop: '16px', fontSize: '0.95rem', padding: '12px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fed7d7' }}>{formik.status}</div>}

                                <div style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <i className="fas fa-shield-alt"></i> Safe and secure checkout
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
