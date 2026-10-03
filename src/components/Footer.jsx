import React from 'react';
import { Mail, Globe, ArrowUp, Send } from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-container">
      <div className="footer-gold-line"></div>
      
      <div className="footer-content">
        <div className="footer-brand-block">
          <div className="footer-logo-row">
            <img src={logo} alt="MOHERA Logo" className="footer-logo-img" />
            <h3 className="footer-brand font-royal gold-shimmer-text">MOHERA</h3>
          </div>
          <p className="footer-punchline font-poetic">
            Your fragrance, your signature.
          </p>
          <p className="footer-tagline">
            An exclusive luxury fragrance created for those who want to leave a lasting impression.
          </p>
        </div>

        <div className="footer-atelier-block">
          <span className="footer-heading font-royal">Global Presence</span>
          <ul className="footer-list">
            <li>London</li>
            <li>New York</li>
            <li>Dubai</li>
            <li>Paris</li>
          </ul>
        </div>

        <div className="footer-social-block">
          <span className="footer-heading font-royal">Contact & Support</span>
          <p className="footer-email-text">
            For inquiries and pre-orders:
          </p>
          <a href="mailto:hello@mohera-perfume.com" className="footer-email-link">
            hello@mohera-perfume.com
          </a>

          <div className="footer-social-links">
            {/* Instagram */}
            <a href="#instagram" className="social-icon-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            {/* X */}
            <a href="#twitter" className="social-icon-btn" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* Website */}
            <a href="#" className="social-icon-btn" aria-label="Website">
              <Globe size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-row">
        <p className="footer-copyright">
          © {new Date().getFullYear()} MOHERA. All rights reserved.
        </p>
        <button onClick={scrollToTop} className="scroll-top-btn" aria-label="Back to Top">
          <span>Back to Top</span>
          <ArrowUp size={14} className="gold-icon" />
        </button>
      </div>
    </footer>
  );
}
