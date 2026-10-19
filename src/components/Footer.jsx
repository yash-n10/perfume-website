import React from 'react';
import logo from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer className="footer-simple">
      <div className="footer-gold-line"></div>
      <div className="footer-simple-content">
        <div className="footer-brand-inline">
          <img src={logo} alt="MOHERA" className="footer-logo-small" />
          <span className="footer-brand-title font-royal gold-shimmer-text">MOHERA</span>
        </div>
        <p className="footer-punchline font-poetic">
          Your Signature. Your Story.
        </p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} MOHERA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
