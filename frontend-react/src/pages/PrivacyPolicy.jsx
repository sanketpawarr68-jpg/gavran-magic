import React from 'react';

const PrivacyPolicy = () => {
    return (
        <main className="container fade-in" style={{ padding: '80px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: '"Work Sans", sans-serif' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: 'var(--dark)' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '50px' }}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>1. Introduction</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>Welcome to Gavran Magic. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website.</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>2. Data Protection & Security</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>We take your security seriously! All the data collected on Gavran Magic is encrypted and stored securely. Your payment details are never stored on our servers; they are handled directly by our PCI-compliant payment partners.</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px', color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>3. Your Rights</h2>
                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>You have the right to access, correct, or request the deletion of your personal information at any time. Simply reach out to our team at the email below.</p>
                </section>

                <section style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', color: 'var(--dark)' }}>Need Any Help?</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#555' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="fas fa-envelope" style={{ color: 'var(--primary)' }}></i>
                            <span>support@gavranmagic.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="fas fa-phone-alt" style={{ color: 'var(--primary)' }}></i>
                            <span>+91 78238 79053</span>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default PrivacyPolicy;
