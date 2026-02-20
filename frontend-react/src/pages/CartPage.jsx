
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, total } = useCart();

    if (cart.length === 0) {
        return (
            <main className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <div style={{ marginBottom: '30px', opacity: 0.5 }}>
                    <i className="fas fa-shopping-basket" style={{ fontSize: '4rem', color: 'var(--dark)' }}></i>
                </div>
                <h2 style={{ marginBottom: '20px' }}>Your Cart is Empty</h2>
                <p style={{ color: '#777', marginBottom: '30px' }}>Looks like you haven't added any magic to your cart yet.</p>
                <Link to="/shop" className="btn">Start Shopping</Link>
            </main>
        );
    }

    return (
        <main className="container" style={{ padding: '60px 0' }}>
            <h1 className="section-title" style={{ marginTop: 0, textAlign: 'left' }}>Your Cart</h1>

            <div className="cart-layout">
                <div className="cart-items">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50%' }}>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{
                                                width: '80px', height: '80px', borderRadius: '8px',
                                                overflow: 'hidden', background: '#f9f9f9', flexShrink: 0
                                            }}>
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/150'}
                                                    alt={item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.name}</h4>
                                                <small style={{ color: '#888' }}>{item.weight}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>₹{item.price}</td>
                                    <td>
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >−</button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{item.price * item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn-icon-danger"
                                            onClick={() => removeFromCart(item._id)}
                                            title="Remove Item"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '30px' }}>
                        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                            <i className="fas fa-arrow-left"></i> Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* --- Cart Summary Sidebar --- */}
                <div className="cart-summary">
                    <h3>Order Summary</h3>

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{total}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span style={{ color: 'var(--secondary)' }}>Free</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total">
                        <span>Total (INR)</span>
                        <span>₹{total}</span>
                    </div>

                    <Link to="/checkout" className="btn" style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                        Proceed to Checkout
                    </Link>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <i className="fas fa-shield-alt"></i> Secure Checkout
                    </div>
                </div>
            </div>
        </main>
    );
}
