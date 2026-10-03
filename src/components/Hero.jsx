import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, CheckCircle2, ShieldCheck, Mail, User, Sparkles, Copy, Check } from 'lucide-react';
import Countdown from './Countdown';
import logo from '../assets/logo.jpg';

export default function Hero() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [passNumber, setPassNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');

    // Generate VIP access number
    const randomPass = 'MOH-' + Math.floor(1000 + Math.random() * 9000);
    setPassNumber(randomPass);
    setSubmitted(true);

    // Subtle gold confetti effect
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#faebc3', '#b58d20', '#ffffff', '#e5c158']
      });
    } catch (_) {}
  };

  const copyPassCode = () => {
    navigator.clipboard.writeText(passNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        {/* Brand Logo Emblem */}
        <div className="hero-logo-emblem-wrapper">
          <div className="hero-emblem-glow"></div>
          <img src={logo} alt="MOHERA Emblem" className="hero-logo-img" />
        </div>

        {/* Eyebrow */}
        <div className="hero-eyebrow-wrapper">
          <div className="eyebrow-line"></div>
          <span className="hero-eyebrow font-royal">Exclusive Pre-Launch</span>
          <div className="eyebrow-line"></div>
        </div>

        {/* Brand Name */}
        <h1 className="hero-title font-royal">
          <span className="gold-gradient-text">MOHERA</span>
        </h1>

        {/* Punchline */}
        <p className="hero-punchline font-poetic">
          Your fragrance, your signature.
        </p>

        {/* Simple English Description */}
        <p className="hero-description">
          A captivating new fragrance crafted with warm golden amber, dark rose petals, 
          and smooth vanilla woods. Formulated in small batches to deliver an unforgettable scent that lasts all day.
        </p>

        {/* Countdown to Launch */}
        <Countdown />

        {/* Waitlist Box */}
        <div id="waitlist-section" className="waitlist-card-container">
          {!submitted ? (
            <div className="waitlist-box luxury-glass">
              <div className="waitlist-header">
                <div className="waitlist-title-row">
                  <Sparkles size={18} className="gold-icon" />
                  <h3 className="waitlist-title font-royal">Get Early Access</h3>
                </div>
                <p className="waitlist-subtitle">
                  Be the first to experience MOHERA. Join the waitlist for launch updates, 
                  early ordering, and a complimentary sample vial.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="waitlist-form">
                <div className="form-fields-row">
                  <div className="input-group">
                    <User size={16} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="luxury-input"
                    />
                  </div>
                  <div className="input-group">
                    <Mail size={16} className="input-icon" />
                    <input 
                      type="email" 
                      placeholder="Your Email Address *" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="luxury-input"
                    />
                  </div>
                </div>

                {error && <p className="form-error-msg">{error}</p>}

                <div className="form-action-row">
                  <button type="submit" className="btn-gold waitlist-submit-btn">
                    <span>Join The Waitlist</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              <div className="waitlist-guarantee">
                <ShieldCheck size={14} className="gold-icon" />
                <span>We respect your privacy. No spam, only launch updates.</span>
              </div>
            </div>
          ) : (
            /* Confirmation Pass */
            <div className="vip-pass-card luxury-glass">
              <div className="vip-pass-inner">
                <div className="vip-badge-row">
                  <span className="vip-label font-royal">You're On The List</span>
                  <CheckCircle2 size={20} className="gold-icon" />
                </div>

                <div className="vip-details">
                  <p className="vip-greeting font-poetic">
                    Thank you, {formData.name || 'Friend'}.
                  </p>
                  <p className="vip-text">
                    Your spot is confirmed. We will send an exclusive invitation to <strong>{formData.email}</strong> before our public launch.
                  </p>
                </div>

                <div className="vip-pass-ticket">
                  <div className="ticket-item">
                    <span className="ticket-label">Access Code</span>
                    <span className="ticket-value font-royal">{passNumber}</span>
                  </div>
                  <div className="ticket-divider"></div>
                  <div className="ticket-item">
                    <span className="ticket-label">Priority Status</span>
                    <span className="ticket-value gold-text">VIP Member</span>
                  </div>
                  <button 
                    onClick={copyPassCode} 
                    className="copy-pass-btn"
                    title="Copy Code"
                  >
                    {copied ? <Check size={14} className="gold-icon" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
