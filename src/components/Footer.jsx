import React from 'react';
import { Mail, Globe, ArrowUp, Send } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-container">
      <div className="footer-gold-line"></div>
      
      <div className="footer-content">
        <div className="footer-brand-block">
          <h3 className="footer-brand font-royal gold-shimmer-text">MOHERA</h3>
          <p className="footer-punchline font-poetic">
            “Your fragrance, your signature.”
          </p>
          <p className="footer-tagline">
            Haute Parfumerie & Extrait Concentré. Conceived for those whose presence outlasts time.
          </p>
        </div>

        <div className="footer-atelier-block">
          <span className="footer-heading font-royal">Ateliers & Salons</span>
          <ul className="footer-list">
            <li>Place Vendôme, Paris</li>
            <li>Boulevard Fragonard, Grasse</li>
            <li>DIFC Gate Avenue, Dubai</li>
            <li>Madison Avenue, New York</li>
          </ul>
        </div>

        <div className="footer-social-block">
          <span className="footer-heading font-royal">Concierge & Inquiries</span>
          <p className="footer-email-text">
            For bespoke private formulations and press inquiries:
          </p>
          <a href="mailto:concierge@mohera-parfum.com" className="footer-email-link">
            concierge@mohera-parfum.com
          </a>

          <div className="footer-social-links">
            {/* Instagram SVG */}
            <a href="#instagram" className="social-icon-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            {/* X (formerly Twitter) SVG */}
            <a href="#twitter" className="social-icon-btn" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* Global / Press */}
            <a href="#press" className="social-icon-btn" aria-label="Global Presence">
              <Globe size={18} />
            </a>
            {/* Newsletter / Send */}
            <a href="#contact" className="social-icon-btn" aria-label="Concierge Dispatch">
              <Send size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-row">
        <p className="footer-copyright">
          © {new Date().getFullYear()} MOHERA Haute Parfumerie. All rights reserved.
        </p>
        <button onClick={scrollToTop} className="scroll-top-btn" aria-label="Back to Top">
          <span>Ascend</span>
          <ArrowUp size={14} className="gold-icon" />
        </button>
      </div>
    </footer>
  );
}
