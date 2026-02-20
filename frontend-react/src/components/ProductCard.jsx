
import React from 'react';
import { useCart } from '../context/CartContext';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useUser();
    const clerk = useClerk();
    const navigate = useNavigate();

    // Images are now full URLs from the backend.
    // Fallback: serve relative paths from GitHub Pages frontend.
    const getImageUrl = (imgPath) => {
        if (!imgPath) return 'https://via.placeholder.com/300';
        if (imgPath.startsWith('http')) return imgPath;
        return `${API_BASE_URL}/${imgPath}`;
    };

    const handleAction = (e, action) => {
        e.preventDefault();

        if (!user) {
            clerk.openSignIn();
            return;
        }

        addToCart(product);

        if (action === 'buy') {
            navigate('/checkout');
        }
    };

    return (
        <div className="product-card">
            <div className="product-img-wrapper">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="product-img"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
                />
            </div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <span className="weight-badge">{product.weight}</span>
                <div className="product-meta">
                    <span className="price">₹{product.price}</span>
                    <div className="card-actions">
                        <button
                            className="btn"
                            onClick={(e) => handleAction(e, 'add')}
                            disabled={product.inStock === false}
                        >
                            Add
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={(e) => handleAction(e, 'buy')}
                            disabled={product.inStock === false}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
