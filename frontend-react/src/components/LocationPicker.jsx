import React, { useState, useEffect, useRef } from 'react';

export default function LocationPicker() {
    const [location, setLocation] = useState(null);
    const [pincode, setPincode] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef(null);

    // Load saved location from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('gavran_location');
        if (saved) setLocation(JSON.parse(saved));
    }, []);

    // Close modal on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setShowModal(false);
            }
        };
        if (showModal) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showModal]);

    // Auto-detect location via browser GPS
    const detectLocation = () => {
        setLoading(true);
        setError('');
        if (!navigator.geolocation) {
            setError('Geolocation not supported by your browser.');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    const city =
                        data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        data.address.county ||
                        'Your Location';
                    const postcode = data.address.postcode || '';
                    const loc = { city, pincode: postcode };
                    setLocation(loc);
                    localStorage.setItem('gavran_location', JSON.stringify(loc));
                    setShowModal(false);
                } catch {
                    setError('Could not fetch location details. Try entering pincode.');
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError('Location access denied. Please enter your pincode manually.');
                setLoading(false);
            }
        );
    };

    // Manual pincode entry
    const handlePincodeSubmit = async (e) => {
        e.preventDefault();
        if (pincode.length !== 6 || isNaN(pincode)) {
            setError('Please enter a valid 6-digit pincode.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();
            if (data[0].Status === 'Success') {
                const place = data[0].PostOffice[0];
                const loc = { city: `${place.District}, ${place.State}`, pincode };
                setLocation(loc);
                localStorage.setItem('gavran_location', JSON.stringify(loc));
                setShowModal(false);
                setPincode('');
            } else {
                setError('Invalid pincode. Please try again.');
            }
        } catch {
            setError('Could not fetch pincode details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="location-wrapper">
            {/* Navbar Trigger Button */}
            <button className="location-btn" onClick={() => setShowModal(!showModal)} id="location-trigger-btn">
                <i className="fas fa-map-marker-alt location-icon"></i>
                <div className="location-text">
                    <span className="location-label">Deliver to</span>
                    <span className="location-value">
                        {location ? location.city : 'Select location'}
                    </span>
                </div>
                <i className="fas fa-chevron-down location-arrow"></i>
            </button>

            {/* Location Modal */}
            {showModal && (
                <div className="location-modal" ref={modalRef}>
                    <div className="location-modal-header">
                        <h3>Choose your delivery location</h3>
                        <button onClick={() => setShowModal(false)} className="location-modal-close">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* GPS Detect Button */}
                    <button
                        className="location-gps-btn"
                        onClick={detectLocation}
                        disabled={loading}
                        id="detect-location-btn"
                    >
                        <i className="fas fa-crosshairs"></i>
                        {loading ? 'Detecting...' : 'Use my current location'}
                    </button>

                    <div className="location-or">
                        <span>OR</span>
                    </div>

                    {/* Manual Pincode Entry */}
                    <form onSubmit={handlePincodeSubmit} className="location-form">
                        <input
                            type="text"
                            placeholder="Enter 6-digit pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="location-input"
                            maxLength={6}
                            id="pincode-input"
                        />
                        <button type="submit" className="location-apply-btn" disabled={loading} id="apply-pincode-btn">
                            Apply
                        </button>
                    </form>

                    {error && <p className="location-error">{error}</p>}

                    {/* Current Location Badge */}
                    {location && (
                        <div className="location-current">
                            <i className="fas fa-check-circle"></i>
                            <span>Current: <b>{location.city}</b>{location.pincode ? ` - ${location.pincode}` : ''}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
