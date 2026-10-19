import React from 'react';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';

// Set your Google Form URL here
const GOOGLE_FORM_URL = "https://forms.google.com";

export default function Hero() {
  const handleScrollToCollections = () => {
    const el = document.getElementById('collections-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section hero-simple">
      <div className="hero-content">
        {/* Luxury Live Status Badge */}
        <div className="hero-status-container">
          <div className="luxury-live-badge">
            <span className="live-jewel">
              <span className="live-jewel-pulse"></span>
              <span className="live-jewel-core"></span>
            </span>
            <span className="live-badge-label font-royal">NOW LIVE</span>
            <span className="live-badge-divider"></span>
            <span className="live-badge-tag">FIRST EDITION</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="hero-title font-royal">
          <span className="gold-gradient-text">MOHERA</span>
        </h1>

        {/* Brand Tagline */}
        <h2 className="hero-tagline font-royal">
          Your Signature. Your Story.
        </h2>

        {/* Poetic Hook */}
        <p className="hero-hook font-poetic">
          Every fragrance tells a story. Let yours be unforgettable.
        </p>

        {/* Narrative Description */}
        <p className="hero-description">
          Discover the art of personal fragrance with MOHERA — a collection created to celebrate individuality, elegance and confidence. From captivating florals to refreshing citrus and sophisticated woody notes, find a scent that feels uniquely yours.
        </p>

        {/* Meta Category Pills */}
        <div className="hero-meta-pills font-royal">
          <span className="hero-meta-pill">Premium Fragrances</span>
          <span className="hero-meta-sep">•</span>
          <span className="hero-meta-pill">Eau de Parfum</span>
          <span className="hero-meta-sep">•</span>
          <span className="hero-meta-pill">For Him & Her</span>
        </div>

        {/* Action Buttons */}
        <div className="hero-actions-group">
          <button
            type="button"
            onClick={handleScrollToCollections}
            className="btn-gold hero-explore-btn font-royal"
          >
            <span>Explore Our Collection</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('enquiry-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-outline-gold hero-enquiry-btn font-royal"
          >
            <span>Enquiry</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
