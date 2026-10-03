import React, { useState } from 'react';
import { Sparkles, Shield, Flame, Droplets } from 'lucide-react';

export default function BottleShowcase() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -(y / rect.height) * 10,
      y: (x / rect.width) * 10
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="bottle-showcase-container">
      {/* Background ambient gold glow */}
      <div className="bottle-ambient-glow"></div>

      <div 
        className="bottle-card-3d-wrap"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="bottle-card-inner luxury-glass"
          style={{
            transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Top badge */}
          <div className="bottle-card-badge">
            <Sparkles size={13} className="gold-icon" />
            <span>First Edition Bottle</span>
          </div>

          {/* Perfume Bottle Image */}
          <div className="bottle-img-wrapper">
            <img 
              src="/mohera_bottle.jpg" 
              alt="MOHERA Luxury Perfume Bottle" 
              className="bottle-img"
              loading="eager"
            />
            <div className="bottle-sheen-overlay"></div>
          </div>

          {/* Bottle Details */}
          <div className="bottle-card-details">
            <div className="bottle-specs-row">
              <div className="spec-item">
                <span className="spec-label">Size</span>
                <span className="spec-value">100ml / 3.4 oz</span>
              </div>
              <div className="spec-divider"></div>
              <div className="spec-item">
                <span className="spec-label">Strength</span>
                <span className="spec-value">All-Day Wear</span>
              </div>
              <div className="spec-divider"></div>
              <div className="spec-item">
                <span className="spec-label">First Run</span>
                <span className="spec-value">500 Bottles</span>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="spec-pills">
              <span className="pill">
                <Droplets size={12} className="gold-icon" /> Pure Ingredients
              </span>
              <span className="pill">
                <Flame size={12} className="gold-icon" /> Warm Amber Core
              </span>
              <span className="pill">
                <Shield size={12} className="gold-icon" /> Limited Edition
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
