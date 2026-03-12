import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="footer-container" style={{ background: 'linear-gradient(to bottom, #111, #000)', color: '#eee', padding: '70px 20px 30px', marginTop: '80px', fontFamily: '"Inter", sans-serif', borderTop: '4px solid var(--primary)' }}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .footer-container { padding: 50px 15px 25px !important; text-align: center; }
                        .footer-main-grid { gap: 35px !important; grid-template-columns: 1fr !important; }
                        .footer-brand { align-items: center; }
                        .footer-main-grid h3 span { left: 50% !important; transform: translateX(-50%); }
                        .footer-social-row { justify-content: center; }
                        .footer-copyright { flex-direction: column !important; justify-content: center !important; gap: 15px !important; text-align: center; }
                    }
                    @media (min-width: 769px) and (max-width: 1024px) {
                        .footer-main-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 40px !important; }
                    }
                `}
            </style>
            <div className="footer-main-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '50px' }}>

                {/* Brand Section */}
                <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column' }}>
                    <img src="/images/company_logo.jpg" alt="Gavran Magic Foods" style={{ height: '70px', width: 'auto', marginBottom: '15px', alignSelf: 'flex-start' }} />
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.7', opacity: '0.7', marginBottom: '25px' }}>
                        {t('footer_desc')}
                    </p>
                    <div className="footer-social-row" style={{ display: 'flex', gap: '15px' }}>
                        <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-3px)' }} onMouseOut={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(0)' }}>
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-3px)' }} onMouseOut={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(0)' }}>
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-3px)' }} onMouseOut={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(0)' }}>
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-3px)' }} onMouseOut={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(0)' }}>
                            <i className="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600', position: 'relative', paddingBottom: '10px' }}>
                        {t('nav_shop')}
                        <span style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '3px', background: 'var(--primary)', borderRadius: '2px' }}></span>
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/shop" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>All Products</Link></li>
                        <li><Link to="/tracking" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>{t('nav_track')}</Link></li>
                        <li><Link to="/cart" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>{t('nav_cart')}</Link></li>
                        <li><Link to="/profile" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>{t('nav_profile')}</Link></li>
                    </ul>
                </div>

                {/* Customer Support */}
                <div>
                    <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600', position: 'relative', paddingBottom: '10px' }}>
                        Help & Policies
                        <span style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '3px', background: 'var(--primary)', borderRadius: '2px' }}></span>
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/contact" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>Contact Support</Link></li>
                        <li><Link to="/shipping-policy" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>Shipping & Delivery</Link></li>
                        <li><Link to="/refund-policy" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>Refund & Returns</Link></li>
                        <li><Link to="/terms" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>Terms & Conditions</Link></li>
                        <li><Link to="/privacy-policy" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#aaa'}>Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600', position: 'relative', paddingBottom: '10px' }}>
                        {t('stay_connected')}
                        <span style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '3px', background: 'var(--primary)', borderRadius: '2px' }}></span>
                    </h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: '0.7', marginBottom: '15px' }}>
                        {t('newsletter_desc')}
                    </p>
                    <form onSubmit={e => { e.preventDefault(); alert("Thanks for subscribing!"); }} style={{ display: 'flex', gap: '5px' }}>
                        <input type="email" placeholder={t('email_placeholder')} required style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: 'none', outline: 'none', fontSize: '0.9rem', background: '#222', color: 'white' }} />
                        <button type="submit" style={{ padding: '0 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.3s' }} onMouseOver={e => e.target.style.background = '#d86b00'} onMouseOut={e => e.target.style.background = 'var(--primary)'}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>

            </div>

            {/* Copyright Bar */}
            <div className="footer-copyright" style={{ maxWidth: '1200px', margin: '50px auto 0', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center', fontSize: '0.85rem', color: '#777' }}>
                <p style={{ margin: 0 }}>{t('footer_copyright')}</p>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span>Secure Payments</span>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '1.2rem', color: '#555' }}>
                        <i className="fab fa-cc-visa"></i>
                        <i className="fab fa-cc-mastercard"></i>
                        <i className="fab fa-google-pay"></i>
                        <i className="fab fa-amazon-pay"></i>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
