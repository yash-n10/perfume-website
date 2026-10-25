import React, { useState } from 'react';
import { ArrowUpRight, Menu, X, User, LogOut } from 'lucide-react';
import logo from '/logo_white.png';
import AuthModal from './AuthModal';

const GOOGLE_FORM_URL = "https://forms.google.com";

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="navbar-container">
        <div className="navbar-content navbar-simple">
          {/* Logo & Brand Wordmark */}
          <a href="#" className="brand-wordmark">
            <img src={logo} alt="MOHERA" className="navbar-logo-img" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="navbar-nav-links" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => handleScrollTo('collections-section')}
              className="nav-link-btn font-royal"
            >
              Products
            </button>

            <button
              type="button"
              onClick={() => handleScrollTo('founder-notes')}
              className="nav-link-btn font-royal"
            >
              Founder's Notes
            </button>

            {user ? (
              <div className="nav-user-pill">
                <User size={13} className="gold-icon" />
                <span className="nav-user-name font-royal">{user.name}</span>
                <button
                  type="button"
                  onClick={() => setUser(null)}
                  className="nav-logout-btn"
                  title="Logout"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="nav-link-btn nav-auth-link font-royal"
              >
                Login / Registration
              </button>
            )}
          </nav>

          {/* Action button & Mobile Hamburger Toggle */}
          <div className="navbar-actions">
            <button
              type="button"
              onClick={() => handleScrollTo('enquiry-section')}
              className="btn-outline-gold nav-enquiry-btn font-royal"
            >
              <span>Enquiry</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-drawer">
            <button
              type="button"
              onClick={() => handleScrollTo('collections-section')}
              className="mobile-nav-link font-royal"
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('founder-notes')}
              className="mobile-nav-link font-royal"
            >
              Founder's Notes
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('enquiry-section')}
              className="mobile-nav-link font-royal"
            >
              Enquiry
            </button>

            {user ? (
              <div className="mobile-user-row">
                <span className="font-royal">Signed in as <strong>{user.name}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setUser(null);
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-logout-btn font-royal"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAuthOpen(true);
                }}
                className="mobile-nav-link mobile-auth-link font-royal"
              >
                Login / Registration
              </button>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />
    </>
  );
}
