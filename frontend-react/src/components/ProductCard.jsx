
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
        // If it's a full URL, but is the Netlify one, we can optionally try to map to local if in dev
        if (imgPath.startsWith('http')) {
            // If the image is from the netlify site, try to use the local public folder image instead
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
                    <span className="weight-badge">{product.weight}</span>
                    <span className="price">₹{product.price}</span>
                </div>

                <div className="card-controls" onClick={(e) => e.stopPropagation()}>
                    <div className="mini-qty">
                        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(qty + 1)}>+</button>
                    </div>
                    <div className="card-actions">
                        <button
                            className="btn"
                            onClick={(e) => handleAction(e, 'add')}
                            disabled={product.inStock === false || added}
                            style={{ background: added ? 'var(--secondary)' : 'var(--dark)' }}
                        >
                            {added ? 'Added!' : 'Add'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={(e) => handleAction(e, 'buy')}
                            disabled={product.inStock === false}
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
