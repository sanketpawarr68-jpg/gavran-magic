
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

    function addToCart(product) {
        setCart(prevCart => {
            const existing = prevCart.find(item => item._id === product._id);
            if (existing) {
                alert('Added to cart!');
                return prevCart.map(item =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            alert('Added to cart!');
            return [...prevCart, { ...product, quantity: 1 }];
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
            prevCart.map(item =>
                item._id === id ? { ...item, quantity: parseInt(quantity) } : item
            )
        );
    }

    function clearCart() {
        setCart([]);
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}
