import React from 'react';

const PrivacyPolicy = () => {
    return (
        <main className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: '"Inter", sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', color: '#1a1a1a' }}>Privacy Policy</h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>1. Introduction</h2>
                <p>Welcome to Gavran Magic. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>2. Data Protection (How we protect customer data)</h2>
                <p>We take your security seriously. All the data collected on Gavran Magic, including personal details and payment information, is encrypted using secure socket layer technology (SSL) and stored securely. Your payment details are never stored directly on our servers; they are processed securely directly by our trusted payment gateways.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>3. Customer Rights (What users can do with their data)</h2>
                <p>Under data protection laws, you have rights in relation to your personal data. You have the right to:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li><strong>Request access</strong> to your personal data (commonly known as a "data subject access request").</li>
                    <li><strong>Request correction</strong> of the personal data that we hold about you.</li>
                    <li><strong>Request erasure</strong> of your personal data when there is no good reason for us continuing to process it.</li>
                    <li><strong>Withdraw consent</strong> at any time where we are relying on consent to process your personal data.</li>
                </ul>
                <p style={{ marginTop: '10px' }}>To exercise these rights, please contact our support team.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>4. Policy Updates</h2>
                <p>We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. The latest version will always be posted on this page.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>5. Contact Information</h2>
                <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px', listStyle: 'none' }}>
                    <li><i className="fas fa-envelope" style={{ width: '20px', color: 'var(--primary)' }}></i> <strong>Email:</strong> support@gavranmagic.com</li>
                    <li><i className="fas fa-phone-alt" style={{ width: '20px', color: 'var(--primary)' }}></i> <strong>Phone:</strong> +91 98765 43210</li>
                    <li><i className="fas fa-map-marker-alt" style={{ width: '20px', color: 'var(--primary)' }}></i> <strong>Address:</strong> Gavran Magic Kitchen, Pune, Maharashtra, India</li>
                </ul>
            </section>
        </main>
    );
};

export default PrivacyPolicy;
