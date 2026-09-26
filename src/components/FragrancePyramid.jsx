import React, { useState } from 'react';
import { Sun, Heart, Moon, Compass, Sparkles } from 'lucide-react';

export default function FragrancePyramid() {
  const [activeTier, setActiveTier] = useState('heart');

  const tiers = {
    top: {
      name: 'Top Notes',
      subname: 'The Luminous Aura',
      timeframe: 'First 15 — 45 minutes',
      icon: Sun,
      description: 'The golden burst of illumination that commands attention the moment you enter.',
      notes: [
        {
          name: 'Calabrian Bergamot',
          type: 'Citrus Luminescence',
          desc: 'Sun-drenched Mediterranean zest expressed under cold ceramic press.',
          intensity: 85
        },
        {
          name: 'Solar Red Saffron',
          type: 'Spiced Gold',
          desc: 'Hand-picked Kashmiri red threads imparting warm, metallic opulence.',
          intensity: 75
        },
        {
          name: 'Pink Peppercorn',
          type: 'Vibrant Spark',
          desc: 'Crushed Madagascar berries offering a subtle, electric opening vibrancy.',
          intensity: 65
        }
      ]
    },
    heart: {
      name: 'Heart Notes',
      subname: 'The Magnetic Soul',
      timeframe: 'Hours 2 — 8',
      icon: Heart,
      description: 'The hypnotic center of gravity that defines the intimacy of your signature scent.',
      notes: [
        {
          name: 'Black Damask Rose',
          type: 'Velvet Floral',
          desc: 'Midnight harvest blooms hydro-distilled in copper alembics for deep floral darkness.',
          intensity: 95
        },
        {
          name: 'Midnight Jasmine Sambac',
          type: 'Sensual Intoxication',
          desc: 'Heirloom Grasse jasmine opening only under the nocturnal moonlight.',
          intensity: 90
        },
        {
          name: 'Smoky Frankincense',
          type: 'Sacred Resin',
          desc: 'Omani Hojari tear resins delivering ethereal, spiritual incensed whispers.',
          intensity: 80
        }
      ]
    },
    base: {
      name: 'Base Notes',
      subname: 'The Eternal Signature',
      timeframe: 'Hours 8 — 24+',
      icon: Moon,
      description: 'The indelible trace etched into memory long after your departure.',
      notes: [
        {
          name: 'Obsidian Amber Crystal',
          type: 'Molten Resin',
          desc: 'Golden fossilized resin providing lingering honeyed warmth and velvet depth.',
          intensity: 98
        },
        {
          name: 'Aged Cambodian Oud',
          type: 'Noble Agarwood',
          desc: 'Matured for twenty years in dark cedar casks for smoky, leather sophistication.',
          intensity: 94
        },
        {
          name: 'Bourbon Vanilla Bean',
          type: 'Gourmand Allure',
          desc: 'Sun-cured dark orchid pods yielding a smoky, non-sweet balsamic elegance.',
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
          <span>The Olfactory Architecture</span>
        </div>
        <h2 className="section-title font-royal">
          The Anatomy of <span className="gold-gradient-text">Your Signature</span>
        </h2>
        <p className="section-subtitle font-poetic">
          A tri-layered symphony crafted in 32% Extrait de Parfum concentration to evolve on skin across 24 hours.
        </p>
      </div>

      {/* Tier Selector Pills */}
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

      {/* Active Tier Display */}
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
              
              {/* Longevity & Sillage Meter */}
              <div className="note-meter-container">
                <div className="meter-label-row">
                  <span>Persistence</span>
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
