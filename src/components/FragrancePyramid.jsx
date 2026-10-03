import React, { useState } from 'react';
import { Sun, Heart, Moon, Compass, Sparkles } from 'lucide-react';

export default function FragrancePyramid() {
  const [activeTier, setActiveTier] = useState('heart');

  const tiers = {
    top: {
      name: 'Top Notes',
      subname: 'The Opening',
      timeframe: 'First 30 Minutes',
      icon: Sun,
      description: 'The bright, fresh first impression when you spray the perfume.',
      notes: [
        {
          name: 'Fresh Bergamot',
          type: 'Citrus',
          desc: 'A sparkling, uplifting burst of crisp Mediterranean citrus.',
          intensity: 85
        },
        {
          name: 'Golden Saffron',
          type: 'Warm Spice',
          desc: 'Rich red saffron threads adding an elegant, golden warmth.',
          intensity: 75
        },
        {
          name: 'Pink Pepper',
          type: 'Spicy Fresh',
          desc: 'Lightly crushed berries that bring a modern, lively touch.',
          intensity: 65
        }
      ]
    },
    heart: {
      name: 'Heart Notes',
      subname: 'The Soul of the Scent',
      timeframe: 'Hours 2 to 8',
      icon: Heart,
      description: 'The deeper, rich floral heart that reveals itself as the day unfolds.',
      notes: [
        {
          name: 'Dark Damask Rose',
          type: 'Deep Floral',
          desc: 'Rich, velvet-soft rose petals harvested for deep floral warmth.',
          intensity: 95
        },
        {
          name: 'Midnight Jasmine',
          type: 'Sweet Floral',
          desc: 'Sweet, intoxicating night-blooming white jasmine flowers.',
          intensity: 90
        },
        {
          name: 'Warm Incense',
          type: 'Smoky Resin',
          desc: 'A gentle ribbon of smoky incense for mystery and depth.',
          intensity: 80
        }
      ]
    },
    base: {
      name: 'Base Notes',
      subname: 'The Lasting Signature',
      timeframe: 'All Day & Night',
      icon: Moon,
      description: 'The warm, comforting base that lingers on your clothes and skin.',
      notes: [
        {
          name: 'Golden Amber',
          type: 'Warm Resin',
          desc: 'Deep honeyed amber crystals giving smooth, luxurious warmth.',
          intensity: 98
        },
        {
          name: 'Aged Woods',
          type: 'Precious Wood',
          desc: 'Rich dark wood that gives the perfume its strength and character.',
          intensity: 94
        },
        {
          name: 'Bourbon Vanilla',
          type: 'Smooth Vanilla',
          desc: 'Real dark vanilla beans offering a comforting, non-sweet finish.',
          intensity: 88
        }
      ]
    }
  };

  const current = tiers[activeTier];

  return (
    <section className="pyramid-section">
      <div className="section-header">
        <div className="section-eyebrow font-royal">
          <Compass size={14} className="gold-icon" />
          <span>The Fragrance Notes</span>
        </div>
        <h2 className="section-title font-royal">
          Three Layers of <span className="gold-gradient-text">Your Signature</span>
        </h2>
        <p className="section-subtitle font-poetic">
          Crafted to evolve smoothly on your skin throughout the day.
        </p>
      </div>

      {/* Tier Selector Buttons */}
      <div className="pyramid-tabs">
        {Object.entries(tiers).map(([key, item]) => {
          const IconComponent = item.icon;
          const isActive = activeTier === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTier(key)}
              className={`pyramid-tab-btn ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={16} className={isActive ? "gold-icon" : "tab-icon"} />
              <div className="tab-text-group">
                <span className="tab-title font-royal">{item.name}</span>
                <span className="tab-time">{item.timeframe}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tier Card */}
      <div className="pyramid-display-card luxury-glass">
        <div className="tier-header-bar">
          <div>
            <span className="tier-badge font-royal">{current.subname}</span>
            <h3 className="tier-title font-royal">{current.name}</h3>
          </div>
          <span className="tier-duration">{current.timeframe}</span>
        </div>

        <p className="tier-description font-poetic">{current.description}</p>

        {/* Notes Grid */}
        <div className="notes-grid">
          {current.notes.map((note, idx) => (
            <div key={idx} className="note-card">
              <div className="note-top">
                <span className="note-type">{note.type}</span>
                <div className="note-sparkle">
                  <Sparkles size={12} className="gold-icon" />
                </div>
              </div>
              <h4 className="note-name font-royal">{note.name}</h4>
              <p className="note-desc">{note.desc}</p>
              
              <div className="note-meter-container">
                <div className="meter-label-row">
                  <span>Longevity</span>
                  <span className="meter-value">{note.intensity}%</span>
                </div>
                <div className="meter-track">
                  <div 
                    className="meter-fill" 
                    style={{ width: `${note.intensity}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
