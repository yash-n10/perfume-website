import React from 'react';
import logo from '../assets/logo.jpg';

export default function Navbar() {
  return (
    <header className="navbar-container">
      <div className="navbar-content navbar-simple">
        <a href="#" className="brand-wordmark">
          <img src={logo} alt="MOHERA Logo" className="navbar-logo-img" />
          <span className="brand-name gold-shimmer-text">MOHERA</span>
        </a>
      </div>
    </header>
  );
}
