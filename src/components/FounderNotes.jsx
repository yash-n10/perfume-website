import React, { useState, useEffect } from 'react';
import { ZoomIn, X, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

export default function FounderNotes() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const letterImagePath = '/assets/open_letter_final.jpeg';

  return (
    <section id="founder-notes" className="founder-notes-section open-letter-section">
      <span id="open-letter" className="section-anchor-shim" aria-hidden="true"></span>
      <span id="personal-note" className="section-anchor-shim" aria-hidden="true"></span>

      {/* Card Presentation */}
      <div className="open-letter-card-wrapper luxury-glass founder-slideshow-wrapper">
        <div className="open-letter-ambient-glow" aria-hidden="true"></div>

        <div className="open-letter-grid">
          {/* Visual Poster Frame */}
          <div className="open-letter-frame-container">
            <div className="open-letter-frame">
              <div className="open-letter-badge font-royal">
                <Sparkles size={12} />
                <span>MOHERA Fragrances</span>
              </div>

              <div
                className="open-letter-img-box"
                onClick={() => setIsLightboxOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsLightboxOpen(true)}
                aria-label="Click to enlarge open letter poster"
              >
                <img
                  src={letterImagePath}
                  alt="Open Letter - MOHERA Fragrances"
                  className="open-letter-img"
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== '/open_letter_final.jpeg') {
                      e.target.src = '/open_letter_final.jpeg';
                    }
                  }}
                />
                <div className="open-letter-overlay-hover">
                  <div className="overlay-pill font-royal">
                    <ZoomIn size={16} />
                    <span>Click to View Full Size</span>
                  </div>
                </div>
              </div>

              <div className="open-letter-frame-footer">
                <span className="frame-tag font-poetic">"My Fragrance, My Signature."</span>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="btn-text-gold font-royal frame-zoom-btn"
                >
                  <ZoomIn size={14} />
                  <span>Enlarge Poster</span>
                </button>
              </div>
            </div>
          </div>

          {/* Narrative Content - ONLY the exact provided text */}
          <div className="open-letter-content">
            <p className="letter-lead-text font-poetic">
              Hello to everyone ,
            </p>

            <div className="letter-narrative-paragraphs">
              <p className="letter-paragraph font-poetic">
                Today, I am thrilled to share a dream very close to my heart – the launch of MOHERA Fragrance. This journey is possible because of your love, encouragement and constant support.
              </p>

              <p className="letter-paragraph font-poetic">
                Fragrance has always been a part of my life, and with MOHERA, I wanted to create something special for those who love softer , deeper and long-lasting scents. These fragrances are crafted for individuals who appreciate sweet as well as bold notes, refined ingredients and a touch of luxury in their everyday moments."
              </p>

              <p className="letter-paragraph font-poetic">
                My love for perfumes gradually transformed into a vision to explore fragrances, understand their character, and thoughtfully select elegant, soft, and captivating scents for modern women and men who value quality, class, and self-expression.
              </p>

              <p className="letter-paragraph font-poetic">
                MOHERA is more than a fragrance brand; it is a celebration of ambition, elegance, and individuality. Each fragrance is selected to complement the journey of self-made individuals who create their own success and leave a lasting impression wherever they go.
              </p>

              <p className="letter-paragraph font-poetic">
                My heartfelt gratitude to everyone who believes in my fragrances, my dream, and my initiative.
              </p>

              <p className="letter-paragraph font-poetic">
                A special thank you to my friend for your constant support and believe in my dreams, my son who is my true friend and greatest strength of my life and my soul sister, her faith and encouragement mean the world to me.
              </p>

              <p className="letter-paragraph font-poetic">
                You are all a precious part of the MOHERA journey.
              </p>

              <p className="letter-paragraph font-poetic">
                Thank you and love you all.
              </p>
            </div>

            {/* Founder Signature Block */}
            <div className="letter-signature-block">
              <p className="signature-name font-royal gold-gradient-text">Mohita</p>
              <p className="signature-role font-royal">MOHERA Fragrances</p>
              <p className="signature-role font-royal font-poetic" style={{ marginTop: '0.2rem', color: '#c5a059' }}>
                My Fragrance, My Signature.
              </p>
            </div>

            {/* Product & Availability Details */}
            <div className="letter-pillars" style={{ marginTop: '1.5rem' }}>
              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Sparkles size={18} className="gold-icon" />
                </div>
                <div>
                  <h4 className="pillar-title font-royal">The Signature Four</h4>
                  <p className="pillar-desc">
                    Introducing <strong>Belle</strong>, <strong>Elan</strong>, <strong>Drive</strong>, and <strong>Titan</strong> — crafted with long-lasting elegance for every occasion.
                  </p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Sparkles size={18} className="gold-icon" />
                </div>
                <div>
                  <h4 className="pillar-title font-royal">Eight Signature Fragrances</h4>
                  <p className="pillar-desc">
                    Featuring <strong>Aphira</strong>, <strong>Hera</strong>, <strong>Nereus</strong>, <strong>Hades</strong>, <strong>Orion</strong>, <strong>Sephora</strong>, <strong>Athena</strong>, and <strong>Ares</strong> — crafted for deeper, more distinct impressions.
                  </p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Sparkles size={18} className="gold-icon" />
                </div>
                <div>
                  <h4 className="pillar-title font-royal">Made with Passion</h4>
                  <p className="pillar-desc">
                    Spread fragrance, positivity, and beautiful stories together. Available online at <strong>www.mohera.in</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="letter-action-row" style={{ marginTop: '1.5rem' }}>
              <a href="#collections-section" className="btn-gold letter-cta-btn">
                <span>Explore The Fragrances</span>
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="btn-outline-gold letter-view-btn font-royal"
              >
                <ZoomIn size={15} />
                <span>View Full Poster</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="open-letter-lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="MOHERA Open Letter Poster"
        >
          <div
            className="open-letter-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-title font-royal">
                <Sparkles size={16} className="gold-icon" />
                <span>MOHERA Fragrances — Open Letter</span>
              </div>
              <div className="lightbox-actions">
                <a
                  href={letterImagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-icon-btn"
                  title="Open original image in new tab"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="lightbox-close-btn"
                  aria-label="Close modal"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="lightbox-body">
              <img
                src={letterImagePath}
                alt="Open Letter Poster - Mohita"
                className="lightbox-image"
              />
            </div>

            <div className="lightbox-footer">
              <span className="font-poetic">"My Fragrance, My Signature."</span>
              <a
                href="#collections-section"
                onClick={() => setIsLightboxOpen(false)}
                className="lightbox-footer-link font-royal"
              >
                <span>Explore Fragrances</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
