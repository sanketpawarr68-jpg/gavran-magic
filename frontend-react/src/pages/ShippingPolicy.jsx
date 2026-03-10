import React from 'react';

const ShippingPolicy = () => {
    return (
        <main className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: '"Inter", sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', color: '#1a1a1a' }}>Shipping & Delivery Policy</h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>1. Delivery Timelines</h2>
                <p>All Gavran Magic orders are processed, packaged, and handed over to our verified delivery partners within 2-3 business days. Note that our homemade process sometimes takes preparation time to ensure freshness!</p>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eee', marginTop: '15px' }}>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '10px' }}><strong>Within Maharashtra:</strong> Delivered in 2 to 4 business days.</li>
                        <li><strong>Rest of India:</strong> Delivered in 5 to 8 business days.</li>
                    </ul>
                </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>2. Shipping Charges</h2>
                <p>Final shipping charges for your location will be calculated completely transparently and displayed dynamically at checkout based on pincode mapping and overall package weight.</p>
                <p>Occasionally, Gavran Magic runs free delivery campaigns for bulk tier orders (e.g. Orders over ₹499), which are advertised visibly across the storefront.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>3. Order Tracking</h2>
                <p>Once your parcel has been sent to our logistics team, you will get a Shipment Confirmation including the relevant AWB/Tracking ID. Active customers can visit the dedicated 'Track Order' option on our website menu to watch their items in transit directly.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>4. Transit Damages</h2>
                <p>Gavran Magic takes immense care by deploying multiple bubble-wrap layers to safeguard fragile items like dried Kurdai or papad. If the courier violently handled your box and you receive it entirely crushed or compromised in quality, please contact us immediately.</p>
            </section>
        </main>
    );
};

export default ShippingPolicy;
