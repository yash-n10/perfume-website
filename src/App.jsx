import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BottleShowcase from './components/BottleShowcase';
import FragrancePyramid from './components/FragrancePyramid';
import ScentQuiz from './components/ScentQuiz';
import VIPPerks from './components/VIPPerks';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  // Generate random ambient golden particles
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="mohera-app">
      {/* Background Animated Floating Gold Particles */}
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

      {/* Atmospheric radial glow orbs */}
      <div className="ambient-orb orb-1" aria-hidden="true"></div>
      <div className="ambient-orb orb-2" aria-hidden="true"></div>

      {/* Luxury Navigation Bar */}
      <Navbar />

      <main className="main-content">
        {/* Hero Section & Bottle Showcase Duo */}
        <section className="hero-showcase-container">
          <div className="hero-col">
            <Hero />
          </div>
          <div className="showcase-col">
            <BottleShowcase />
          </div>
        </section>

        {/* The Olfactory Architecture (Fragrance Pyramid) */}
        <FragrancePyramid />

        {/* Bespoke Scent Persona Quiz */}
        <ScentQuiz />

        {/* Private Reserve Privileges */}
        <VIPPerks />
      </main>

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
