import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const posters = [
  {
    src: '/poster.jpeg',
    name: 'MOHERA',
    alt: 'MOHERA fragrance collection poster'
  },
  {
    src: '/poster_devinoire.jpeg',
    name: 'Devinoire',
    alt: 'Devinoire fragrance collection poster'
  }
];

export default function BottleShowcase() {
  const [activePoster, setActivePoster] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActivePoster((current) => (current + 1) % posters.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="bottle-showcase-container">
      <div className="bottle-ambient-glow"></div>
      <div className="bottle-card-simple luxury-glass">
        <div className="bottle-img-wrapper">
          <button
            type="button"
            className="bottle-slideshow-arrow previous"
            aria-label="Previous poster"
            title="Previous poster"
            onClick={() => setActivePoster((current) => (current - 1 + posters.length) % posters.length)}
          >
            <ChevronLeft size={20} />
          </button>
          <img
            src={posters[activePoster].src}
            alt={posters[activePoster].alt}
            className="bottle-img"
            loading="eager"
          />
          <button
            type="button"
            className="bottle-slideshow-arrow next"
            aria-label="Next poster"
            title="Next poster"
            onClick={() => setActivePoster((current) => (current + 1) % posters.length)}
          >
            <ChevronRight size={20} />
          </button>
          <div className="bottle-sheen-overlay"></div>
        </div>
        <div className="bottle-slideshow-controls" role="group" aria-label="Collection posters">
          {posters.map((poster, index) => (
            <button
              key={poster.name}
              type="button"
              className={`bottle-slideshow-dot ${activePoster === index ? 'active' : ''}`}
              aria-label={`Show ${poster.name} poster`}
              aria-pressed={activePoster === index}
              onClick={() => setActivePoster(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
