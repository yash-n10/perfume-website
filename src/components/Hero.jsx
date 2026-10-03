import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Countdown from './Countdown';
import logo from '../assets/logo.jpg';

// Set your Google Form URL here
const GOOGLE_FORM_URL = "https://forms.google.com";

export default function Hero() {
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

        {/* Enquiry Button pointing to Google Form */}
        <div className="enquiry-action-container">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold enquiry-hero-btn"
          >
            <span>Enquiry</span>
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
