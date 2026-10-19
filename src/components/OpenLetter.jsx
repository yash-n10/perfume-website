import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, ZoomIn, X, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OpenLetter() {
  const [isOpen, setIsOpen] = useState(false);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const letterImagePath = "/assets/open_letter.jpeg";

  return (
    <section id="open-letter" className="open-letter-section">
      <div className="section-header">
        <div className="section-eyebrow font-royal">
          <Heart size={14} className="gold-icon fill-gold" />
          <span>Heartfelt Dedication</span>
        </div>
        <h2 className="section-title font-royal">
          An <span className="gold-gradient-text">Open Letter</span>
        </h2>
        <p className="section-subtitle font-poetic">
          A personal message from founder Mohita Mishra to family, friends, and well-wishers.
        </p>
      </div>

      <div className="open-letter-card-wrapper luxury-glass">
        {/* Decorative Golden Highlights */}
        <div className="open-letter-ambient-glow" aria-hidden="true"></div>

        <div className="open-letter-grid">
          {/* Visual Poster Frame */}
          <div className="open-letter-frame-container">
            <div className="open-letter-frame">
              <div className="open-letter-badge font-royal">
                <Sparkles size={12} />
                <span>Founder's Announcement</span>
              </div>

              <div 
                className="open-letter-img-box"
                onClick={() => setIsOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(true)}
                aria-label="Click to enlarge open letter poster"
              >
                <img
                  src={letterImagePath}
                  alt="An Open Letter from Mohita Mishra - MOHERA Fragrance"
                  className="open-letter-img"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if needed
                    if (e.target.src !== '/open_letter.jpeg') {
                      e.target.src = '/open_letter.jpeg';
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
                <span className="frame-tag font-poetic">"Your Signature. Your Story."</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="btn-text-gold font-royal frame-zoom-btn"
                >
                  <ZoomIn size={14} />
                  <span>Enlarge Poster</span>
                </button>
              </div>
            </div>
          </div>

          {/* Narrative Content & Excerpt */}
          <div className="open-letter-content">
            <div className="letter-header-tag font-royal">
              <span>MOHERA Eau de Parfum</span>
            </div>

            <h3 className="letter-story-title font-royal">
              "Your purchase means more than just a product — it is your <span className="gold-gradient-text">belief in my dream</span>."
            </h3>

            <p className="letter-lead-text font-poetic">
              "Today, I am thrilled to share a dream very close to my heart – the launch of MOHERA Fragrance. This journey is possible because of your love, encouragement and constant support."
            </p>

            {/* Key Pillars from the Letter */}
            <div className="letter-pillars">
              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Heart size={18} className="gold-icon" />
                </div>
                <div>
                  <h4 className="pillar-title font-royal">Deep Gratitude</h4>
                  <p className="pillar-desc">
                    Special thanks to <strong>Dr. Indira Mishra</strong>, my son, my soul sister, and my true friend for standing by me and inspiring strength.
                  </p>
                </div>
              </div>

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
                  <CheckCircle2 size={18} className="gold-icon" />
                </div>
                <div>
                  <h4 className="pillar-title font-royal">Made with Passion</h4>
                  <p className="pillar-desc">
                    Spread fragrance, positivity, and beautiful stories together. Available online at <strong>www.mohera.in</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Sign-off */}
            <div className="letter-signature-block">
              <p className="signature-salutation font-poetic">With gratitude and love,</p>
              <p className="signature-name font-royal gold-gradient-text">Mohita Mishra</p>
              <p className="signature-role font-royal">Founder, MOHERA</p>
            </div>

            {/* Action Buttons */}
            <div className="letter-action-row">
              <a href="#collections-section" className="btn-gold letter-cta-btn">
                <span>Explore The Fragrances</span>
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn-outline-gold letter-view-btn font-royal"
              >
                <ZoomIn size={15} />
                <span>Read Full Letter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="open-letter-lightbox-overlay" 
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Founder's Open Letter Lightbox"
        >
          <div 
            className="open-letter-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-title font-royal">
                <Sparkles size={16} className="gold-icon" />
                <span>MOHERA — An Open Letter by Mohita Mishra</span>
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
                  onClick={() => setIsOpen(false)}
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
                alt="Full resolution Open Letter - Mohita Mishra"
                className="lightbox-image"
              />
            </div>

            <div className="lightbox-footer">
              <span className="font-poetic">"Let's spread fragrance, positivity and beautiful stories together."</span>
              <a
                href="#collections-section"
                onClick={() => setIsOpen(false)}
                className="lightbox-footer-link font-royal"
              >
                <span>View Fragrance Lineup</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
