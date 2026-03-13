import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const RefundPolicy = () => {
    const [settings, setSettings] = useState({
        refund_hour_grace_period: 24,
        refund_policy_text: '',
        return_policy_text: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/settings/`);
                setSettings(res.data);
            } catch (err) {
                console.error("Policy fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return (
        <main className="container fade-in" style={{ padding: '80px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: '"Work Sans", sans-serif' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: 'var(--dark)' }}>Refund & Return</h1>
            <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '50px' }}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>1. Order Cancellations</h2>
                    <div style={{ background: '#fff7ed', padding: '25px', borderRadius: '16px', border: '1px solid #ffedd5', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#9a3412', marginBottom: '10px' }}><i className="fas fa-clock"></i> {settings.refund_hour_grace_period}-Hour Grace Period</h3>
                        <p style={{ margin: 0, color: '#c2410c', lineHeight: '1.6' }}>
                            {settings.refund_policy_text || `Because our kitchen starts preparing your fresh orders immediately, you can only cancel your order within ${settings.refund_hour_grace_period} hours of placement. After this window, the order is confirmed and cannot be cancelled.`}
                        </p>
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>2. Return Eligibility</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>
                        {settings.return_policy_text || "As we deal in fresh, handmade food items, returns are generally not accepted for hygiene reasons. However, if you receive a damaged or incorrect product, we've got you covered!"}
                        {!settings.return_policy_text && (
                            <>
                                <br /><br />
                                Please contact us within **24 hours** of delivery with a clear photo of the package to initiate a replacement or refund.
                            </>
                        )}
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>3. Processing Refunds</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>
                        Approved refunds are processed within 5-7 business days and will be credited back to your original payment method (UPI, Bank, or Card).
                    </p>
                </section>
            </div>
        </main>
    );
};

export default RefundPolicy;
