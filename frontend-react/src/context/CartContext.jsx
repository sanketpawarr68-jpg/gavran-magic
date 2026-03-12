
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

    function addToCart(product, qty = 1) {
        setCart(prevCart => {
            const existing = prevCart.find(item => item._id === product._id);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + qty;

            // Check stock
            if (product.stock !== undefined && newQty > product.stock) {
                alert(`Sorry, only ${product.stock} units available.`);
                return prevCart;
            }

            if (existing) {
                return prevCart.map(item =>
                    item._id === product._id ? { ...item, quantity: newQty } : item
                );
            }
            return [...prevCart, { ...product, quantity: qty }];
        });
    }

    function removeFromCart(id) {
        setCart(prevCart => prevCart.filter(item => item._id !== id));
    }

    function updateQuantity(id, quantity) {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item => {
                if (item._id === id) {
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
