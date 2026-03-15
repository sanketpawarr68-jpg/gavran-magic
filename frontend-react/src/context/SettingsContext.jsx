import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        store_name: 'Gavran Magic',
        store_email: 'contact@gavranmagic.com',
        store_phone: '+91 9876543210',
        store_address: 'Pune, Maharashtra, India',
        refund_hour_grace_period: 24,
        refund_policy_text: '',
        return_policy_text: ''
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/settings/`);
            if (res.data) {
                setSettings(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
