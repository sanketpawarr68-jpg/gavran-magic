
import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../config';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [qty, setQty] = React.useState(1);
    const [added, setAdded] = React.useState(false);

    const getImageUrl = (imgPath) => {
        if (!imgPath) return 'https://via.placeholder.com/300';
        if (imgPath.startsWith('data:image')) return imgPath; // Support base64 uploads

        // If it's a full URL, but is the Netlify one, we can optionally try to map to local if in dev
        if (imgPath.startsWith('http')) {
            const filename = imgPath.split('/').pop();
            return `/images/${filename}`;
        }
        return `/images/${imgPath}`;
    };

    const handleAction = (e, action) => {
        e.preventDefault();
        e.stopPropagation(); // Avoid navigating if clicking card elsewhere

        if (!user) {
            navigate('/login');
            return;
        }

        addToCart(product, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);

        if (action === 'buy') {
            navigate('/checkout');
        }
    };

    return (
        <div className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
            <div className="product-img-wrapper" style={{ 
                cursor: 'pointer', 
                position: 'relative',
                overflow: 'hidden'
            }}>
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="product-img"
                    style={{
                        filter: product.status === 'inactive' ? 'grayscale(100%)' : 'none',
                        opacity: product.status === 'inactive' ? 0.8 : 1,
                        transition: 'all 0.4s ease'
                    }}
                    onError={(e) => {
                        if (!e.target.src.includes('placeholder')) {
                            e.target.src = 'https://via.placeholder.com/300';
                        }
                    }}
                />
                
                {product.status === 'inactive' && (
                    <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '-35px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        padding: '5px 40px',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        transform: 'rotate(-45deg)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {t('nav_home') === 'होम' ? 'लवकरच' : 'Soon Back'}
                    </div>
                )}
            </div>
            <div className="product-info">
                <h3 style={{ cursor: 'pointer' }}>{product.name}</h3>
                <p>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="weight-badge">{product.weight || '500g'}</span>
                    <div className="price-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className="price">₹{product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price}</span>
                        {product.discount > 0 && <span className="old-price" style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#888' }}>₹{product.price}</span>}
                    </div>
                </div>

                <div className="stock-info" style={{ marginBottom: '10px' }}>
                    {product.stock <= 0 ? (
                        <span style={{
                            fontSize: '0.8rem',
                            color: '#e74c3c',
                            fontWeight: '800',
                            background: '#fff5f5',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ffcfcf',
                            display: 'inline-block'
                        }}>
                            {t('out_of_stock')}
                        </span>
                    ) : (
                        <span style={{
                            fontSize: '0.75rem',
                            color: product.stock <= 5 ? '#e67e22' : '#27ae60',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span style={{ width: '6px', height: '6px', background: product.stock <= 5 ? '#e67e22' : '#27ae60', borderRadius: '50%' }}></span>
                            {product.stock <= 5 ? t('only_left').replace('{count}', product.stock) : `${product.stock} ${t('nav_home') === 'होम' ? 'उपलब्ध' : 'available'}`}
                        </span>
                    )}
                </div>

                <div className="card-controls" onClick={(e) => e.stopPropagation()}>
                    {product.status === 'inactive' ? (
                        <div style={{
                            color: '#e74c3c',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            width: '100%',
                            padding: '12px 8px',
                            background: '#fff5f5',
                            border: '1px solid #ffcfcf',
                            borderRadius: '12px',
                            marginTop: '10px',
                            lineHeight: '1.4',
                            boxShadow: '0 2px 8px rgba(231, 76, 60, 0.05)'
                        }}>
                            <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
                            {t('nav_home') === 'होम' ? 'उत्पादन सध्या उपलब्ध नाही, लवकरच येईल...' : 'Product is Unavailable currently it will Available Soon......'}
                        </div>
                    ) : (
                        <>
                            <div className="mini-qty">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={product.stock <= 0}>-</button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(qty + 1)} disabled={product.stock <= 0}>+</button>
                            </div>
                            <div className="card-actions">
                                <button
                                    className={`btn ${added ? 'added' : ''}`}
                                    onClick={(e) => handleAction(e, 'add')}
                                    disabled={product.stock <= 0 || added}
                                >
                                    {added ? '✓' : t('nav_home') === 'होम' ? 'टाका' : 'Add'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={(e) => handleAction(e, 'buy')}
                                    disabled={product.stock <= 0}
                                >
                                    {t('buy_now')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
