import React from 'react';

export default function BottleShowcase() {
  return (
    <div className="bottle-showcase-container">
      <div className="bottle-ambient-glow"></div>
      <div className="bottle-card-simple luxury-glass">
        <div className="bottle-img-wrapper">
          <img 
            src="/poster.jpeg" 
            alt="MOHERA Fragrances Collection - Elan, Belle, Drive, Titan" 
            className="bottle-img"
            loading="eager"
            onError={(e) => {
              if (e.target.src !== '/assets/poster.jpeg') {
                e.target.src = '/assets/poster.jpeg';
              }
            }}
          />
          <div className="bottle-sheen-overlay"></div>
        </div>
      </div>
    </div>
  );
}
