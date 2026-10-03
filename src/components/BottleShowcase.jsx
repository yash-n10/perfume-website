import React from 'react';

export default function BottleShowcase() {
  return (
    <div className="bottle-showcase-container">
      <div className="bottle-ambient-glow"></div>
      <div className="bottle-card-simple luxury-glass">
        <div className="bottle-img-wrapper">
          <img 
            src="/mohera_bottle.jpg" 
            alt="MOHERA Perfume" 
            className="bottle-img"
            loading="eager"
          />
          <div className="bottle-sheen-overlay"></div>
        </div>
      </div>
    </div>
  );
}
