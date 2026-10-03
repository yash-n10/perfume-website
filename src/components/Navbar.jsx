import React from 'react';
import { Sparkles } from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function Navbar() {
  const scrollToWaitlist = () => {
    const el = document.getElementById('waitlist-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo & Name */}
        <a href="#" className="brand-wordmark">
          <img src={logo} alt="MOHERA Logo" className="navbar-logo-img" />
          <div className="brand-text-col">
            <span className="brand-name gold-shimmer-text">MOHERA</span>
            <span className="brand-subtext">Luxury Perfume</span>
          </div>
        </a>

        {/* Right Action */}
        <div className="navbar-actions">
          <button onClick={scrollToWaitlist} className="btn-gold nav-reserve-btn">
            <Sparkles size={14} />
            <span>Join Waitlist</span>
          </button>
        </div>
      </div>
    </header>
  );
}
