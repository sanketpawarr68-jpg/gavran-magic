
import React, { useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const clerk = useClerk();
    const { isSignedIn, isLoaded } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn) {
            navigate('/shop');
            return;
        }

        // Open Clerk sign-in modal — redirect to shop after login
        clerk.openSignIn({
            afterSignInUrl: window.location.origin + '/#/shop',
            afterSignUpUrl: window.location.origin + '/#/shop',
        });
    }, [isLoaded, isSignedIn]);

    return (
        <div style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: '#555'
        }}>
            <div className="spinner"></div>
            <p>Opening sign in...</p>
        </div>
    );
}
