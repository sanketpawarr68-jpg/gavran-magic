import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/login', { replace: true });
    }, [navigate]);

    return (
        <div className="auth-page">
            <div className="auth-wrapper" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div className="auth-spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
                <p>Redirecting to login...</p>
            </div>
        </div>
    );
}
