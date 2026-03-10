import React from 'react';

const Terms = () => {
    return (
        <main className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: '"Inter", sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', color: '#1a1a1a' }}>Terms & Conditions</h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
                <p>Welcome to Gavran Magic! By accessing and buying handmade products off this website, you fully accept and agree to be legally bound by these conditions. Any regular participation in this service will constitute explicit acceptance of this agreement and any disputes thereof.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>2. Acceptable Site Use</h2>
                <p>You may use Gavran Magic solely for finding and purchasing Maharashtrian authentic foods. You are responsible for ensuring that all data input into our checkout and registration forms—especially the delivery credentials—are correct and wholly accurate. Falsely placing orders to cause operational stress allows us to suspend user privileges.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>3. Product Quality & Information</h2>
                <p>Because Gavran Magic deals in traditional handmade snacks, small irregularities in the size, shape, or color of products like Kurdai and Papad are indicative of the authentic homemade process rather than machinery. We pledge maximum hygiene and standard weights.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>4. Mandated Cancellation Policy Reminder</h2>
                <p style={{ fontWeight: '600', color: 'var(--danger)' }}>AS PER OUR STANDARD REFUND POLICY:</p>
                <p>You may only cancel any food purchasing orders <strong>strictly within a 2 to 3 hour window</strong> of initially placing them on the web-store. Post this short grace period, cancellations are completely void as the processing and kitchen stage begins immediately.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>5. Limitation of Liability</h2>
                <p>Our overall financial liability—concerning any delayed transit times, lost packages, or related incidental frustrations—strictly does not exceed the maximum cart/transaction amount the user originally paid during their digital checkout journey.</p>
            </section>
        </main>
    );
};

export default Terms;
