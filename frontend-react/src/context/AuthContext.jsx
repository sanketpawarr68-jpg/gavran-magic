import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gavran-magic-k1ae.onrender.com';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on page load
    useEffect(() => {
        try {
            const token = localStorage.getItem('gavran_token');
            const storedUser = localStorage.getItem('gavran_user');
            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch {
            localStorage.removeItem('gavran_token');
            localStorage.removeItem('gavran_user');
        }
        setLoading(false);
    }, []);

    /**
     * Called after backend OTP verification succeeds.
     * Stores the JWT token and user data.
     */
    const loginWithToken = (token, userData) => {
        localStorage.setItem('gavran_token', token);
        localStorage.setItem('gavran_user', JSON.stringify(userData));
        setUser(userData);
    };

    /**
     * Called after Firebase OTP verification (kept for compatibility).
     */
    const loginWithFirebase = async (idToken, phone) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/firebase-login`, {
                id_token: idToken,
                phone: phone
            });
            loginWithToken(res.data.token, res.data.user);
            return { success: true, user: res.data.user };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Login failed. Please try again.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('gavran_token');
        localStorage.removeItem('gavran_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loginWithToken,
            loginWithFirebase,
            logout,
            loading,
            isSignedIn: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
