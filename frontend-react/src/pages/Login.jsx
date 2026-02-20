
import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
    return (
        <div style={{
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-accent)',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(254, 253, 245) 0%, rgb(255, 246, 233) 90.2%)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '450px',
                width: '100%',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 className="logo" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Gavran <span>Magic</span></h1>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Welcome back! Please sign in to continue.</p>
                </div>

                <style>{`
                    .cl-formButtonPrimary {
                        background-color: var(--primary) !important;
                        color: white !important;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        font-weight: 600;
                        padding: 12px;
                        border-radius: 4px;
                    }
                    .cl-formButtonPrimary:hover {
                        background-color: #e67e22 !important;
                    }
                `}</style>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: {
                                width: "100%",
                                boxShadow: "none",
                            },
                            card: {
                                width: "100%",
                                boxShadow: "0 8px 30px rgba(231, 224, 224, 0.08)",
                                border: "1px solid #eee",
                                borderRadius: "12px",
                                padding: "40px 30px"
                            },
                            headerTitle: {
                                fontSize: "1.5rem",
                                fontFamily: "'Unbounded', sans-serif",
                                color: "var(--dark)"
                            },
                            headerSubtitle: {
                                color: "#888",
                                fontSize: "0.95rem"
                            },
                            // Clerk sometimes overrides formButtonPrimary with internal styles
                            // So we rely on CSS injection above as well for safety
                            formButtonPrimary: {
                                backgroundColor: "var(--primary)",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                fontWeight: "600",
                                padding: "12px",
                                borderRadius: "4px"
                            },
                            formFieldInput: {
                                padding: "12px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                color: "#000" // Ensure input text is visible
                            },
                            footerActionLink: {
                                color: "var(--primary)",
                                fontWeight: "600"
                            }
                        },
                        variables: {
                            colorPrimary: "#d35400",
                            colorText: "#2c3e50", // Fixed text color
                            fontFamily: "'Work Sans', sans-serif",
                            borderRadius: "4px"
                        }
                    }}
                    mdRouting
                    path="/login"
                    routing="path"
                    signUpUrl="/signup"
                    afterSignInUrl="/shop"
                />
            </div>
        </div>
    );
}
