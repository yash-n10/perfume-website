import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, ZoomIn, X, ExternalLink, ArrowRight, MessageCircle } from 'lucide-react';

export default function PersonalNote() {
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

  const noteImagePath = "/personal_note.jpeg";

  return (
    <section id="personal-note" className="open-letter-section personal-note-section">
      <div className="section-header">
        <div className="section-eyebrow font-royal">
          <Sparkles size={14} className="gold-icon fill-gold" />
          <span>Devinoire Parfums</span>
        </div>
        <h2 className="section-title font-royal">
          A <span className="gold-gradient-text">Personal Note</span>
        </h2>
        <p className="section-subtitle font-poetic">
          Bold fragrances for a distinct you — A personal message from founder Mohita Mishra.
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
                <span>DEVINOIRE Collection</span>
              </div>

              <div 
                className="open-letter-img-box"
                onClick={() => setIsOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(true)}
                aria-label="Click to enlarge personal note poster"
              >
                <img
                  src={noteImagePath}
                  alt="A Personal Note from Mohita Mishra - DEVINOIRE Parfums"
                  className="open-letter-img"
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== '/assets/personal_note.jpeg') {
                      e.target.src = '/assets/personal_note.jpeg';
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
                <span className="frame-tag font-poetic">"Bold Fragrances for a Distinct You."</span>
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
              <span>DEVINOIRE PARFUMS</span>
            </div>

            <h3 className="letter-story-title font-royal">
              "Scents that speak <span className="gold-gradient-text">strength, confidence, and individuality</span>."
            </h3>

            <p className="letter-lead-text font-poetic">
              "Fragrance has always been a part of my life, and with DEVINOIRE, I wanted to create something special for those who love stronger, deeper and long-lasting scents. These fragrances are crafted for individuals who appreciate bold notes, refined ingredients and a touch of luxury in their everyday moments."
            </p>

            {/* Key Pillars from the Note */}
            <div className="letter-pillars">
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
                  <Heart size={18} className="gold-icon" />
                </div>
                <div>
                  <h4 className="pillar-title font-royal">Heartfelt Gratitude</h4>
                  <p className="pillar-desc">
                    Heartfelt thanks to <strong>Dr. Indira Mishra</strong> for guiding me, and deepest gratitude to my son, my soul sister, and my true friend for constant encouragement.
                  </p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <MessageCircle size={18} className="gold-icon" />
                </div>
                <div>
                  <h4 className="pillar-title font-royal">Direct Orders & Inquiries</h4>
                  <p className="pillar-desc">
                    Order directly via WhatsApp at <strong>+91 9031142434</strong> or visit <strong>www.mohera.in</strong> for online orders.
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Sign-off */}
            <div className="letter-signature-block">
              <p className="signature-salutation font-poetic">With gratitude and love,</p>
              <p className="signature-name font-royal gold-gradient-text">Mohita Mishra</p>
              <p className="signature-role font-royal">Founder, MOHERA & DEVINOIRE</p>
            </div>

            {/* Action Buttons */}
            <div className="letter-action-row">
              <a 
                href="https://wa.me/919031142434?text=Hello%20Mohita,%20I%20am%20interested%20in%20the%20DEVINOIRE%20Parfums%20collection." 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-gold letter-cta-btn"
              >
                <MessageCircle size={16} />
                <span>Order via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn-outline-gold letter-view-btn font-royal"
              >
                <ZoomIn size={15} />
                <span>Read Full Note</span>
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
          aria-label="Founder's Personal Note Lightbox"
        >
          <div 
            className="open-letter-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-title font-royal">
                <Sparkles size={16} className="gold-icon" />
                <span>DEVINOIRE PARFUMS — A Personal Note by Mohita Mishra</span>
              </div>
              <div className="lightbox-actions">
                <a
                  href={noteImagePath}
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
                src={noteImagePath}
                alt="Full resolution Personal Note - DEVINOIRE Parfums"
                className="lightbox-image"
              />
            </div>

            <div className="lightbox-footer">
              <span className="font-poetic">"Bold fragrances for a distinct you."</span>
              <a
                href="https://wa.me/919031142434?text=Hello%20Mohita,%20I%20would%20like%20to%20order%20DEVINOIRE%20fragrances."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="lightbox-footer-link font-royal"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Order: 9031142434</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
