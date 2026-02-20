import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Login() {
    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                {/* Logo */}
                <Link to="/" className="auth-logo">
                    <img src="/images/logo.jpg" alt="Gavran Magic" />
                    <span>Gavran <b>Magic</b></span>
                </Link>

                {/* Clerk Embedded Sign In */}
                <div className="clerk-embed">
                    <SignIn
                        routing="hash"
                        afterSignInUrl={window.location.origin + '/#/shop'}
                        afterSignUpUrl={window.location.origin + '/#/shop'}
                        appearance={{
                            elements: {
                                rootBox: { width: '100%' },
                                card: {
                                    boxShadow: 'none',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    width: '100%',
                                    maxWidth: '420px',
                                },
                                headerTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#2c3e50' },
                                headerSubtitle: { color: '#777' },
                                socialButtonsBlockButton: {
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                },
                                formButtonPrimary: {
                                    backgroundColor: '#d35400',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    padding: '12px',
                                },
                                formFieldInput: {
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    padding: '10px 14px',
                                },
                                footerActionLink: { color: '#d35400', fontWeight: '600' },
                            }
                        }}
                    />
                </div>

                {/* Footer */}
                <p className="auth-terms">
                    By continuing, you agree to Gavran Magic's{' '}
                    <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
                </p>

                <div className="auth-divider"><span>New to Gavran Magic?</span></div>
                <Link to="/signup" className="auth-create-btn">Create your account</Link>
            </div>
        </div>
    );
}
