
import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

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
            <div className="product-img-wrapper" style={{ cursor: 'pointer' }}>
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="product-img"
                    onError={(e) => {
                        if (!e.target.src.includes('placeholder')) {
                            e.target.src = 'https://via.placeholder.com/300';
                        }
                    }}
                />
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
                            OUT OF STOCK
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
                            {product.stock <= 5 ? `Only ${product.stock} products available!` : `${product.stock} products available`}
                        </span>
                    )}
                </div>

                <div className="card-controls" onClick={(e) => e.stopPropagation()}>
                    <div className="mini-qty">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={product.stock <= 0}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(qty + 1)} disabled={product.stock <= 0}>+</button>
                    </div>
                    <div className="card-actions">
                        <button
                            className="btn"
                            onClick={(e) => handleAction(e, 'add')}
                            disabled={product.stock <= 0 || added}
                            style={{ background: added ? 'var(--secondary)' : 'var(--dark)' }}
                        >
                            {added ? 'Added!' : 'Add'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={(e) => handleAction(e, 'buy')}
                            disabled={product.stock <= 0}
                        >
                            Buy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
