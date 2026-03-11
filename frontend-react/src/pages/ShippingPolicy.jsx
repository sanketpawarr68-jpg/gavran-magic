import React from 'react';

const ShippingPolicy = () => {
    return (
        <main className="container fade-in" style={{ padding: '80px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: '"Work Sans", sans-serif' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: 'var(--dark)' }}>Shipping & Delivery</h1>
            <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '50px' }}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>1. Delivery Timelines</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>
                        All Gavran Magic orders are prepared fresh and dispatched within 2-3 business days. Since our products are handmade, we ensure maximum quality over speed!
                    </p>
                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fas fa-truck" style={{ color: 'var(--primary)' }}></i>
                                <span><strong>Within Maharashtra:</strong> 2 to 4 business days.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fas fa-globe-asia" style={{ color: 'var(--secondary)' }}></i>
                                <span><strong>Rest of India:</strong> 5 to 8 business days.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>2. Live Order Tracking</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>
                        Once your delicious treats are shipped, you'll receive a tracking ID. You can watch your package move in real-time through our dedicated **Track Order** page.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>3. Secure Packaging</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>
                        We use premium multi-layer bubble wrapping to protect fragile items like Kurdai. If you receive a box that appears heavily damaged, please refuse the delivery or contact us immediately.
                    </p>
                </section>
            </div>
        </main>
    );
};

export default ShippingPolicy;
