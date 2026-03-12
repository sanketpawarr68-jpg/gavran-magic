
import React, { useState, useEffect, useRef } from 'react';
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
            setLoading(true);
            try {
                // Fetch current product
                const prodRes = await axios.get(`${API_BASE_URL}/api/products/${id}`);
                setProduct(prodRes.data);
                setSelectedImage(getImageUrl(prodRes.data.image));

                // Fetch all products for related section
                const allRes = await axios.get(`${API_BASE_URL}/api/products/`);
                setAllProducts(allRes.data.filter(p => p._id !== id));

                // Fetch reviews from DB
                const reviewRes = await axios.get(`${API_BASE_URL}/api/products/${id}/reviews`);
                setReviews(reviewRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Product not found");
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddToCart = (action) => {
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(product, quantity);
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
                        <p className="weight-info">{product.weight} - {product.category || (t('nav_home') === 'होम' ? 'शुद्ध हस्तनिर्मित' : 'Pure Handmade')}</p>

                        <div className="price-box">
                            <span className="current-price">₹{product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price}</span>
                            {product.discount > 0 && (
                                <>
                                    <span className="old-price">₹{product.price}</span>
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
                            <div className="spec-item">
                                <span className="label">{t('nav_home') === 'होम' ? 'वजन' : 'Weight'}</span>
                                <span className="val">{product.weight || '500g'}</span>
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

                        <div className="order-controls">
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

            {/* Related Products */}
            {allProducts.length > 0 && (
                <section className="container" style={{ padding: '60px 0', borderTop: '1px solid #eee' }}>
                    <h2 style={{ marginBottom: '30px', fontSize: '1.8rem', fontWeight: 800 }}>
                        {t('related_products')}
                    </h2>
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
                                {[0].map(s => (
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
