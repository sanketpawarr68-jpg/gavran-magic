
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

    const [appliedDiscount, setAppliedDiscount] = useState({
        code: '',
        type: 'percentage',
        value: 0
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Helper to get discounted price
    const getEffectivePrice = (item) => {
        // If a specific size was selected, the item.price should already be the variant price (if set in addToCart)
        // However, we want to be safe and ensure we apply discount correctly to the variant price
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

            // Determine correct price based on variant
            let finalPrice = product.price;
            if (selectedSize && product.pack_sizes && product.pack_sizes.length > 0) {
                const variant = product.pack_sizes.find(v => v.size === selectedSize);
                if (variant) {
                    finalPrice = variant.price;
                }
            }

            if (existing) {
                return prevCart.map(item =>
                    (item.selectedSize ? `${item._id}-${item.selectedSize}` : item._id) === itemKey 
                        ? { ...item, quantity: newQty, price: finalPrice } 
                        : item
                );
            }
            return [...prevCart, { ...product, price: finalPrice, quantity: qty, selectedSize }];
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
        setAppliedDiscount({ code: '', type: 'percentage', value: 0 });
    }

    function applyDiscount(offer) {
        setAppliedDiscount({
            code: offer.code,
            type: offer.discount_type,
            value: parseFloat(offer.discount_value)
        });
    }

    const subtotal = cart.reduce((sum, item) => sum + (getEffectivePrice(item) * item.quantity), 0);
    
    let totalAfterDiscount = subtotal;
    if (appliedDiscount.value > 0) {
        if (appliedDiscount.type === 'percentage') {
            totalAfterDiscount = subtotal * (1 - appliedDiscount.value / 100);
        } else {
            totalAfterDiscount = Math.max(0, subtotal - appliedDiscount.value);
        }
    }

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            setCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total: totalAfterDiscount,
            subtotal,
            appliedDiscount,
            applyDiscount,
            cartCount,
            getEffectivePrice
        }}>
            {children}
        </CartContext.Provider>
    );
}
