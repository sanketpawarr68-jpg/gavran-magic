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

        if (!("geolocation" in navigator)) {
            setGpsError('Location is not supported by your browser or requires HTTPS.');
            setGpsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    // Adding User-Agent like header is not possible via fetch, but nominatim requires accept-language
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);

                    if (!res.ok) throw new Error("Failed to fetch address details");

                    const data = await res.json();
                    if (!data || !data.address) throw new Error("No address returned");

                    const addr = data.address;
                    const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';

                    // Construct a sensible detailed address line
                    const parts = [addr.building, addr.amenity, addr.road, addr.neighbourhood, addr.suburb, addr.residential].filter(Boolean);
                    const fallbackAddress = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ').trim() : '';

                    const finalAddress = parts.length > 0 ? parts.join(', ') : fallbackAddress;
                    const postcode = addr.postcode ? addr.postcode.split('-')[0].trim() : '';

                    formik.setFieldValue('address', finalAddress || 'Could not detect street, please type');
                    formik.setFieldValue('city', city || 'Unknown City');
                    formik.setFieldValue('pincode', postcode);
                } catch (err) {
                    console.error("Nominatim Reverse Geocoding Error:", err);
                    setGpsError("Could not calculate address from coordinates.");
                } finally {
                    setGpsLoading(false);
                }
            },
            (geoErr) => {
                console.warn("Geolocation API Error:", geoErr);
                if (geoErr.code === 1) {
                    setGpsError('Location access denied. Please approve permission in your browser settings.');
                } else if (geoErr.code === 2) {
                    setGpsError('Location unavailable. Check your device GPS.');
                } else if (geoErr.code === 3) {
                    setGpsError('Location request timed out.');
                } else {
                    setGpsError('Failed to get location. Please enter manually.');
                }
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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

    const calculateTotalWeight = () => {
        let totalW = 0;
        cart.forEach(item => {
            const wStr = (item.weight || '500g').toLowerCase();
            let val = parseFloat(wStr);
            if (isNaN(val)) val = 0.5;

            if (wStr.includes('kg')) {
                totalW += val * item.quantity;
            } else {
                // assume grams if not kg
                totalW += (val / 1000) * item.quantity;
            }
        });
        return Math.max(0.5, totalW); // Shiprocket min weight is usually 0.5kg
    };

    const fetchShippingCost = async (pincode, isCOD) => {
        if (!/^[4][0-9]{5}$/.test(pincode)) return;

        setLoadingShipping(true);
        const totalWeight = calculateTotalWeight();

        try {
            const response = await axios.post(`${API_BASE_URL}/api/orders/shipping-cost`, {
                pincode: pincode,
                weight: totalWeight,
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
        <main style={{ minHeight: '100vh', background: '#f8fafc', padding: '80px 20px 100px', fontFamily: '"Work Sans", sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 className="checkout-main-title">Complete Your Order</h1>
                    <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Join thousands of happy customers enjoying the authentic magic of Maharashtrian kitchen.
                    </p>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="checkout-container" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                        {/* LEFT: FORM STEPS */}
                        <div className="checkout-main-column" style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                            {/* STEP 1: Contact */}
                            <div className="checkout-card">
                                <div className="checkout-section-header">
                                    <div className="checkout-step-num">1</div>
                                    <span>Contact Information</span>
                                </div>
                                <div className="checkout-input-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>Full Name</label>
                                        <input type="text" id="name" {...formik.getFieldProps('name')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '1rem' }} placeholder="Your Name" />
                                        {formik.touched.name && formik.errors.name && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>{formik.errors.name}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>Phone Number</label>
                                        <input type="text" id="phone" {...formik.getFieldProps('phone')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '1rem' }} placeholder="10 Digit Number" />
                                        {formik.touched.phone && formik.errors.phone && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>{formik.errors.phone}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* STEP 2: Delivery */}
                            <div className="checkout-card">
                                <div className="checkout-section-header">
                                    <div className="checkout-step-num">2</div>
                                    <span>Shipping Details</span>
                                </div>

                                <div className="checkout-address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    {user && user.address && (
                                        <div onClick={() => handleAddressModeChange('profile')} style={{ padding: '20px', borderRadius: '16px', border: addressMode === 'profile' ? '2px solid var(--primary)' : '2px solid #f1f5f9', background: addressMode === 'profile' ? '#fff7ed' : '#fff', cursor: 'pointer', position: 'relative' }}>
                                            <div style={{ fontWeight: '700', marginBottom: '5px' }}>🏡 Default Home</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{user.address}, {user.city} - {user.pincode}</div>
                                            {addressMode === 'profile' && <i className="fas fa-check-circle" style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--primary)' }}></i>}
                                        </div>
                                    )}

                                    <div onClick={() => handleAddressModeChange('current')} style={{ padding: '20px', borderRadius: '16px', border: addressMode === 'current' ? '2px solid var(--primary)' : '2px solid #f1f5f9', background: addressMode === 'current' ? '#fff7ed' : '#fff', cursor: 'pointer', position: 'relative' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '5px' }}>📍 Use GPS Location</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{gpsLoading ? 'Detecting...' : 'Auto-fill from Device'}</div>
                                    </div>

                                    <div onClick={() => handleAddressModeChange('manual')} style={{ padding: '20px', borderRadius: '16px', border: addressMode === 'manual' ? '2px solid var(--primary)' : '2px solid #f1f5f9', background: addressMode === 'manual' ? '#fff7ed' : '#fff', cursor: 'pointer', position: 'relative' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '5px' }}>➕ Add New Address</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Enter details manually</div>
                                    </div>
                                </div>

                                {(addressMode === 'manual' || addressMode === 'current') && (
                                    <div className="fade-in" style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>Home / Building / Street</label>
                                            <textarea {...formik.getFieldProps('address')} rows="2" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                                            {formik.touched.address && formik.errors.address && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{formik.errors.address}</div>}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>City</label>
                                                <input type="text" {...formik.getFieldProps('city')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>Pincode (Maharashtra Only)</label>
                                                <input type="text" {...formik.getFieldProps('pincode')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                            </div>
                                        </div>
                                        {user && (
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', cursor: 'pointer' }}>
                                                <input type="checkbox" name="saveAddressToProfile" checked={formik.values.saveAddressToProfile} onChange={formik.handleChange} />
                                                <span style={{ fontSize: '0.9rem', color: '#444' }}>Save this to my profile</span>
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* STEP 3: Payment */}
                            <div className="checkout-card">
                                <div className="checkout-section-header">
                                    <div className="checkout-step-num">3</div>
                                    <span>Payment Method</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <div onClick={() => formik.setFieldValue('paymentMethod', 'UPI')} style={{ padding: '25px', borderRadius: '16px', border: formik.values.paymentMethod === 'UPI' ? '2px solid var(--primary)' : '2px solid #f1f5f9', background: formik.values.paymentMethod === 'UPI' ? '#fff7ed' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                                        <i className="fas fa-qrcode" style={{ fontSize: '2rem', color: '#27ae60', marginBottom: '10px' }}></i>
                                        <div style={{ fontWeight: '700' }}>UPI / Online Pay</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Fast & Secure</div>
                                    </div>
                                    <div onClick={() => formik.setFieldValue('paymentMethod', 'COD')} style={{ padding: '25px', borderRadius: '16px', border: formik.values.paymentMethod === 'COD' ? '2px solid var(--primary)' : '2px solid #f1f5f9', background: formik.values.paymentMethod === 'COD' ? '#fff7ed' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                                        <i className="fas fa-hand-holding-usd" style={{ fontSize: '2rem', color: '#d35400', marginBottom: '10px' }}></i>
                                        <div style={{ fontWeight: '700' }}>Cash on Delivery</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pay on arrival</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: SUMMARY */}
                        <div className="checkout-summary-column" style={{ flex: '0 0 400px', width: '100%' }}>
                            <div className="checkout-card" style={{ position: 'sticky', top: '120px' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '25px' }}>Bag Summary</h3>

                                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '25px' }}>
                                    {cart.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ background: '#f1f5f9', padding: '5px 10px', borderRadius: '8px', height: 'fit-content', fontWeight: '700', fontSize: '0.8rem' }}>{item.quantity}x</div>
                                                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{item.name}</div>
                                            </div>
                                            <div style={{ fontWeight: '700' }}>₹{(getEffectivePrice(item) * item.quantity).toFixed(0)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                        <span>Subtotal</span>
                                        <span>₹{total.toFixed(0)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                        <span>Shipping Cost</span>
                                        <span style={{ color: shippingInfo ? 'var(--secondary)' : '#64748b', fontWeight: '700' }}>
                                            {loadingShipping ? 'Calculating...' : (shippingInfo ? `₹${shippingInfo.total_shipping}` : 'Enter PIN')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '1.4rem', fontWeight: '800' }}>
                                        <span>Total</span>
                                        <span style={{ color: 'var(--primary)' }}>₹{(total + (shippingInfo ? shippingInfo.total_shipping : 0)).toFixed(0)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={formik.isSubmitting || (formik.values.pincode.length === 6 && !shippingInfo)}
                                    style={{ width: '100%', marginTop: '30px', padding: '18px', fontSize: '1rem', borderRadius: '15px' }}
                                >
                                    {formik.isSubmitting ? 'Confirming Order...' : 'Place Secure Order'}
                                </button>

                                {formik.status && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '16px', fontSize: '0.95rem', padding: '12px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fed7d7' }}>{formik.status}</div>}

                                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                                    <i className="fas fa-shield-alt"></i> SSL SECURE CHECKOUT
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </main>
    );
}
