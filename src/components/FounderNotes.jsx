import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Heart,
  ZoomIn,
  X,
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';

const slidesData = [
  {
    id: 'open-letter',
    tabLabel: '01. MOHERA — Open Letter',
    collectionName: 'MOHERA Fragrance',
    badgeText: "Founder's Announcement",
    eyebrow: 'Heartfelt Dedication',
    eyebrowIcon: 'heart',
    titlePrefix: 'An ',
    titleHighlight: 'Open Letter',
    subtitle: 'A personal message from founder Mohita Mishra to family, friends, and well-wishers.',
    imagePath: '/assets/open_letter_final.jpeg',
    imageFallback: '/open_letter_final.jpeg',
    frameTag: '"My Fragrance, My Signature."',
    headerTag: 'MOHERA FRAGRANCE',
    storyTitle: (
      <>
        "Today, I am thrilled to share a dream very close to my heart –{' '}
        <span className="gold-gradient-text">the launch of MOHERA Fragrance</span>."
      </>
    ),
    leadText:
      '"Hello to everyone, Today, I am thrilled to share a dream very close to my heart – the launch of MOHERA Fragrance. This journey is possible because of your love, encouragement and constant support."',
    narrativeParagraphs: [
      '"Fragrance has always been a part of my life, and with MOHERA, I wanted to create something special for those who love softer, deeper and long-lasting scents. These fragrances are crafted for individuals who appreciate sweet as well as bold notes, refined ingredients and a touch of luxury in their everyday moments."',
      '"My love for perfumes gradually transformed into a vision to explore fragrances, understand their character, and thoughtfully select elegant, soft, and captivating scents for modern women and men who value quality, class, and self-expression. MOHERA is more than a fragrance brand; it is a celebration of ambition, elegance, and individuality. Each fragrance is selected to complement the journey of self-made individuals who create their own success and leave a lasting impression wherever they go."',
      '"My heartfelt gratitude to everyone who believes in my fragrances, my dream, and my initiative. A special thank you to my friend for your constant support and believe in my dreams, my son who is my true friend and greatest strength of my life and my soul sister, her faith and encouragement mean the world to me. You are all a precious part of the MOHERA journey. Thank you and love you all."'
    ],
    pillars: [
      {
        icon: 'sparkles',
        title: 'The Signature Four',
        desc: (
          <>
            Introducing <strong>Belle</strong>, <strong>Elan</strong>, <strong>Drive</strong>, and <strong>Titan</strong> — crafted with long-lasting elegance for every occasion.
          </>
        )
      },
      {
        icon: 'sparkles',
        title: 'Eight Signature Fragrances',
        desc: (
          <>
            Featuring <strong>Aphira</strong>, <strong>Hera</strong>, <strong>Nereus</strong>, <strong>Hades</strong>, <strong>Orion</strong>, <strong>Sephora</strong>, <strong>Athena</strong>, and <strong>Ares</strong> — crafted for deeper, more distinct impressions.
          </>
        )
      },
      {
        icon: 'check',
        title: 'Made with Passion',
        desc: (
          <>
            Spread fragrance, positivity, and beautiful stories together. Available online at <strong>www.mohera.in</strong>.
          </>
        )
      }
    ],
    founderName: 'Mohita',
    signatureRole: 'MOHERA Fragrances | My Fragrance, My Signature.',
    primaryCta: {
      label: 'Explore The Fragrances',
      href: '#collections-section',
      isExternal: false,
      icon: 'arrow'
    },
    lightboxTitle: 'MOHERA — An Open Letter by Mohita',
    lightboxQuote: '"My Fragrance, My Signature."',
    lightboxLink: {
      label: 'View Fragrance Lineup',
      href: '#collections-section',
      isExternal: false
    }
  },
  {
    id: 'personal-note',
    tabLabel: '02. DEVINOIRE — Personal Note',
    collectionName: 'DEVINOIRE Parfums',
    badgeText: 'DEVINOIRE Collection',
    eyebrow: 'Devinoire Parfums',
    eyebrowIcon: 'sparkles',
    titlePrefix: 'A ',
    titleHighlight: 'Personal Note',
    subtitle: 'Softer, deeper, and captivating scents for modern women and men.',
    imagePath: '/assets/open_letter_final.jpeg',
    imageFallback: '/open_letter_final.jpeg',
    frameTag: '"My Fragrance, My Signature."',
    headerTag: 'MOHERA & DEVINOIRE',
    storyTitle: (
      <>
        "MOHERA is more than a fragrance brand; it is a{' '}
        <span className="gold-gradient-text">celebration of ambition, elegance, and individuality</span>."
      </>
    ),
    leadText:
      '"Each fragrance is selected to complement the journey of self-made individuals who create their own success and leave a lasting impression wherever they go."',
    narrativeParagraphs: [
      '"My heartfelt gratitude to everyone who believes in my fragrances, my dream, and my initiative."',
      '"A special thank you to my friend for your constant support and believe in my dreams, my son who is my true friend and greatest strength of my life and my soul sister, her faith and encouragement mean the world to me. You are all a precious part of the MOHERA journey. Thank you and love you all."'
    ],
    pillars: [
      {
        icon: 'sparkles',
        title: 'The Signature Four',
        desc: (
          <>
            Introducing <strong>Belle</strong>, <strong>Elan</strong>, <strong>Drive</strong>, and <strong>Titan</strong> — crafted with long-lasting elegance for every occasion.
          </>
        )
      },
      {
        icon: 'sparkles',
        title: 'Eight Signature Fragrances',
        desc: (
          <>
            Featuring <strong>Aphira</strong>, <strong>Hera</strong>, <strong>Nereus</strong>, <strong>Hades</strong>, <strong>Orion</strong>, <strong>Sephora</strong>, <strong>Athena</strong>, and <strong>Ares</strong> — crafted for deeper, more distinct impressions.
          </>
        )
      },
      {
        icon: 'check',
        title: 'Made with Passion',
        desc: (
          <>
            Spread fragrance, positivity, and beautiful stories together. Available online at <strong>www.mohera.in</strong>.
          </>
        )
      }
    ],
    founderName: 'Mohita',
    signatureRole: 'MOHERA Fragrances | My Fragrance, My Signature.',
    primaryCta: {
      label: 'Explore The Lineup',
      href: '#collections-section',
      isExternal: false,
      icon: 'arrow'
    },
    lightboxTitle: 'MOHERA Fragrances — Personal Note by Mohita',
    lightboxQuote: '"Spread fragrance, positivity, and beautiful stories together."',
    lightboxLink: {
      label: 'Explore Collections',
      href: '#collections-section',
      isExternal: false
    }
  }
];

export default function FounderNotes() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxSlideIndex, setLightboxSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');
  const touchStartXRef = useRef(null);

  // Sync with window hash if loaded with #personal-note or #open-letter
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

  // Handle lightbox escape key & body scroll lock
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
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setSlideDirection('next');
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  };

  const prevSlide = () => {
    setSlideDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  };

  const openLightbox = (slideIdx) => {
    setLightboxSlideIndex(slideIdx);
    setIsLightboxOpen(true);
  };

  // Touch swipe support for mobile
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
      {/* Anchors for smooth compatibility with legacy #open-letter and #personal-note */}
      <span id="open-letter" className="section-anchor-shim" aria-hidden="true"></span>
      <span id="personal-note" className="section-anchor-shim" aria-hidden="true"></span>

      {/* Unified Section Header */}
      <div className="section-header">
        <div className="section-eyebrow font-royal">
          <Heart size={14} className="gold-icon fill-gold" />
          <span>Founder's Vision & Gratitude</span>
        </div>
        <h2 className="section-title font-royal">
          Founder's <span className="gold-gradient-text">Letters & Notes</span>
        </h2>
        <p className="section-subtitle font-poetic">
          Personal messages and milestone dedications from founder Mohita Mishra — Celebrating MOHERA & DEVINOIRE Parfums.
        </p>

        {/* Slideshow Segmented Switcher */}
        <div className="founder-slideshow-nav" role="tablist" aria-label="Founder Notes Slideshow Navigation">
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

      {/* Slideshow Card Container */}
      <div 
        className="open-letter-card-wrapper luxury-glass founder-slideshow-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Decorative Golden Highlights */}
        <div className="open-letter-ambient-glow" aria-hidden="true"></div>

        {/* Prev & Next Floating Arrow Buttons */}
        <button
          type="button"
          onClick={prevSlide}
          className="founder-slide-arrow arrow-left font-royal"
          aria-label="Previous slide"
          title="Previous: Mohita's Letter / Note"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="founder-slide-arrow arrow-right font-royal"
          aria-label="Next slide"
          title="Next: Mohita's Letter / Note"
        >
          <ChevronRight size={22} />
        </button>

        {/* Slide Presentation Area */}
        <div 
          className="founder-slide-item active-slide"
          key={active.id}
          role="tabpanel"
          id={`slide-panel-${active.id}`}
          aria-labelledby={`slide-tab-${active.id}`}
        >
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
                  aria-label={`Click to enlarge ${active.titleHighlight} poster`}
                >
                  <img
                    src={active.imagePath}
                    alt={`${active.titleHighlight} - ${active.collectionName}`}
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

            {/* Narrative Content & Excerpt */}
            <div className="open-letter-content">
              <div className="letter-header-tag font-royal">
                <span>{active.headerTag}</span>
              </div>

              <h3 className="letter-story-title font-royal">
                {active.storyTitle}
              </h3>

              <p className="letter-lead-text font-poetic">
                {active.leadText}
              </p>

              {active.narrativeParagraphs && (
                <div className="letter-narrative-paragraphs">
                  {active.narrativeParagraphs.map((para, pIdx) => (
                    <p key={pIdx} className="letter-paragraph font-poetic">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {/* Key Pillars */}
              <div className="letter-pillars">
                {active.pillars.map((pillar, i) => (
                  <div key={i} className="pillar-item">
                    <div className="pillar-icon-box">
                      {pillar.icon === 'heart' && <Heart size={18} className="gold-icon" />}
                      {pillar.icon === 'sparkles' && <Sparkles size={18} className="gold-icon" />}
                      {pillar.icon === 'check' && <CheckCircle2 size={18} className="gold-icon" />}
                      {pillar.icon === 'chat' && <MessageCircle size={18} className="gold-icon" />}
                    </div>
                    <div>
                      <h4 className="pillar-title font-royal">{pillar.title}</h4>
                      <p className="pillar-desc">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Founder Sign-off */}
              <div className="letter-signature-block">
                <p className="signature-salutation font-poetic">With gratitude and love,</p>
                <p className="signature-name font-royal gold-gradient-text">{active.founderName || 'Mohita'}</p>
                <p className="signature-role font-royal">{active.signatureRole}</p>
              </div>

              {/* Action Buttons */}
              <div className="letter-action-row">
                <a
                  href={active.primaryCta.href}
                  target={active.primaryCta.isExternal ? '_blank' : undefined}
                  rel={active.primaryCta.isExternal ? 'noopener noreferrer' : undefined}
                  className="btn-gold letter-cta-btn"
                >
                  {active.primaryCta.icon === 'chat' ? (
                    <MessageCircle size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  <span>{active.primaryCta.label}</span>
                </a>
                <button
                  type="button"
                  onClick={() => openLightbox(currentSlide)}
                  className="btn-outline-gold letter-view-btn font-royal"
                >
                  <ZoomIn size={15} />
                  <span>Read Full Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Bottom Navigation Bar */}
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
                href={lightboxItem.lightboxLink.href}
                target={lightboxItem.lightboxLink.isExternal ? '_blank' : undefined}
                rel={lightboxItem.lightboxLink.isExternal ? 'noopener noreferrer' : undefined}
                onClick={() => setIsLightboxOpen(false)}
                className="lightbox-footer-link font-royal"
              >
                {lightboxItem.lightboxLink.isExternal ? (
                  <MessageCircle size={14} />
                ) : (
                  <ArrowRight size={14} />
                )}
                <span>{lightboxItem.lightboxLink.label}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
