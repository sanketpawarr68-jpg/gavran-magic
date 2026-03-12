
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/150';
    if (imgPath.startsWith('data:image')) return imgPath; // Support base64 strings exactly as they are

    if (imgPath.startsWith('http')) {
        const filename = imgPath.split('/').pop();
        return `/images/${filename}`;
    }
    return `/images/${imgPath}`;
};

export default function CartPage() {
    const { cart, setCart, removeFromCart, updateQuantity, total, getEffectivePrice } = useCart();

    React.useEffect(() => {
        const syncCartStatuses = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products/`);
                const activeProducts = res.data;
                const activeIds = activeProducts.map(p => p._id);

                // Update cart items in context if their status changed in backend
                // Note: items not in activeProducts are considered 'inactive'
                const updatedCart = cart.map(item => {
                    const serverProduct = activeProducts.find(p => p._id === item._id);
                    if (!serverProduct) {
                        return { ...item, status: 'inactive' };
                    }
                    return { ...item, status: 'active' };
                });

                // Only update if something changed to avoid re-renders
                if (JSON.stringify(updatedCart) !== JSON.stringify(cart)) {
                    // We need setCart from useCart, checking if it exports it
                    if (setCart) {
                        setCart(updatedCart);
                    }
                }
            } catch (err) {
                console.error("Cart sync error:", err);
            }
        };
        if (cart.length > 0) syncCartStatuses();
    }, []);

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
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => {
                                const effectivePrice = getEffectivePrice(item);
                                const isUnavailable = item.status === 'inactive';
                                
                                return (
                                    <tr key={item._id} style={{ opacity: isUnavailable ? 0.7 : 1 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{
                                                    width: '80px', height: '80px', borderRadius: '8px',
                                                    overflow: 'hidden', background: '#f9f9f9', flexShrink: 0,
                                                    filter: isUnavailable ? 'grayscale(100%)' : 'none',
                                                    position: 'relative'
                                                }}>
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                                    />
                                                    {isUnavailable && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0, left: 0, right: 0, bottom: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(255, 255, 255, 0.7)',
                                                            color: '#e53e3e',
                                                            fontSize: '0.65rem',
                                                            fontWeight: '900',
                                                            textAlign: 'center',
                                                            lineHeight: '1.1',
                                                            textTransform: 'uppercase',
                                                            padding: '4px'
                                                        }}>
                                                            Product is Unavailable
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.name}</h4>
                                                    <small style={{ color: '#888' }}>{item.weight || '500g'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>₹{effectivePrice}</div>
                                            {item.discount > 0 && <div style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'line-through' }}>₹{item.price}</div>}
                                        </td>
                                        <td>
                                            <div className="quantity-control">
                                                <button
                                                    onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                    disabled={item.quantity <= 1 || isUnavailable}
                                                >−</button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    disabled={(item.stock !== undefined && item.quantity >= item.stock) || isUnavailable}
                                                >+</button>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: isUnavailable ? '#ccc' : 'var(--primary)' }}>
                                            ₹{effectivePrice * item.quantity}
                                        </td>
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
                                );
                            })}
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
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>Calculated at checkout</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total">
                        <span>Total (INR)</span>
                        <span>₹{total}</span>
                    </div>

                    <Link 
                        to={cart.some(i => i.status === 'inactive') ? '#' : '/checkout'} 
                        className="btn" 
                        style={{ 
                            width: '100%', 
                            textAlign: 'center', 
                            marginTop: '20px',
                            opacity: cart.some(i => i.status === 'inactive') ? 0.5 : 1,
                            cursor: cart.some(i => i.status === 'inactive') ? 'not-allowed' : 'pointer',
                            background: cart.some(i => i.status === 'inactive') ? '#ccc' : ''
                        }}
                        onClick={(e) => {
                            if (cart.some(i => i.status === 'inactive')) {
                                e.preventDefault();
                                alert("Please remove unavailable products before checking out.");
                            }
                        }}
                    >
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
