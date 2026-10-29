import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Heart,
  ZoomIn,
  X,
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const slidesData = [
  {
    id: 'open-letter',
    tabLabel: '01. MOHERA — Open Letter',
    badgeText: 'MOHERA Fragrances',
    frameTag: '"My Fragrance, My Signature."',
    imagePath: '/assets/open_letter.jpeg',
    imageFallback: '/open_letter.jpeg',
    lightboxTitle: 'MOHERA Fragrances — Open Letter',
    lightboxQuote: '"My Fragrance, My Signature."'
  },
  {
    id: 'personal-note',
    tabLabel: '02. MOHERA — Personal Note',
    badgeText: 'Personal Note',
    frameTag: '"My Fragrance, My Signature."',
    imagePath: '/personal_note.jpeg',
    imageFallback: '/assets/personal_note.jpeg',
    lightboxTitle: 'MOHERA Fragrances — Personal Note',
    lightboxQuote: '"My Fragrance, My Signature."'
  }
];

export default function FounderNotes() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxSlideIndex, setLightboxSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#personal-note') {
        setCurrentSlide(1);
      } else if (hash === '#open-letter') {
        setCurrentSlide(0);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft' && !isLightboxOpen) {
        prevSlide();
      } else if (e.key === 'ArrowRight' && !isLightboxOpen) {
        nextSlide();
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
  }, [isLightboxOpen, currentSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  };

  const openLightbox = (slideIdx) => {
    setLightboxSlideIndex(slideIdx);
    setIsLightboxOpen(true);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  const active = slidesData[currentSlide];
  const lightboxItem = slidesData[lightboxSlideIndex];

  return (
    <section id="founder-notes" className="founder-notes-section open-letter-section">
      <span id="open-letter" className="section-anchor-shim" aria-hidden="true"></span>
      <span id="personal-note" className="section-anchor-shim" aria-hidden="true"></span>

      {/* Slideshow Switcher */}
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div className="founder-slideshow-nav" role="tablist" aria-label="Founder Notes Navigation">
          {slidesData.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={currentSlide === idx}
              aria-controls={`slide-panel-${slide.id}`}
              id={`slide-tab-${slide.id}`}
              className={`founder-tab-btn font-royal ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
            >
              {idx === 0 ? (
                <Heart size={13} className={currentSlide === idx ? 'fill-gold gold-icon' : ''} />
              ) : (
                <Sparkles size={13} className={currentSlide === idx ? 'fill-gold gold-icon' : ''} />
              )}
              <span>{slide.tabLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Presentation */}
      <div
        className="open-letter-card-wrapper luxury-glass founder-slideshow-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="open-letter-ambient-glow" aria-hidden="true"></div>

        {/* Floating Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="founder-slide-arrow arrow-left font-royal"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="founder-slide-arrow arrow-right font-royal"
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>

        <div className="open-letter-grid">
          {/* Visual Poster Frame */}
          <div className="open-letter-frame-container">
            <div className="open-letter-frame">
              <div className="open-letter-badge font-royal">
                <Sparkles size={12} />
                <span>{active.badgeText}</span>
              </div>

              <div
                className="open-letter-img-box"
                onClick={() => openLightbox(currentSlide)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openLightbox(currentSlide)}
                aria-label={`Click to enlarge ${active.tabLabel}`}
              >
                <img
                  src={active.imagePath}
                  alt={active.tabLabel}
                  className="open-letter-img"
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== active.imageFallback) {
                      e.target.src = active.imageFallback;
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
                <span className="frame-tag font-poetic">{active.frameTag}</span>
                <button
                  type="button"
                  onClick={() => openLightbox(currentSlide)}
                  className="btn-text-gold font-royal frame-zoom-btn"
                >
                  <ZoomIn size={14} />
                  <span>Enlarge Poster</span>
                </button>
              </div>
            </div>
          </div>

          {/* Narrative Content - ONLY the exact given text */}
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
                Thank you  and love you all.
              </p>
            </div>

            {/* Founder Signature Block */}
            <div className="letter-signature-block">
              <p className="signature-name font-royal gold-gradient-text">Mohita</p>
              <p className="signature-role font-royal">MOHERA Fragrances</p>
            </div>

            {/* Action Buttons */}
            <div className="letter-action-row" style={{ marginTop: '2rem' }}>
              <a href="#collections-section" className="btn-gold letter-cta-btn">
                <span>Explore The Fragrances</span>
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={() => openLightbox(currentSlide)}
                className="btn-outline-gold letter-view-btn font-royal"
              >
                <ZoomIn size={15} />
                <span>View Full Poster</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className="founder-slideshow-bottom">
          <div className="founder-slide-counter font-royal">
            <span className="counter-current">0{currentSlide + 1}</span>
            <span className="counter-divider">/</span>
            <span className="counter-total">0{slidesData.length}</span>
          </div>

          <div className="founder-slide-dots" aria-label="Slide indicators">
            {slidesData.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => goToSlide(dotIdx)}
                className={`founder-dot-btn ${currentSlide === dotIdx ? 'active' : ''}`}
                aria-label={`Jump to slide ${dotIdx + 1}`}
              />
            ))}
          </div>

          <div className="founder-slide-quick-nav">
            <button
              type="button"
              onClick={prevSlide}
              className="founder-bottom-nav-btn font-royal"
              aria-label="Previous note"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="founder-bottom-nav-btn font-royal"
              aria-label="Next note"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && lightboxItem && (
        <div
          className="open-letter-lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.lightboxTitle}
        >
          <div
            className="open-letter-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-title font-royal">
                <Sparkles size={16} className="gold-icon" />
                <span>{lightboxItem.lightboxTitle}</span>
              </div>
              <div className="lightbox-actions">
                <a
                  href={lightboxItem.imagePath}
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
                src={lightboxItem.imagePath}
                alt={lightboxItem.lightboxTitle}
                className="lightbox-image"
              />
            </div>

            <div className="lightbox-footer">
              <span className="font-poetic">{lightboxItem.lightboxQuote}</span>
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
