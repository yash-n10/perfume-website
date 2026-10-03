import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import logo from '../assets/logo.jpg';

const GOOGLE_FORM_URL = "https://forms.google.com";

export default function Navbar() {
  return (
    <header className="navbar-container">
      <div className="navbar-content navbar-simple">
        <a href="#" className="brand-wordmark">
          <img src={logo} alt="MOHERA Logo" className="navbar-logo-img" />
          <span className="brand-name gold-shimmer-text">MOHERA</span>
        </a>
        <div className="navbar-actions">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold nav-enquiry-btn"
          >
            <span>Enquiry</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
