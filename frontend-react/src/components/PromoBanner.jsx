import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getVisitorId } from '../utils/visitor';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const PromoBanner = () => {
    const [offer, setOffer] = useState(null);
    const [eligible, setEligible] = useState(true);
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        const checkEligibilityAndFetchOffer = async () => {
            try {
                const vid = getVisitorId();
                const uid = user ? (user._id || user.id) : null;
                
                // Check eligibility for free delivery
                const eligibilityRes = await axios.post(`${API_BASE_URL}/api/orders/eligibility`, {
                    user_id: uid,
                    device_id: vid
                });
                const isEligible = eligibilityRes.data.eligible_for_free_delivery;
                setEligible(isEligible);

                const res = await axios.get(`${API_BASE_URL}/api/offers/`);
                // Find first offer that is active and flagged for banner
                const activeBannerOffer = res.data.find(o => o.status === 'active' && o.is_banner_offer && o.is_currently_valid);
                
                if (activeBannerOffer) {
                    // Check if this banner is about free delivery
                    const titleText = activeBannerOffer.title.toLowerCase();
                    const descText = activeBannerOffer.description.toLowerCase();
                    const isFreeDeliveryOffer = titleText.includes('free delivery') || 
                                              descText.includes('free delivery') ||
                                              titleText.includes('मोफत डिलिव्हरी') ||
                                              descText.includes('मोफत डिलिव्हरी');
                    
                    if (isFreeDeliveryOffer && !isEligible) {
                        setOffer(null);
                    } else {
                        setOffer(activeBannerOffer);
                    }
                } else if (isEligible) {
                    // FALLBACK: Auto-show free delivery banner for new customers
                    setOffer({
                        title: t('special_offer'),
                        description: t('promo_msg_offer'),
                        redirect_url: '/shop',
                        is_fallback: true
                    });
                } else {
                    setOffer(null);
                }
            } catch (err) {
                console.error("Banner offer fetch error:", err);
            }
        };
        checkEligibilityAndFetchOffer();
    }, [user, language]);

    if (!offer) return null;
    
    // Safety check again for fallback text
    if (!eligible && (offer.title.toLowerCase().includes('free delivery') || offer.description.toLowerCase().includes('free delivery'))) return null;

    return (
        <div 
            className="promo-banner-container clickable-banner" 
            onClick={() => navigate(offer.redirect_url || '/shop')}
            style={{ cursor: 'pointer' }}
        >
            <div className="promo-marquee-flex">
                <div className="promo-item">
                    ✨ <strong>{offer.title}:</strong> {offer.description} {offer.code && <span>Code: <b>{offer.code}</b></span>} 🚚
                </div>
                <div className="promo-item">
                    ✨ <strong>{offer.title}:</strong> {offer.description} {offer.code && <span>Code: <b>{offer.code}</b></span>} 🚚
                </div>
                <div className="promo-item">
                    ✨ <strong>{offer.title}:</strong> {offer.description} {offer.code && <span>Code: <b>{offer.code}</b></span>} 🚚
                </div>
            </div>
        </div>
    );
};

export default PromoBanner;
