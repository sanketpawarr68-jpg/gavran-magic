import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Login() {
    const [phone, setPhone] = useState('');         // full number with country code - e.g. 917823879053
    const [dialCode, setDialCode] = useState('91'); // just the code e.g. 91
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 individual digit boxes
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [useFirebase, setUseFirebase] = useState(false); // Go straight to backend (2Factor.in)

    const confirmationResultRef = useRef(null);
    const recaptchaRef = useRef(null);
    const otpRefs = useRef([]);
    const navigate = useNavigate();
    const { loginWithToken, loginWithFirebase } = useAuth();

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown]);

    // Focus first OTP box when entering step 2
    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    // Setup invisible reCAPTCHA for Firebase
    const setupRecaptcha = () => {
        if (!recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => { },
                'expired-callback': () => { recaptchaRef.current = null; }
            });
        }
        return recaptchaRef.current;
    };

    // Get clean 10-digit number for backend
    const getCleanPhone = () => phone.startsWith(dialCode)
        ? phone.slice(dialCode.length).slice(-10)
        : phone.slice(-10);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        const cleanPhone = getCleanPhone();
        if (cleanPhone.length < 7) {
            setError('Please enter a valid mobile number');
            return;
        }

        setLoading(true);

        if (useFirebase) {
            // ---- Try Firebase Phone Auth ----
            try {
                const appVerifier = setupRecaptcha();
                const fullPhone = `+${phone}`;
                const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
                confirmationResultRef.current = confirmationResult;
                setStep(2);
                setCountdown(60);
            } catch (err) {
                recaptchaRef.current = null;
                console.error('Firebase OTP error:', err.code);

                if (err.code === 'auth/billing-not-enabled') {
                    // Firebase billing not enabled — fallback to backend OTP
                    console.log('Firebase billing not enabled, falling back to backend OTP...');
                    setUseFirebase(false);
                    await sendBackendOtp(cleanPhone);
                } else if (err.code === 'auth/too-many-requests') {
                    setError('Too many requests. Please wait a while.');
                } else if (err.code === 'auth/invalid-phone-number') {
                    setError('Invalid phone number. Please check and retry.');
                } else {
                    // Any other Firebase error — fallback to backend
                    setUseFirebase(false);
                    await sendBackendOtp(cleanPhone);
                }
            } finally {
                setLoading(false);
            }
        } else {
            // ---- Backend OTP (Fast2SMS / 2Factor.in) ----
            await sendBackendOtp(cleanPhone);
            setLoading(false);
        }
    };

    const sendBackendOtp = async (cleanPhone) => {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { phone: cleanPhone });
            setStep(2);
            setCountdown(60);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
            setError(msg);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        const cleanPhone = getCleanPhone();

        if (useFirebase && confirmationResultRef.current) {
            // ---- Firebase OTP Verify ----
            try {
                const result = await confirmationResultRef.current.confirm(otpString);
                const idToken = await result.user.getIdToken();
                const res = await loginWithFirebase(idToken, cleanPhone);
                if (res?.success) {
                    // If profile already complete, go home. Otherwise fill profile.
                    const userData = res.user;
                    if (userData?.name && userData.name.trim() && !userData.name.startsWith('User ')) {
                        navigate('/');
                    } else {
                        navigate('/profile');
                    }
                } else {
                    setError(res?.error || 'Login failed. Please try again.');
                }
            } catch (err) {
                if (err.code === 'auth/invalid-verification-code') {
                    setError('Incorrect OTP. Please try again.');
                } else if (err.code === 'auth/code-expired') {
                    setError('OTP expired. Please request a new one.');
                } else {
                    setError('Verification failed. Please try again.');
                }
            }
        } else {
            // ---- Backend OTP Verify ----
            try {
                const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                    phone: cleanPhone,
                    otp: otpString
                });
                loginWithToken(res.data.token, res.data.user);
                // Smart redirect: if name is already filled, skip profile page
                const userData = res.data.user;
                if (userData?.name && userData.name.trim() && !userData.name.startsWith('User ')) {
                    navigate('/');
                } else {
                    navigate('/profile');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Incorrect OTP. Please try again.');
            }
        }
        setLoading(false);
    };

    // OTP box input handler — auto-advance to next box
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace in OTP boxes
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste in OTP box
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleResend = () => {
        setOtp(['', '', '', '', '', '']);
        setStep(1);
        setError('');
        recaptchaRef.current = null;
        setCountdown(0);
        confirmationResultRef.current = null;
    };

    return (
        <div className="auth-page">
            <div id="recaptcha-container"></div>

            <div className="auth-wrapper">
                <Link to="/" className="auth-logo">
                    <img src="/images/logo.jpg" alt="Gavran Magic" />
                    <span>Gavran <b>Magic</b></span>
                </Link>

                <div className="auth-card">
                    {/* Step indicators */}
                    <div className="auth-steps">
                        <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>
                            {step > 1 ? <i className="fas fa-check"></i> : '1'}
                        </div>
                        <div className={`auth-step-line ${step > 1 ? 'done' : ''}`}></div>
                        <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>2</div>
                    </div>

                    <h2>{step === 1 ? 'Login or Sign Up' : 'Enter OTP'}</h2>
                    <p className="auth-subtitle">
                        {step === 1
                            ? "Enter your mobile number to receive a verification code"
                            : `OTP sent to +${phone}`}
                    </p>

                    {error && (
                        <div className="auth-error">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <PhoneInput
                                    country={'in'}
                                    value={phone}
                                    onChange={(value, data) => {
                                        setPhone(value);
                                        setDialCode(data.dialCode);
                                    }}
                                    inputProps={{
                                        name: 'phone',
                                        id: 'phone-input',
                                        required: true,
                                        autoFocus: true,
                                    }}
                                    containerClass="phone-input-container"
                                    inputClass="phone-input-field"
                                    buttonClass="phone-flag-btn"
                                    preferredCountries={['in']}
                                    enableSearch
                                    searchPlaceholder="Search country..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="auth-btn"
                                disabled={loading || phone.replace(/\D/g, '').length < 7}
                                id="send-otp-btn"
                            >
                                {loading ? (
                                    <><span className="auth-spinner"></span> Sending OTP...</>
                                ) : (
                                    <>Send OTP <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="form-group">
                                <label>Verification Code</label>
                                <div className="otp-boxes">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => otpRefs.current[index] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(index, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            className={`otp-box ${digit ? 'filled' : ''}`}
                                            id={`otp-box-${index}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-btn"
                                disabled={loading || otp.join('').length !== 6}
                                id="verify-otp-btn"
                            >
                                {loading ? (
                                    <><span className="auth-spinner"></span> Verifying...</>
                                ) : (
                                    <>Verify & Login <i className="fas fa-check" style={{ marginLeft: '8px' }}></i></>
                                )}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                {countdown > 0 ? (
                                    <span style={{ color: '#999', fontSize: '0.85rem' }}>
                                        Resend in <b>{countdown}s</b>
                                    </span>
                                ) : (
                                    <button type="button" className="auth-link-btn" onClick={handleResend}>
                                        <i className="fas fa-redo" style={{ marginRight: '5px' }}></i>Resend OTP
                                    </button>
                                )}
                                <button type="button" className="auth-link-btn" onClick={handleResend}>
                                    Change Number
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="auth-terms">
                    By continuing, you agree to Gavran Magic's{' '}
                    <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}
