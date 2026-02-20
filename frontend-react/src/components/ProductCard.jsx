
import React from 'react';
import { useCart } from '../context/CartContext';
import { useUser, useClerk } from '@clerk/clerk-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useUser();
    const clerk = useClerk();

    const handleAction = (e, action) => {
        e.preventDefault();

        if (!user) {
            clerk.openSignIn();
            return;
        }

        addToCart(product);

        if (action === 'buy') {
            window.location.href = '/checkout';
        }
    };

    return (
        <div className="product-card">
            <div className="product-img-wrapper">
                <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="product-img"
                />
            </div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <span className="weight-badge">{product.weight}</span>
                <div className="product-meta" style={{ marginTop: '15px' }}>
                    <span className="price">₹{product.price}</span>
                    <button
                        className="btn"
                        onClick={(e) => handleAction(e, 'add')}
                        disabled={product.inStock === false}
                    >
                        Add
                    </button>
                    <button
                        className="btn btn-secondary"
                        style={{ marginLeft: '10px' }}
                        onClick={(e) => handleAction(e, 'buy')}
                        disabled={product.inStock === false}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
