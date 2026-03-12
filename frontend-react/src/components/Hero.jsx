import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
    const { t } = useLanguage();

    return (
        <section className="hero">
            <div className="container">
                <h1>{t('hero_title')}</h1>
                <p>{t('hero_subtitle')}</p>
                <div className="hero-actions" style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link to="/shop" className="btn btn-primary">{t('shop_now')}</Link>
                    <a href="#features" className="btn btn-outline" style={{ border: '2.5px solid white', color: 'white' }}>{t('learn_more')}</a>
                </div>
            </div>
        </section>
    );
}
