import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getVisitorId } from '../utils/visitor';
import { useAuth } from '../context/AuthContext';

const PromoBanner = () => {
    const [offer, setOffer] = useState(null);
    const [eligible, setEligible] = useState(true);
    const { user } = useAuth();
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
                setEligible(eligibilityRes.data.eligible_for_free_delivery);

                const res = await axios.get(`${API_BASE_URL}/api/offers/`);
                // Find first offer that is active and flagged for banner
                const activeBannerOffer = res.data.find(o => o.status === 'active' && o.is_banner_offer && o.is_currently_valid);
                if (activeBannerOffer) {
                    // Specific logic: if it's the free delivery offer text, check eligibility
                    const isFreeDeliveryOffer = activeBannerOffer.title.toLowerCase().includes('free delivery') || 
                                              activeBannerOffer.description.toLowerCase().includes('free delivery');
                    
                    if (isFreeDeliveryOffer && !eligibilityRes.data.eligible_for_free_delivery) {
                        setOffer(null);
                    } else {
                        setOffer(activeBannerOffer);
                    }
                }
            } catch (err) {
                console.error("Banner offer fetch error:", err);
            }
        };
        checkEligibilityAndFetchOffer();
    }, [user]);

    if (!offer || !eligible && (offer.title.toLowerCase().includes('free delivery') || offer.description.toLowerCase().includes('free delivery'))) return null;

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
