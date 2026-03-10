import React from 'react';

const ContactUs = () => {
    return (
        <main className="container" style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: '"Inter", sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px', color: '#1a1a1a', textAlign: 'center' }}>Contact Us</h1>
            <p style={{ color: '#666', marginBottom: '50px', fontSize: '1.1rem', textAlign: 'center' }}>We'd love to hear from you. Reach out to the Gavran Magic team if you have any questions, feedback, or need help with a recent order!</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '16px', border: '1px solid #efefef', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ width: '60px', height: '60px', margin: '0 auto 20px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <i className="fas fa-envelope"></i>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Email Support</h3>
                    <p style={{ color: '#555', marginBottom: '15px', fontSize: '0.9rem' }}>For general support & order inquiries.</p>
                    <a href="mailto:support@gavranmagic.com" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>support@gavranmagic.com</a>
                </div>

                <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '16px', border: '1px solid #efefef', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ width: '60px', height: '60px', margin: '0 auto 20px', background: 'var(--success)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <i className="fas fa-phone-alt"></i>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Give Us a Call</h3>
                    <p style={{ color: '#555', marginBottom: '15px', fontSize: '0.9rem' }}>Mon-Fri from 9am to 6pm IST.</p>
                    <a href="tel:+919876543210" style={{ color: 'var(--success)', fontWeight: '600', textDecoration: 'none' }}>+91 98765 43210</a>
                </div>

                <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '16px', border: '1px solid #efefef', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ width: '60px', height: '60px', margin: '0 auto 20px', background: 'black', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Visit Us</h3>
                    <p style={{ color: '#555', marginBottom: '15px', fontSize: '0.9rem' }}>Gavran Magic Food Kitchens.</p>
                    <span style={{ color: '#333', fontWeight: '600' }}>Pune, Maharashtra, India</span>
                </div>
            </div>

            <section style={{ background: '#fff', padding: '40px', borderRadius: '20px', border: '1px solid #eaeaea', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '25px', textAlign: 'center' }}>Send a Message</h2>
                <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! We will get back to you soon.'); e.target.reset(); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem', color: '#444' }}>Full Name</label>
                            <input type="text" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ccc', outline: 'none', background: '#fafafa' }} placeholder="Your Name" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem', color: '#444' }}>Email Address</label>
                            <input type="email" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ccc', outline: 'none', background: '#fafafa' }} placeholder="you@example.com" required />
                        </div>
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem', color: '#444' }}>How can we help?</label>
                        <textarea style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ccc', minHeight: '150px', outline: 'none', background: '#fafafa', resize: 'vertical' }} placeholder="Write your message here..." required></textarea>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem', fontWeight: '700', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)' }}>Send Message <i className="fas fa-paper-plane" style={{ marginLeft: '10px' }}></i></button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default ContactUs;
