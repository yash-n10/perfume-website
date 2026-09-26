import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Crown } from 'lucide-react';
import { soundscape } from '../utils/audio';

export default function Navbar() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSoundToggle = () => {
    const active = soundscape.toggle();
    setIsPlaying(active);
  };

  const scrollToWaitlist = () => {
    const el = document.getElementById('waitlist-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Left: Private Edition Badge */}
        <div className="navbar-badge">
          <Crown size={14} className="gold-icon" />
          <span className="badge-text">Private Reserve • Edition 01</span>
        </div>

        {/* Center: Brand Typography Wordmark (Logo skipped as per instruction) */}
        <div className="brand-wordmark-container">
          <a href="#" className="brand-wordmark">
            <span className="brand-name gold-shimmer-text">MOHERA</span>
            <span className="brand-subtext font-poetic">Haute Parfumerie</span>
          </a>
        </div>

        {/* Right: Soundscape toggle & VIP Allocation CTA */}
        <div className="navbar-actions">
          <button 
            onClick={handleSoundToggle}
            className={`sound-toggle-btn ${isPlaying ? 'active' : ''}`}
            title={isPlaying ? "Mute Ambient Atelier Soundscape" : "Enable Ambient Atelier Soundscape"}
            aria-label="Toggle ambient atelier soundscape"
          >
            {isPlaying ? (
              <>
                <Volume2 size={16} className="gold-icon pulse-sound" />
                <span className="sound-label">Atelier Sound: On</span>
              </>
            ) : (
              <>
                <VolumeX size={16} className="text-muted-icon" />
                <span className="sound-label">Atelier Sound</span>
              </>
            )}
          </button>

          <button onClick={scrollToWaitlist} className="btn-outline-gold nav-reserve-btn">
            <Sparkles size={14} />
            <span>Join Vault</span>
          </button>
        </div>
      </div>
    </header>
  );
}
