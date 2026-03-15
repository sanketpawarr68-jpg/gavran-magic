
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../config';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [added, setAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const buyButtonRef = useRef(null);

    const getCurrentPrice = () => {
        if (!product) return 0;
        if (product.pack_sizes && product.pack_sizes.length > 0 && selectedSize) {
            const variant = product.pack_sizes.find(v => v.size === selectedSize);
            return variant ? variant.price : product.price;
        }
        return product.price;
    };

    const [newReview, setNewReview] = useState({ rating: 5, title: "", comment: "" });
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const fileInputRef = useRef(null);

    const getImageUrl = (imgPath) => {
        if (!imgPath) return 'https://via.placeholder.com/600';
        if (imgPath.startsWith('data:image')) return imgPath;

        if (imgPath.startsWith('http')) {
            const filename = imgPath.split('/').pop();
            return `/images/${filename}`;
        }
        return `/images/${imgPath}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            // PROACTIVE: Try to load from cache immediately for zero-lag feeling
            let cachedProd = null;
            try {
                const cachedData = localStorage.getItem('products_cache');
                if (cachedData) {
                    const productsList = JSON.parse(cachedData);
                    cachedProd = productsList.find(p => p._id === id);
                    if (cachedProd) {
                        setProduct(cachedProd);
                        setSelectedImage(getImageUrl(cachedProd.image));
                        setSelectedSize((cachedProd.pack_sizes && cachedProd.pack_sizes.length > 0) ? cachedProd.pack_sizes[0].size : cachedProd.weight);
                        setLoading(false); 
                    }
                }
            } catch(e) {}

            if (!cachedProd) setLoading(true);

            try {
                // PARALLEL: Fetch product, related products, and reviews at once
                const [pRes, aRes, rRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/products/${id}`),
                    axios.get(`${API_BASE_URL}/api/products/`),
                    axios.get(`${API_BASE_URL}/api/products/${id}/reviews`).catch(() => ({ data: [] }))
                ]);

                const prod = pRes.data;
                setProduct(prod);
                setSelectedImage(getImageUrl(prod.image));
                setSelectedSize((prod.pack_sizes && prod.pack_sizes.length > 0) ? prod.pack_sizes[0].size : prod.weight);

                // Update Recently Viewed
                try {
                    const recent = JSON.parse(localStorage.getItem('gavran_recently_viewed') || '[]');
                    const updated = [prod, ...recent.filter(r => r._id !== prod._id)].slice(0, 6);
                    localStorage.setItem('gavran_recently_viewed', JSON.stringify(updated));
                } catch(e) {}

                // Related Products
                const others = aRes.data.filter(p => p._id !== id && p.status !== 'inactive');
                const sameCat = others.filter(p => p.category === prod.category);
                const diffCat = others.filter(p => p.category !== prod.category);
                setAllProducts([...sameCat, ...diffCat]);

                setReviews(rRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                if (!cachedProd) setError("Product not found");
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    // Sticky bar: show when buy buttons scroll out of view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setShowStickyBar(!entry.isIntersecting),
            { threshold: 0 }
        );
        if (buyButtonRef.current) observer.observe(buyButtonRef.current);
        return () => observer.disconnect();
    }, [product]);

    const handleAddToCart = (action) => {
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(product, quantity, selectedSize);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);

        if (action === 'buy') {
            navigate('/checkout');
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewPhoto(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        setIsSubmittingReview(true);
        try {
            const reviewData = {
                user_name: user.name || "Anonymous",
                user_id: user.id || "guest",
                rating: newReview.rating,
                title: newReview.title || "User Review",
                comment: newReview.comment,
                photo: previewPhoto,
                timestamp: new Date().toISOString()
            };

            await axios.post(`${API_BASE_URL}/api/products/${id}/reviews`, reviewData);

            // Refresh reviews
            const res = await axios.get(`${API_BASE_URL}/api/products/${id}/reviews`);
            setReviews(res.data);

            // Reset form
            setNewReview({ rating: 5, title: "", comment: "" });
            setPreviewPhoto(null);
        } catch (err) {
            console.error("Review Submit Error:", err);
            alert("Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert("Sharing not supported on this browser.");
        }
    };

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner"></div>
                <h3 className="loading-text">{t('loading_products')}</h3>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('loading_msg')}</p>
            </div>
        );
    }
    if (error || !product) return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}><h2>{error || "Product not found"}</h2></div>;

    // Use product specific images from DB or fallback
    const displayImages = product.images && product.images.length > 0
        ? product.images.map(img => getImageUrl(img))
        : [getImageUrl(product.image)];

    return (
        <div className="product-view-container">
            <div className="modern-breadcrumb">
                <span onClick={() => navigate('/')}>{t('nav_home')}</span> / <span>{product.name}</span>
            </div>

            <main className="product-main-content">
                <section className="product-visuals">
                    <div className="image-stage">
                        <img 
                            src={selectedImage} 
                            alt={product.name} 
                            className="active-image magnify" 
                            style={{ transition: 'transform 0.3s ease', cursor: 'zoom-in' }}
                            onMouseMove={(e) => {
                                const { left, top, width, height } = e.target.getBoundingClientRect();
                                const x = ((e.pageX - left - window.scrollX) / width) * 100;
                                const y = ((e.pageY - top - window.scrollY) / height) * 100;
                                e.target.style.transformOrigin = `${x}% ${y}%`;
                                e.target.style.transform = "scale(2)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "scale(1)";
                            }}
                        />
                    </div>
                    <div className="thumbnails-reel">
                        {displayImages.map((img, idx) => (
                            <div
                                key={idx}
                                className={`thumb-cell ${selectedImage === img ? 'active' : ''}`}
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img} alt={`view-${idx}`} />
                            </div>
                        ))}
                    </div>
                    <button className="share-btn-floating" onClick={handleShare}>🔗 {t('share_product')}</button>
                </section>

                <section className="product-details-panel">
                    <div className="detail-card">
                        <h1 className="name">{product.name}</h1>
                        {/* Average Rating Display */}
                        {reviews.length > 0 && (() => {
                            const avg = (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[1,2,3,4,5].map(s => (
                                            <span key={s} style={{ color: s <= Math.round(avg) ? '#f1c40f' : '#e0e0e0', fontSize: '1.1rem' }}>★</span>
                                        ))}
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#333' }}>{avg}</span>
                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>({reviews.length} {t('nav_home') === 'होम' ? 'परीक्षणे' : 'reviews'})</span>
                                </div>
                            );
                        })()}
                        <p className="weight-info">{product.weight} - {product.category || (t('nav_home') === 'होम' ? 'शुद्ध हस्तनिर्मित' : 'Pure Handmade')}</p>

                        <div className="price-box">
                            <span className="current-price">₹{product.discount > 0 ? Math.round(getCurrentPrice() * (1 - product.discount / 100)) : getCurrentPrice()}</span>
                            {product.discount > 0 && (
                                <>
                                    <span className="old-price">₹{getCurrentPrice()}</span>
                                    <span className="discount-badge">SAVE {product.discount}%</span>
                                </>
                            )}
                        </div>

                        <div className="quick-specs">
                            <div className="spec-item">
                                <span className="label">{t('availability')}</span>
                                <span className="val" style={{
                                    color: product.stock > 5 ? '#27ae60' : '#e74c3c',
                                    fontWeight: '700'
                                }}>
                                    {product.stock <= 0
                                        ? t('out_of_stock')
                                        : (product.stock <= 5 ? t('only_left').replace('{count}', product.stock) : `${t('in_stock')} (${product.stock})`)}
                                </span>
                            </div>
                            <div className="spec-item" style={{ gridColumn: 'span 2' }}>
                                <span className="label" style={{ display: 'block', marginBottom: '10px' }}>{t('nav_home') === 'होम' ? 'पॅकेजिंग निवडा' : 'Select Packaging'}</span>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {product.pack_sizes && product.pack_sizes.length > 0 ? (
                                        product.pack_sizes.map((p, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setSelectedSize(p.size)}
                                                style={{
                                                    padding: '8px 15px',
                                                    borderRadius: '8px',
                                                    border: `2px solid ${selectedSize === p.size ? 'var(--primary)' : '#eee'}`,
                                                    background: selectedSize === p.size ? 'rgba(var(--primary-rgb), 0.1)' : 'white',
                                                    color: selectedSize === p.size ? 'var(--primary)' : '#666',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {p.size}
                                            </button>
                                        ))
                                    ) : (
                                        <div style={{ padding: '8px 15px', borderRadius: '8px', background: '#f8f9fa', border: '1px solid #eee', fontWeight: '700' }}>
                                            {product.weight || '500g'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="description-text">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '15px' }}>{t('insight')}</h3>
                            <p style={{ marginBottom: '20px' }}>{product.description}</p>

                            {product.ingredients && (
                                <div className="info-extra-block" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid var(--secondary)' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px', textTransform: 'uppercase', color: '#666' }}>🥗 {t('ingredients')}</h4>
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{product.ingredients}</p>
                                </div>
                            )}

                            {product.cooking_instructions && (
                                <div className="info-extra-block" style={{ marginBottom: '20px', padding: '15px', background: '#fff9f0', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px', textTransform: 'uppercase', color: '#666' }}>👨‍🍳 {t('instructions')}</h4>
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{product.cooking_instructions}</p>
                                </div>
                            )}

                            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>
                                Hand-picked ingredients and traditional processing methods ensure that every bite is filled with authentic flavor and nutrition.
                            </p>
                        </div>

                        <div className="order-controls" ref={buyButtonRef}>
                            <div className="quantity-box">
                                <label>{t('nav_home') === 'होम' ? 'प्रमाण निवडा' : 'Select Quantity'}</label>
                                <div className="qty-input">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stock <= 0}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} disabled={product.stock <= 0 || quantity >= product.stock}>+</button>
                                </div>
                            </div>

                            <div className="main-actions">
                                {product.status === 'inactive' ? (
                                    <div style={{
                                        color: '#e74c3c',
                                        fontWeight: '800',
                                        fontSize: '1rem',
                                        textAlign: 'center',
                                        width: '100%',
                                        padding: '15px',
                                        background: '#fff5f5',
                                        border: '1px solid #ffcfcf',
                                        borderRadius: '12px',
                                        marginBottom: '15px'
                                    }}>
                                        Product is Unavailabe currently it will Avaialbe Soon......
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            className={`btn-add ${added ? 'added' : ''}`}
                                            onClick={() => handleAddToCart('add')}
                                            disabled={added || product.stock <= 0}
                                        >
                                            {product.stock <= 0 ? t('out_of_stock') : (added ? 'Added ✓' : t('add_to_cart'))}
                                        </button>
                                        <button className="btn-buy" onClick={() => handleAddToCart('buy')} disabled={product.stock <= 0}>
                                            {t('buy_now')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="trust-badges" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: '10px', 
                            marginTop: '25px',
                            borderTop: '1px solid #eee',
                            paddingTop: '20px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <i className="fas fa-leaf" style={{ color: '#27ae60', fontSize: '1.2rem', marginBottom: '8px' }}></i>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#666' }}>{t('nav_home') === 'होम' ? 'शुद्ध शाकाहारी' : 'Pure Veg'}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <i className="fas fa-shield-virus" style={{ color: '#e67e22', fontSize: '1.2rem', marginBottom: '8px' }}></i>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#666' }}>{t('nav_home') === 'होम' ? 'केमिकल फ्री' : 'No Chemicals'}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <i className="fas fa-certificate" style={{ color: '#f1c40f', fontSize: '1.2rem', marginBottom: '8px' }}></i>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#666' }}>{t('nav_home') === 'होम' ? 'अस्सल' : 'Authentic'}</div>
                            </div>
                        </div>

                        <div className="shipping-badges" style={{ marginTop: '20px' }}>
                            <span>🚀 {t('promo_msg_offer')}</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Sticky Add to Cart Bar */}
            {showStickyBar && product && product.status !== 'inactive' && product.stock > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: 'white', borderTop: '2px solid var(--primary)',
                    padding: '12px 20px', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
                    flexWrap: 'wrap', gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                        <img src={selectedImage} alt={product.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--dark)' }}>{product.name}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary)' }}>₹{product.discount > 0 ? Math.round(getCurrentPrice() * (1 - product.discount / 100)) : getCurrentPrice()}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8f9fa', borderRadius: '8px', padding: '4px 8px' }}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: '900', width: '28px', height: '28px' }}>-</button>
                            <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: '900', width: '28px', height: '28px' }}>+</button>
                        </div>
                        <button onClick={() => handleAddToCart('add')} disabled={added} style={{ background: added ? '#27ae60' : 'var(--primary)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                            {added ? '✓ Added!' : t('add_to_cart')}
                        </button>
                        <button onClick={() => handleAddToCart('buy')} style={{ background: 'var(--dark)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem' }}>
                            {t('buy_now')}
                        </button>
                    </div>
                </div>
            )}

            {/* You May Also Like */}
            {allProducts.length > 0 && (
                <section className="container" style={{ padding: '50px 0 20px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px' }}>
                                {t('nav_home') === 'होम' ? '✨ तुम्हाला हे आवडेल' : '✨ You May Also Like'}
                            </h2>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('nav_home') === 'होम' ? 'आमच्या इतर हातनिर्मित उत्पादनांचा आनंद घ्या' : 'Explore more handmade products from our collection'}</p>
                        </div>
                    </div>
                    <div className="products-grid">
                        {allProducts.slice(0, 4).map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Reviews Section */}
            <section className="feedback-section">
                <div className="section-header">
                    <h2>{t('feedback_title')}</h2>
                    <p>{t('total_reviews').replace('{count}', reviews.length)}</p>
                </div>

                <div className="feedback-grid">
                    <div className="add-review-card">
                        <h3>{t('post_review')}</h3>
                        <form onSubmit={submitReview}>
                            <div className="rating-select">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} onClick={() => setNewReview({ ...newReview, rating: s })} className={s <= newReview.rating ? 'active' : ''}>★</span>
                                ))}
                            </div>
                            <input
                                className="review-input"
                                placeholder={t('review_headline')}
                                value={newReview.title}
                                onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                            />
                            <textarea
                                className="review-input"
                                placeholder={t('write_review')}
                                rows="4"
                                required
                                value={newReview.comment}
                                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                            ></textarea>

                            <div className="photo-upload">
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} />
                                <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                                    {previewPhoto ? t('change_photo') : `📸 ${t('upload_photo')}`}
                                </button>
                                {previewPhoto && <div className="p-preview"><img src={previewPhoto} /><span onClick={() => setPreviewPhoto(null)}>✕</span></div>}
                            </div>

                            <button className="submit-review-btn" disabled={isSubmittingReview}>
                                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                            </button>
                        </form>
                    </div>

                    <div className="reviews-feed">
                        {reviews.length === 0 ? (
                            <div className="no-reviews">No reviews yet. Be the first to review!</div>
                        ) : (
                            reviews.map(r => (
                                <div key={r._id} className="review-bubble">
                                    <div className="r-header">
                                        <div className="r-user">
                                            <strong>{r.user_name}</strong>
                                            <div className="r-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                        </div>
                                        <span className="r-date">{r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'Recent'}</span>
                                    </div>
                                    <h5>{r.title}</h5>
                                    <p>{r.comment}</p>
                                    {r.photo && <div className="r-photo"><img src={r.photo} alt="review" /></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetail;
