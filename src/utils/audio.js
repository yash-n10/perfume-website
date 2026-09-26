// Ambient Atelier Soundscape using Web Audio API
// Generates a warm, hypnotic, luxury harmonic resonance without external audio files

class LuxurySoundscape {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.oscillators = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
  }

  play() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Frequencies: 108Hz (Deep root), 216Hz (Harmonic warm octave), 432Hz (Golden resonance), 648Hz (Subtle shimmer)
    const freqs = [108, 216, 432, 648];
    this.oscillators = [];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass warm filter for velvet texture
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 - idx * 100, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.06 / (idx + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.gainNode);

      osc.start();
      this.oscillators.push(osc);
    });

    // Fade in gracefully over 3 seconds
    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 3);

    this.isPlaying = true;
  }

  stop() {
    if (!this.ctx || !this.isPlaying) return;

    // Fade out gracefully over 1.5 seconds
    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (_) {}
      });
      this.oscillators = [];
      this.isPlaying = false;
    }, 1600);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }
}

export const soundscape = new LuxurySoundscape();
