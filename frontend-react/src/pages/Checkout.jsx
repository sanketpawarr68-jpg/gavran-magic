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
            address: '',
            city: '',
            pincode: '',
            paymentMethod: 'COD',
        },
        enableReinitialize: true,
        validationSchema: CheckoutSchema,
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const orderData = {
                    user_id: user ? user.id : 'guest',
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

                    <div className="form-group">
                        <label htmlFor="address">Shipping Address</label>
                        <textarea id="address" {...formik.getFieldProps('address')} rows="3" />
                        {formik.touched.address && formik.errors.address ? <div className="alert-error">{formik.errors.address}</div> : null}
                    </div>

                    <div className="city-pincode-grid">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input type="text" id="city" {...formik.getFieldProps('city')} />
                            {formik.touched.city && formik.errors.city ? <div className="alert-error">{formik.errors.city}</div> : null}
                        </div>

                        <div className="form-group">
                            <label htmlFor="pincode">Pincode</label>
                            <input type="text" id="pincode" {...formik.getFieldProps('pincode')} />
                            {formik.touched.pincode && formik.errors.pincode ? <div className="alert-error">{formik.errors.pincode}</div> : null}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Payment Method</label>
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ marginRight: '20px', cursor: 'pointer' }}>
                                <input type="radio" value="COD" name="paymentMethod"
                                    checked={formik.values.paymentMethod === 'COD'}
                                    onChange={formik.handleChange}
                                /> Cash on Delivery (COD)
                            </label>
                            <label style={{ cursor: 'pointer' }}>
                                <input type="radio" value="UPI" name="paymentMethod"
                                    checked={formik.values.paymentMethod === 'UPI'}
                                    onChange={formik.handleChange}
                                /> UPI / Online Payment
                            </label>
                        </div>
                    </div>

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
