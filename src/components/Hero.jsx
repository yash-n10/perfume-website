import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, CheckCircle2, ShieldCheck, Mail, User, Sparkles, Copy, Check } from 'lucide-react';
import Countdown from './Countdown';

export default function Hero() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [passNumber, setPassNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please provide a valid VIP correspondence email.');
      return;
    }
    setError('');

    // Generate bespoke VIP pass ID
    const randomPass = 'MOH-' + Math.floor(1000 + Math.random() * 9000);
    setPassNumber(randomPass);
    setSubmitted(true);

    // Luxury gold confetti explosion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#faebc3', '#aa820a', '#ffffff', '#e5c158']
      });
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D4AF37', '#e8c766', '#c5a059']
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#D4AF37', '#faebc3', '#8a6712']
        });
      }, 250);
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
        {/* Atelier Crest Eyebrow */}
        <div className="hero-eyebrow-wrapper">
          <div className="eyebrow-line"></div>
          <span className="hero-eyebrow font-royal">Private Maison Allocation</span>
          <div className="eyebrow-line"></div>
        </div>

        {/* Brand Name Title */}
        <h1 className="hero-title font-royal">
          <span className="gold-gradient-text">MOHERA</span>
        </h1>

        {/* Punchline */}
        <div className="punchline-wrapper">
          <span className="punchline-quote">“</span>
          <p className="hero-punchline font-poetic">
            Your fragrance, your signature.
          </p>
          <span className="punchline-quote">”</span>
        </div>

        {/* Descriptive Manifesto */}
        <p className="hero-description">
          An indelible mark of nocturnal allure and liquid 24-karat gold. Formulated in Grasse 
          using aged botanical resins, rare damask petals, and velvet woods. 
          Limited to strictly 500 hand-numbered flacons worldwide for our inaugural revelation.
        </p>

        {/* Countdown to Launch */}
        <Countdown />

        {/* VIP Waitlist / Early Access Vault */}
        <div id="waitlist-section" className="waitlist-card-container">
          {!submitted ? (
            <div className="waitlist-box luxury-glass">
              <div className="waitlist-header">
                <div className="waitlist-title-row">
                  <Sparkles size={18} className="gold-icon" />
                  <h3 className="waitlist-title font-royal">Request Private Vault Allocation</h3>
                </div>
                <p className="waitlist-subtitle">
                  Join the confidential guest list for guaranteed allocation of Batch 01, 
                  complimentary bespoke discovery vials, and private launch invitation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="waitlist-form">
                <div className="form-fields-row">
                  <div className="input-group">
                    <User size={16} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Your Distinguished Name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="luxury-input"
                    />
                  </div>
                  <div className="input-group">
                    <Mail size={16} className="input-icon" />
                    <input 
                      type="email" 
                      placeholder="Exclusive Email Address *" 
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
                    <span>Reserve Your Signature</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              <div className="waitlist-guarantee">
                <ShieldCheck size={14} className="gold-icon" />
                <span>Strictly Confidential. Complimentary courier delivery on inaugural orders.</span>
              </div>
            </div>
          ) : (
            /* VIP Access Pass Confirmation Card */
            <div className="vip-pass-card luxury-glass">
              <div className="vip-pass-inner">
                <div className="vip-badge-row">
                  <span className="vip-label font-royal">Private Allocation Confirmed</span>
                  <CheckCircle2 size={20} className="gold-icon" />
                </div>

                <div className="vip-details">
                  <p className="vip-greeting font-poetic">
                    Welcome, {formData.name || 'Esteemed Patron'}.
                  </p>
                  <p className="vip-text">
                    Your allocation for <strong>MOHERA Première Edition</strong> has been recorded in the Maison archive.
                    An encrypted invitation will be dispatched to <strong>{formData.email}</strong> 48 hours prior to public debut.
                  </p>
                </div>

                <div className="vip-pass-ticket">
                  <div className="ticket-item">
                    <span className="ticket-label">Access Pass No.</span>
                    <span className="ticket-value font-royal">{passNumber}</span>
                  </div>
                  <div className="ticket-divider"></div>
                  <div className="ticket-item">
                    <span className="ticket-label">Tier Status</span>
                    <span className="ticket-value gold-text">Patron de Honneur</span>
                  </div>
                  <button 
                    onClick={copyPassCode} 
                    className="copy-pass-btn"
                    title="Copy Pass Number"
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
