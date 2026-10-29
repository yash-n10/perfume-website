import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, User, Phone, ArrowRight, Sparkles,
  Check, Eye, EyeOff, KeyRound, CheckCircle2
} from 'lucide-react';
import { api, setAccessToken } from '../api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Common UI state
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown for resending OTP
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      resetForm();
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setStatusMessage(null);
    setOtpSent(false);
    setOtpInput('');
    setIsEmailVerified(false);
    setConfirmPassword('');
    setResendTimer(0);
  };

  if (!isOpen) return null;

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!regEmail || !regEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address first.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.sendOtp(regEmail);
      setOtpSent(true);
      setIsEmailVerified(false);
      setOtpInput('');
      setResendTimer(60);
      setStatusMessage({ type: 'success', text: 'Verification code sent to your email.' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    if (!/^\d{4}$/.test(otpInput.trim())) {
      setStatusMessage({ type: 'error', text: 'Enter the four-digit code sent to your email.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.verifyOtp(regEmail, otpInput.trim());
      setIsEmailVerified(true);
      setStatusMessage({ type: 'success', text: 'Email verified successfully!' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'login') {
      if (!loginEmail || !loginPassword) {
        setStatusMessage({ type: 'error', text: 'Please enter your email and password.' });
        return;
      }
    } else {
      // Register Mode
      if (!name || !regEmail || !phone || !regPassword || !confirmPassword) {
        setStatusMessage({ type: 'error', text: 'Please fill in all registration fields.' });
        return;
      }

      if (regPassword !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'Passwords do not match. Please verify your confirm password.' });
        return;
      }

      if (!isEmailVerified) {
        setStatusMessage({
          type: 'error',
          text: 'Please verify your email using OTP before completing registration.'
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = mode === 'login'
        ? await api.login({ email: loginEmail, password: loginPassword })
        : await api.signup({
          name,
          email: regEmail,
          phone,
          password: regPassword,
          confirm_password: confirmPassword,
        });

      setAccessToken(response.access_token);
      setStatusMessage({
        type: 'success',
        text: mode === 'login' ? 'Welcome back to MOHERA!' : 'Account created successfully! Welcome to MOHERA.',
      });
      onLoginSuccess?.(response.user);
      setTimeout(onClose, 800);
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="MOHERA Authentication"
    >
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="auth-close-btn"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-emblem-badge font-royal">
            <Sparkles size={13} className="gold-icon" />
            <span>MOHERA Membership</span>
          </div>
          <h2 className="auth-title font-royal">
            {mode === 'login' ? 'Sign In to ' : 'Register with '}
            <span className="gold-gradient-text">MOHERA</span>
          </h2>
          <p className="auth-subtitle font-poetic">
            {mode === 'login'
              ? 'Access your saved fragrances, bespoke concierge, and orders.'
              : 'Create your personal account to discover your signature scent.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn font-royal ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              resetForm();
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab-btn font-royal ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              resetForm();
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className={`auth-alert auth-alert-${statusMessage.type}`}>
            {statusMessage.type === 'success' && <Check size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <>
              <div className="auth-input-group">
                <label className="auth-label font-royal">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label className="auth-label font-royal">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email.')}
                    className="auth-forgot-link"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ================= REGISTRATION FORM ================= */
            <>
              {/* 1. Name */}
              <div className="auth-input-group">
                <label className="auth-label font-royal">Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              {/* 2. Email + Send OTP Button */}
              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label className="auth-label font-royal">Email Address</label>
                  {isEmailVerified && (
                    <span className="auth-verified-badge font-royal">
                      <CheckCircle2 size={13} />
                      Verified
                    </span>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    disabled={isEmailVerified}
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (otpSent) {
                        setOtpSent(false);
                        setIsEmailVerified(false);
                      }
                    }}
                    className={`auth-input ${!isEmailVerified ? 'has-action-btn' : ''}`}
                  />
                  {!isEmailVerified && (
                    <button
                      type="button"
                      disabled={!regEmail || resendTimer > 0 || isSubmitting}
                      onClick={handleSendOtp}
                      className="auth-inline-action-btn font-royal"
                    >
                      {isSubmitting ? 'Sending...' : resendTimer > 0 ? `${resendTimer}s` : otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>

              {/* 2b. OTP Verification Field */}
              {otpSent && !isEmailVerified && (
                <div className="auth-otp-box">
                  <div className="auth-otp-header">
                    <span className="auth-otp-tip font-poetic">Enter 4-digit code sent to email</span>
                  </div>
                  <div className="auth-input-wrapper">
                    <KeyRound size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      autoComplete="one-time-code"
                      placeholder="Enter 4-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="auth-input has-action-btn"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleVerifyOtp}
                      className="auth-inline-action-btn auth-verify-btn font-royal"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Phone */}
              <div className="auth-input-group">
                <label className="auth-label font-royal">Phone Number</label>
                <div className="auth-input-wrapper">
                  <Phone size={16} className="auth-input-icon" />
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              {/* 4. Password */}
              <div className="auth-input-group">
                <label className="auth-label font-royal">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* 5. Confirm Password */}
              <div className="auth-input-group">
                <label className="auth-label font-royal">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-eye-btn"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-gold auth-submit-btn font-royal" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In to MOHERA' : 'Register Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
