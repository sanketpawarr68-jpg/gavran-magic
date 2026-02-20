
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../context/CartContext';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
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
    const { cart, total, clearCart } = useCart();
    const { user, isLoaded, isSignedIn } = useUser();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: user ? user.fullName || '' : '',
            phone: user ? (user.primaryPhoneNumber ? user.primaryPhoneNumber.phoneNumber : '') : '',
            address: '',
            city: '',
            pincode: '',
            paymentMethod: 'COD', // Default
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
                        price: item.price
                    })),
                    total_price: total
                };

                // In a real app, if UPI/Card is selected, we'd redirect to payment gateway here.
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

    if (!isLoaded) return <div>Loading...</div>;

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return (
        <main className="container" style={{ padding: '40px 0' }}>
            <div className="form-container">
                <h2>Checkout</h2>
                {formik.status && <div className="alert alert-error">{formik.status}</div>}

                <form onSubmit={formik.handleSubmit}>
                    {/* --- Personal Details --- */}
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Details</h3>

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" type="text" {...formik.getFieldProps('name')} />
                        {formik.touched.name && formik.errors.name ? <div style={{ color: 'red' }}>{formik.errors.name}</div> : null}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input id="phone" type="tel" placeholder="10-digit mobile number" {...formik.getFieldProps('phone')} />
                        {formik.touched.phone && formik.errors.phone ? <div style={{ color: 'red' }}>{formik.errors.phone}</div> : null}
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea id="address" rows="3" {...formik.getFieldProps('address')} />
                        {formik.touched.address && formik.errors.address ? <div style={{ color: 'red' }}>{formik.errors.address}</div> : null}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input id="city" type="text" {...formik.getFieldProps('city')} />
                            {formik.touched.city && formik.errors.city ? <div style={{ color: 'red' }}>{formik.errors.city}</div> : null}
                        </div>
                        <div className="form-group">
                            <label htmlFor="pincode">Pincode</label>
                            <input id="pincode" type="text" placeholder="4xxxxx" {...formik.getFieldProps('pincode')} />
                            {formik.touched.pincode && formik.errors.pincode ? <div style={{ color: 'red' }}>{formik.errors.pincode}</div> : null}
                        </div>
                    </div>

                    {/* --- Payment Method --- */}
                    <h3 style={{ fontSize: '1.2rem', margin: '30px 0 20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Payment Method</h3>

                    <div className="form-group">
                        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px', background: formik.values.paymentMethod === 'COD' ? '#f9f9f9' : 'white' }}>
                                <input type="radio" name="paymentMethod" value="COD"
                                    checked={formik.values.paymentMethod === 'COD'}
                                    onChange={formik.handleChange}
                                />
                                <span>
                                    <strong>Cash on Delivery (COD)</strong>
                                    <br /><small style={{ fontWeight: 'normal', color: '#666' }}>Pay when your order arrives.</small>
                                </span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px', background: formik.values.paymentMethod === 'UPI' ? '#f9f9f9' : 'white' }}>
                                <input type="radio" name="paymentMethod" value="UPI"
                                    checked={formik.values.paymentMethod === 'UPI'}
                                    onChange={formik.handleChange}
                                />
                                <span>
                                    <strong>UPI (GPay, PhonePe, Paytm)</strong>
                                    <br /><small style={{ fontWeight: 'normal', color: '#666' }}>Pay instantly via UPI app.</small>
                                </span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px', background: formik.values.paymentMethod === 'CARD' ? '#f9f9f9' : 'white' }}>
                                <input type="radio" name="paymentMethod" value="CARD"
                                    checked={formik.values.paymentMethod === 'CARD'}
                                    onChange={formik.handleChange}
                                />
                                <span>
                                    <strong>Credit / Debit Card</strong>
                                    <br /><small style={{ fontWeight: 'normal', color: '#666' }}>Secure payment via Visa/Mastercard.</small>
                                </span>
                            </label>
                        </div>
                        {formik.errors.paymentMethod ? <div style={{ color: 'red', marginTop: '5px' }}>{formik.errors.paymentMethod}</div> : null}
                    </div>

                    <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
                        <strong>Total Payable: ₹{total}</strong>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px' }} disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Processing Order...' : 'Place Order'}
                    </button>
                </form>
            </div>
        </main>
    );
}
