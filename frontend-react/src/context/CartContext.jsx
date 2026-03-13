
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Helper to get discounted price
    const getEffectivePrice = (item) => {
        if (item.discount > 0) {
            return Math.round(item.price * (1 - item.discount / 100));
        }
        return item.price;
    };

    function addToCart(product, qty = 1, selectedSize = null) {
        setCart(prevCart => {
            const itemKey = selectedSize ? `${product._id}-${selectedSize}` : product._id;
            const existing = prevCart.find(item => (item.selectedSize ? `${item._id}-${item.selectedSize}` : item._id) === itemKey);
            
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + qty;

            // Check stock
            if (product.stock !== undefined && newQty > product.stock) {
                alert(`Sorry, only ${product.stock} units available.`);
                return prevCart;
            }

            if (existing) {
                return prevCart.map(item =>
                    (item.selectedSize ? `${item._id}-${item.selectedSize}` : item._id) === itemKey 
                        ? { ...item, quantity: newQty } 
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: qty, selectedSize }];
        });
    }

    function removeFromCart(id, size = null) {
        const itemKey = size ? `${id}-${size}` : id;
        setCart(prevCart => prevCart.filter(item => (item.selectedSize ? `${item._id}-${item.selectedSize}` : item._id) !== itemKey));
    }

    function updateQuantity(id, quantity, size = null) {
        if (quantity < 1) {
            removeFromCart(id, size);
            return;
        }

        const itemKey = size ? `${id}-${size}` : id;
        setCart(prevCart =>
            prevCart.map(item => {
                if ((item.selectedSize ? `${item._id}-${item.selectedSize}` : item._id) === itemKey) {
                    // Check stock during manual update
                    if (item.stock !== undefined && quantity > item.stock) {
                        alert(`Only ${item.stock} available`);
                        return item;
                    }
                    return { ...item, quantity: parseInt(quantity) };
                }
                return item;
            })
        );
    }

    function clearCart() {
        setCart([]);
    }

    const total = cart.reduce((sum, item) => sum + (getEffectivePrice(item) * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            setCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            cartCount,
            getEffectivePrice
        }}>
            {children}
        </CartContext.Provider>
    );
}
