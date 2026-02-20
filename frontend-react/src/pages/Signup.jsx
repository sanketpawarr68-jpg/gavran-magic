import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Signup() {
    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                {/* Logo */}
                <Link to="/" className="auth-logo">
                    <img src="/images/logo.jpg" alt="Gavran Magic" />
                    <span>Gavran <b>Magic</b></span>
                </Link>

                {/* Clerk Embedded Sign Up */}
                <div className="clerk-embed">
                    <SignUp
                        routing="path"
                        path="/signup"
                        afterSignUpUrl="/shop"
                        afterSignInUrl="/shop"
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
                    By creating an account, you agree to Gavran Magic's{' '}
                    <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
                </p>

                <div className="auth-divider"><span>Already have an account?</span></div>
                <Link to="/login" className="auth-create-btn">Sign in to your account</Link>
            </div>
        </div>
    );
}
