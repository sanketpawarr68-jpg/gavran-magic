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
        <main className="container section-padding" style={{ maxWidth: '1200px', margin: '0 auto', background: '#fff', textAlign: 'left' }}>
            {/* Header Area */}
            {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '30px' }}>
                {/* <h1 style={{ fontSize: '1.8rem', fontWeight: '400', margin: 0, textAlign: 'center' }}>Secure Checkout <i className="fas fa-lock" style={{ fontSize: '1.2rem', color: '#555', verticalAlign: 'middle', marginLeft: '5px' }}></i></h1> */}
            {/* </div> */}

            <form onSubmit={formik.handleSubmit}>
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                    {/* LEFT COLUMN: Steps */}
                    <div style={{ flex: '1 1 600px' }}>

                        {/* STEP 1: DELIVERY ADDRESS */}
                        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ padding: '15px 20px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
                                <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#c45500', fontWeight: 'bold' }}>1. Delivery address</h2>
                            </div>
                            <div style={{ padding: '20px' }}>
                                {/* Personal Info inline */}
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 min-content' }}>
                                        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Full name</label>
                                        <input type="text" id="name" {...formik.getFieldProps('name')} style={{ width: '100%', padding: '10px', border: '1px solid #a6a6a6', borderRadius: '4px', textTransform: 'none' }} />
                                        {formik.touched.name && formik.errors.name ? <div style={{ color: '#c40000', fontSize: '0.8rem', marginTop: '4px' }}>{formik.errors.name}</div> : null}
                                    </div>
                                    <div style={{ flex: '1 1 min-content' }}>
                                        <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Mobile number</label>
                                        <input type="text" id="phone" {...formik.getFieldProps('phone')} style={{ width: '100%', padding: '10px', border: '1px solid #a6a6a6', borderRadius: '4px', textTransform: 'none' }} />
                                        {formik.touched.phone && formik.errors.phone ? <div style={{ color: '#c40000', fontSize: '0.8rem', marginTop: '4px' }}>{formik.errors.phone}</div> : null}
                                    </div>
                                </div>

                                {/* Address Selection */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {/* Profile Address */}
                                    {user && user.address && (
                                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', margin: 0, padding: '15px', border: addressMode === 'profile' ? '1px solid #fbd8b4' : '1px solid #ddd', borderRadius: '8px', background: addressMode === 'profile' ? '#fdf8f3' : 'white', transition: 'all 0.2s', width: '100%', textTransform: 'none' }}>
                                            <input type="radio" name="addressMode" checked={addressMode === 'profile'} onChange={() => handleAddressModeChange('profile')} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontWeight: 'bold', display: 'block', color: '#111', textTransform: 'none' }}>{user.name || 'Profile Default'}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#333', display: 'block', marginTop: '2px', textTransform: 'none' }}>{user.address}, {user.city} - {user.pincode}</span>
                                            </div>
                                        </label>
                                    )}

                                    {/* Saved Addresses */}
                                    {user?.saved_addresses?.map((addr, idx) => (
                                        <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', margin: 0, padding: '15px', border: addressMode === `saved_${idx}` ? '1px solid #fbd8b4' : '1px solid #ddd', borderRadius: '8px', background: addressMode === `saved_${idx}` ? '#fdf8f3' : 'white', transition: 'all 0.2s', width: '100%', textTransform: 'none' }}>
                                            <input type="radio" name="addressMode" checked={addressMode === `saved_${idx}`} onChange={() => handleAddressModeChange(`saved_${idx}`, addr)} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontWeight: 'bold', display: 'block', color: '#111', textTransform: 'none' }}>Saved Address {idx + 1}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#333', display: 'block', marginTop: '2px', textTransform: 'none' }}>{addr.address}, {addr.city} - {addr.pincode}</span>
                                            </div>
                                        </label>
                                    ))}

                                    {/* Detect Location */}
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', margin: 0, padding: '15px', border: addressMode === 'current' ? '1px solid #fbd8b4' : '1px solid #ddd', borderRadius: '8px', background: addressMode === 'current' ? '#fdf8f3' : 'white', transition: 'all 0.2s', width: '100%', textTransform: 'none' }}>
                                        <input type="radio" name="addressMode" checked={addressMode === 'current'} onChange={() => handleAddressModeChange('current')} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: '#111', textTransform: 'none' }}>
                                                Use Current Device Location
                                                {gpsLoading && <span className="auth-spinner" style={{ width: '14px', height: '14px', marginLeft: '10px', borderColor: '#c45500 transparent #c45500 transparent' }}></span>}
                                            </span>
                                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'block', marginTop: '2px', textTransform: 'none' }}>Automatically detect using browser GPS</span>
                                            {gpsError && <span style={{ fontSize: '0.85rem', color: '#c40000', display: 'block', marginTop: '4px', textTransform: 'none' }}>{gpsError}</span>}
                                        </div>
                                    </label>

                                    {/* Manual Entry */}
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left', margin: 0, padding: '15px', border: addressMode === 'manual' ? '1px solid #fbd8b4' : '1px solid #ddd', borderRadius: '8px', background: addressMode === 'manual' ? '#fdf8f3' : 'white', transition: 'all 0.2s', width: '100%', textTransform: 'none' }}>
                                        <input type="radio" name="addressMode" checked={addressMode === 'manual'} onChange={() => handleAddressModeChange('manual')} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 'bold', display: 'block', color: '#111', textTransform: 'none' }}>+ Add a new address</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Form fields for Custom/Current */}
                                {(addressMode === 'manual' || addressMode === 'current') && (
                                    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label htmlFor="address" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Flat, House no., Building, Company, Apartment</label>
                                            <textarea id="address" {...formik.getFieldProps('address')} rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #a6a6a6', borderRadius: '4px', resize: 'vertical', textTransform: 'none' }} />
                                            {formik.touched.address && formik.errors.address ? <div style={{ color: '#c40000', fontSize: '0.8rem', marginTop: '4px' }}>{formik.errors.address}</div> : null}
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label htmlFor="city" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Town/City</label>
                                                <input type="text" id="city" {...formik.getFieldProps('city')} style={{ width: '100%', padding: '10px', border: '1px solid #a6a6a6', borderRadius: '4px', textTransform: 'none' }} />
                                                {formik.touched.city && formik.errors.city ? <div style={{ color: '#c40000', fontSize: '0.8rem', marginTop: '4px' }}>{formik.errors.city}</div> : null}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label htmlFor="pincode" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pincode</label>
                                                <input type="text" id="pincode" {...formik.getFieldProps('pincode')} style={{ width: '100%', padding: '10px', border: '1px solid #a6a6a6', borderRadius: '4px', textTransform: 'none' }} />
                                                {formik.touched.pincode && formik.errors.pincode ? <div style={{ color: '#c40000', fontSize: '0.8rem', marginTop: '4px' }}>{formik.errors.pincode}</div> : null}
                                            </div>
                                        </div>
                                        {user && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                                                <input type="checkbox" id="saveAddress" name="saveAddressToProfile" checked={formik.values.saveAddressToProfile} onChange={formik.handleChange} style={{ width: 'auto', margin: 0 }} />
                                                <label htmlFor="saveAddress" style={{ marginBottom: 0, fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem', color: '#111', textTransform: 'none' }}>Save this delivery address for future orders</label>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* STEP 2: PAYMENT METHOD */}
                        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ padding: '15px 20px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
                                <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#c45500', fontWeight: 'bold' }}>2. Payment method</h2>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', margin: 0, padding: '15px', border: formik.values.paymentMethod === 'UPI' ? '1px solid #fbd8b4' : '1px solid #ddd', borderRadius: '8px', background: formik.values.paymentMethod === 'UPI' ? '#fdf8f3' : 'white', transition: 'all 0.2s', textTransform: 'none', width: '100%' }}>
                                        <input type="radio" value="UPI" name="paymentMethod" checked={formik.values.paymentMethod === 'UPI'} onChange={formik.handleChange} style={{ margin: 0, transform: 'scale(1.2)' }} />
                                        <span style={{ fontWeight: 'bold', color: '#111', textTransform: 'none' }}>Other UPI Apps / Online Payment</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', margin: 0, padding: '15px', border: formik.values.paymentMethod === 'COD' ? '1px solid #fbd8b4' : '1px solid #ddd', borderRadius: '8px', background: formik.values.paymentMethod === 'COD' ? '#fdf8f3' : 'white', transition: 'all 0.2s', textTransform: 'none', width: '100%' }}>
                                        <input type="radio" value="COD" name="paymentMethod" checked={formik.values.paymentMethod === 'COD'} onChange={formik.handleChange} style={{ margin: 0, transform: 'scale(1.2)' }} />
                                        <div>
                                            <span style={{ fontWeight: 'bold', color: '#111', display: 'block', textTransform: 'none' }}>Cash on Delivery/Pay on Delivery</span>
                                            <span style={{ fontSize: '0.85rem', color: '#555', marginTop: '2px', display: 'block', textTransform: 'none' }}>Cash, UPI and Cards accepted.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div style={{ flex: '0 0 320px', width: '100%' }}>
                        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: 'white', position: 'sticky', top: '90px' }}>
                            <button type="submit" style={{ width: '100%', background: '#ffd814', padding: '12px', borderRadius: '24px', border: '1px solid #FCD200', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', color: '#111', transition: 'all 0.2s', opacity: (formik.isSubmitting || loadingShipping) ? 0.7 : 1, textAlign: 'center', boxShadow: '0 2px 5px rgba(213,217,217,.5)' }} disabled={formik.isSubmitting || loadingShipping}>
                                {formik.isSubmitting ? 'Processing...' : 'Place Your Order'}
                            </button>

                            {formik.status && <div style={{ color: '#c40000', fontSize: '0.9rem', marginTop: '10px', textAlign: 'center' }}>{formik.status}</div>}

                            <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', marginTop: '15px', lineHeight: '1.4' }}>
                                By placing your order, you agree to Gavran Magic's privacy notice and conditions of use.
                            </p>

                            <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '20px 0' }} />

                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 15px 0', color: '#111' }}>Order Summary</h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#333' }}>
                                <span>Items:</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#333' }}>
                                <span>Delivery:</span>
                                <span>{shippingInfo ? `₹${shippingInfo.total_shipping}` : '--'}</span>
                            </div>

                            <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '15px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', color: '#B12704' }}>
                                <span>Order Total:</span>
                                <span>₹{shippingInfo ? (total + shippingInfo.total_shipping).toFixed(2) : total.toFixed(2)}</span>
                            </div>

                            <div style={{ marginTop: '20px', background: '#f0f2f2', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#007185', cursor: 'pointer', textDecoration: 'none' }}>How are delivery costs calculated?</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </main >
    );
}
