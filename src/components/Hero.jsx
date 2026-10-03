import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import Countdown from './Countdown';
import logo from '../assets/logo.jpg';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <section className="hero-section hero-simple">
      <div className="hero-content">
        {/* Brand Logo */}
        <div className="hero-logo-emblem-wrapper">
          <div className="hero-emblem-glow"></div>
          <img src={logo} alt="MOHERA" className="hero-logo-img" />
        </div>

        {/* Coming Soon Pill */}
        <div className="coming-soon-pill">
          <span className="font-royal">Coming Soon</span>
        </div>

        {/* Brand Name */}
        <h1 className="hero-title font-royal">
          <span className="gold-gradient-text">MOHERA</span>
        </h1>

        {/* Punchline */}
        <p className="hero-punchline font-poetic">
          Your fragrance, your signature
        </p>

        {/* Countdown */}
        <Countdown />

        {/* Minimal Notify Input */}
        <div className="notify-container">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="notify-form">
              <div className="notify-input-group">
                <Mail size={16} className="notify-icon" />
                <input
                  type="email"
                  placeholder="Enter your email for launch updates"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="notify-input"
                />
              </div>
              <button type="submit" className="btn-gold notify-btn">
                <span>Notify Me</span>
                <ArrowRight size={15} />
              </button>
            </form>
          ) : (
            <div className="notify-success">
              <CheckCircle2 size={18} className="gold-icon" />
              <span>Thank you. We will notify you when we launch.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
