import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BottleShowcase from './components/BottleShowcase';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 4
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="mohera-app">
      {/* Background ambient gold particles */}
      <div className="particles-canvas" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="gold-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      {/* Ambient background glows */}
      <div className="ambient-orb orb-1" aria-hidden="true"></div>
      <div className="ambient-orb orb-2" aria-hidden="true"></div>

      {/* Navigation */}
      <Navbar />

      {/* Main Coming Soon Presentation */}
      <main className="main-content-simple">
        <div className="coming-soon-layout">
          <div className="coming-soon-left">
            <Hero />
          </div>
          <div className="coming-soon-right">
            <BottleShowcase />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
