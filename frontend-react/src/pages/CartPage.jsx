
import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
    const { t } = useLanguage();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [syncToast, setSyncToast] = React.useState('');

    React.useEffect(() => {
        const syncCartStatuses = async (silent = false) => {
            if (!silent) setIsSyncing(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products/`);
                const activeProducts = res.data;

                setCart(prevCart => {
                    let changed = false;
                    const updated = prevCart.map(item => {
                        const serverProduct = activeProducts.find(p => p._id === item._id);
                        const newStatus = serverProduct?.status || 'inactive';
                        if (item.status !== newStatus) {
                            changed = true;
                            if (newStatus === 'inactive') setSyncToast(`'${item.name}' is now unavailable.`);
                            return { ...item, status: newStatus };
                        }
                        return item;
                    });
                    
                    if (changed) {
                        setTimeout(() => setSyncToast(''), 4000);
                        return updated;
                    }
                    return prevCart;
                });
            } catch (err) {
                console.error("Cart sync error:", err);
            } finally {
                if (!silent) setIsSyncing(false);
            }
        };

        if (cart.length > 0) syncCartStatuses();

        const interval = setInterval(() => {
            if (cart.length > 0) syncCartStatuses(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [cart.length]);

    if (cart.length === 0) {
        return (
            <main className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px', opacity: 0.5 }}>
                    <i className="fas fa-shopping-basket" style={{ fontSize: '3rem', color: 'var(--dark)' }}></i>
                </div>
                <h2 style={{ marginBottom: '15px' }}>{t('cart_empty')}</h2>
                <p style={{ color: '#777', marginBottom: '20px' }}>{t('cart_empty_msg')}</p>
                <Link to="/shop" className="btn">{t('start_shopping')}</Link>
            </main>
        );
    }

    return (
        <main className="container" style={{ padding: '20px 0', position: 'relative' }}>
            <h1 className="section-title" style={{ marginTop: 0, textAlign: 'left', marginBottom: '15px' }}>{t('cart_title')}</h1>

            {syncToast && (
                <div className="fade-in" style={{
                    position: 'fixed',
                    top: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: '#e74c3c',
                    color: 'white',
                    padding: '12px 25px',
                    borderRadius: '50px',
                    fontWeight: '700',
                    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <i className="fas fa-exclamation-circle"></i>
                    {syncToast}
                </div>
            )}

            <div className="cart-layout">
                <div className="cart-items">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50%' }}>{t('cart_product')}</th>
                                <th>{t('cart_price')}</th>
                                <th>{t('cart_quantity')}</th>
                                <th>{t('cart_subtotal')}</th>
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
                                                            {t('product_unavailable_cart')}
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
                            <i className="fas fa-arrow-left"></i> {t('continue_shopping')}
                        </Link>
                    </div>
                </div>

                {/* --- Cart Summary Sidebar --- */}
                <div className="cart-summary" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <h3>{t('order_summary')}</h3>

                    <div className="summary-row">
                        <span>{t('cart_subtotal')}</span>
                        <span>₹{total}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t('shipping_policy_title') || (t('nav_home') === 'होम' ? 'डिलिव्हरी' : 'Shipping')}</span>
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>{t('shipping_at_checkout')}</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total">
                        <span>{t('total')} (INR)</span>
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
                                alert(t('remove_unavailable'));
                            }
                        }}
                    >
                        {t('proceed_checkout')}
                    </Link>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <i className="fas fa-shield-alt"></i> {t('secure_checkout')}
                    </div>
                </div>
            </div>
        </main>
    );
}
