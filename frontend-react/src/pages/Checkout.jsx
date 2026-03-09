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
        <main className="container section-padding">
            <h1 className="section-title">Checkout</h1>
            <div className="form-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" {...formik.getFieldProps('name')} />
                        {formik.touched.name && formik.errors.name ? <div className="alert-error">{formik.errors.name}</div> : null}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="text" id="phone" {...formik.getFieldProps('phone')} />
                        {formik.touched.phone && formik.errors.phone ? <div className="alert-error">{formik.errors.phone}</div> : null}
                    </div>

                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <h3 style={{ fontSize: '1.05rem', margin: '0 0 15px 0', color: '#444', fontWeight: 'bold' }}>Delivery Address</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* Profile Address */}
                                {user && user.address && (
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', textTransform: 'none', margin: 0, width: '100%' }}>
                                        <input type="radio" name="addressMode" checked={addressMode === 'profile'} onChange={() => handleAddressModeChange('profile')} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 'bold', display: 'block', color: addressMode === 'profile' ? 'var(--primary)' : '#333', textTransform: 'none' }}>★ Home (Profile Default)</span>
                                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'block', marginTop: '4px', textTransform: 'none' }}>{user.address}, {user.city} - {user.pincode}</span>
                                        </div>
                                    </label>
                                )}

                                {/* Additional Saved Addresses */}
                                {user?.saved_addresses?.map((addr, idx) => (
                                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', textTransform: 'none', margin: 0, width: '100%' }}>
                                        <input type="radio" name="addressMode" checked={addressMode === `saved_${idx}`} onChange={() => handleAddressModeChange(`saved_${idx}`, addr)} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 'bold', display: 'block', color: addressMode === `saved_${idx}` ? 'var(--primary)' : '#333', textTransform: 'none' }}>Saved Address {idx + 1}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'block', marginTop: '4px', textTransform: 'none' }}>{addr.address}, {addr.city} - {addr.pincode}</span>
                                        </div>
                                    </label>
                                ))}

                                {/* Detect Location */}
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', textTransform: 'none', margin: 0, width: '100%' }}>
                                    <input type="radio" name="addressMode" checked={addressMode === 'current'} onChange={() => handleAddressModeChange('current')} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: addressMode === 'current' ? 'var(--primary)' : '#333', textTransform: 'none' }}>
                                            Use Current Device Location
                                            {gpsLoading && <span className="auth-spinner" style={{ width: '14px', height: '14px', marginLeft: '10px', borderColor: 'var(--primary) transparent var(--primary) transparent' }}></span>}
                                        </span>
                                        <span style={{ fontSize: '0.9rem', color: '#555', display: 'block', marginTop: '4px', textTransform: 'none' }}>Automatically detect using browser GPS</span>
                                        {gpsError && <span style={{ fontSize: '0.85rem', color: '#e53935', display: 'block', marginTop: '4px', textTransform: 'none' }}>{gpsError}</span>}
                                    </div>
                                </label>

                                {/* Manual Entry */}
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', textTransform: 'none', margin: 0, width: '100%' }}>
                                    <input type="radio" name="addressMode" checked={addressMode === 'manual'} onChange={() => handleAddressModeChange('manual')} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 'bold', display: 'block', color: addressMode === 'manual' ? 'var(--primary)' : '#333', textTransform: 'none' }}>+ Add New Address Manually</span>
                                        <span style={{ fontSize: '0.9rem', color: '#555', display: 'block', marginTop: '4px', textTransform: 'none' }}>Type out a fresh delivery address below</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address Details</label>
                        <textarea id="address" {...formik.getFieldProps('address')} rows="3" disabled={addressMode !== 'manual' && addressMode !== 'current'} style={{ background: (addressMode !== 'manual' && addressMode !== 'current') ? '#f0f0f0' : 'white', cursor: (addressMode !== 'manual' && addressMode !== 'current') ? 'not-allowed' : 'text' }} />
                        {formik.touched.address && formik.errors.address ? <div className="alert-error">{formik.errors.address}</div> : null}
                    </div>

                    <div className="city-pincode-grid">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input type="text" id="city" {...formik.getFieldProps('city')} disabled={addressMode !== 'manual' && addressMode !== 'current'} style={{ background: (addressMode !== 'manual' && addressMode !== 'current') ? '#f0f0f0' : 'white', cursor: (addressMode !== 'manual' && addressMode !== 'current') ? 'not-allowed' : 'text' }} />
                            {formik.touched.city && formik.errors.city ? <div className="alert-error">{formik.errors.city}</div> : null}
                        </div>

                        <div className="form-group">
                            <label htmlFor="pincode">Pincode</label>
                            <input type="text" id="pincode" {...formik.getFieldProps('pincode')} disabled={addressMode !== 'manual' && addressMode !== 'current'} style={{ background: (addressMode !== 'manual' && addressMode !== 'current') ? '#f0f0f0' : 'white', cursor: (addressMode !== 'manual' && addressMode !== 'current') ? 'not-allowed' : 'text' }} />
                            {formik.touched.pincode && formik.errors.pincode ? <div className="alert-error">{formik.errors.pincode}</div> : null}
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ marginBottom: '10px' }}>Payment Method</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '5px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, textTransform: 'none', fontWeight: '500' }}>
                                <input type="radio" value="COD" name="paymentMethod"
                                    checked={formik.values.paymentMethod === 'COD'}
                                    onChange={formik.handleChange}
                                    style={{ margin: 0, transform: 'scale(1.2)' }}
                                />
                                <span style={{ textTransform: 'none' }}>Cash on Delivery (COD)</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, textTransform: 'none', fontWeight: '500' }}>
                                <input type="radio" value="UPI" name="paymentMethod"
                                    checked={formik.values.paymentMethod === 'UPI'}
                                    onChange={formik.handleChange}
                                    style={{ margin: 0, transform: 'scale(1.2)' }}
                                />
                                <span style={{ textTransform: 'none' }}>UPI / Online Payment</span>
                            </label>
                        </div>
                    </div>

                    {(addressMode === 'manual' || addressMode === 'current') && user && (
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px', marginBottom: '15px', background: '#fffbeb', padding: '12px', border: '1px solid #fde68a', borderRadius: '6px' }}>
                            <input
                                type="checkbox"
                                id="saveAddress"
                                name="saveAddressToProfile"
                                checked={formik.values.saveAddressToProfile}
                                onChange={formik.handleChange}
                                style={{ width: 'auto', outline: 'none', cursor: 'pointer', margin: 0 }}
                            />
                            <label htmlFor="saveAddress" style={{ marginBottom: 0, fontWeight: '600', cursor: 'pointer', color: '#92400e', fontSize: '0.9rem' }}>
                                Save this new delivery address for future orders
                            </label>
                        </div>
                    )}

                    {shippingInfo && (
                        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                            <p>Subtotal: ₹{total}</p>
                            <p>Shipping Cost: ₹{shippingInfo.total_shipping}</p>
                            <p style={{ fontWeight: 'bold' }}>Total: ₹{(total + shippingInfo.total_shipping).toFixed(2)}</p>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={formik.isSubmitting || loadingShipping}>
                        {formik.isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                    {formik.status && <div className="alert-error" style={{ marginTop: '10px' }}>{formik.status}</div>}
                </form>
            </div>
        </main>
    );
}
