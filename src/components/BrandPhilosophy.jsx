import React from 'react';
import { Sparkles, Compass, Feather } from 'lucide-react';

export default function BrandPhilosophy() {
  return (
    <section className="philosophy-section">
      <div className="philosophy-card-container luxury-glass">
        <div className="philosophy-glow" aria-hidden="true"></div>

        <div className="section-header">
          <div className="section-eyebrow font-royal">
            <Sparkles size={14} className="gold-icon" />
            <span>The MOHERA Expression</span>
          </div>
          <h2 className="section-title font-royal">
            More Than a Fragrance. <span className="gold-gradient-text">An Expression of You.</span>
          </h2>
          <p className="philosophy-lead font-poetic">
            At MOHERA, we believe fragrance is deeply personal. It reflects your mood, complements your personality and leaves a memorable impression long after a moment has passed.
          </p>
        </div>

        <div className="philosophy-grid">
          <div className="philosophy-card">
            <div className="philosophy-card-icon">
              <Compass size={22} className="gold-icon" />
            </div>
            <h3 className="philosophy-card-title font-royal">Carefully Composed</h3>
            <p className="philosophy-card-text">
              Our fragrance collection brings together carefully composed scent profiles, elegant presentation and distinctive personalities for women and men.
            </p>
          </div>

          <div className="philosophy-card">
            <div className="philosophy-card-icon">
              <Feather size={22} className="gold-icon" />
            </div>
            <h3 className="philosophy-card-title font-royal">Distinctive Personalities</h3>
            <p className="philosophy-card-text">
              Whether you love delicate florals, vibrant citrus, warm gourmand notes or refined woods, MOHERA invites you to discover a fragrance that tells your story.
            </p>
          </div>
        </div>

        <div className="philosophy-footer">
          <p className="philosophy-quote font-royal gold-gradient-text">
            MOHERA — Your Signature. Your Story.
          </p>
        </div>
      </div>
    </section>
  );
}
