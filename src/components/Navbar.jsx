import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowUpRight, Menu, X, User, LogOut,
  ShoppingCart, ShoppingBag, Package, MapPin, ChevronDown, CreditCard
} from 'lucide-react';
import logo from '/logo_white.png';
import AuthModal from './AuthModal';
import { clearAccessToken } from '../api';

export default function Navbar({
  user,
  setUser,
  cartCount = 0,
  onOpenCart,
  isAuthOpen,
  setIsAuthOpen,
  onLoginSuccess,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close user dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAccessToken();
    setUser?.(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    onLogout?.();
  };

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    // If not on main page, navigate to #/ then scroll
    if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
      window.location.hash = '#/';
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateTo = (hash) => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.hash = hash;
  };

  return (
    <>
      <header className="navbar-container">
        <div className="navbar-content navbar-simple">
          {/* Logo & Brand Wordmark */}
          <a href="#/" className="brand-wordmark">
            <img src={logo} alt="MOHERA" className="navbar-logo-img" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="navbar-nav-links" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => handleScrollTo('collections-section')}
              className="nav-link-btn font-royal"
            >
              Fragrances
            </button>

            <button
              type="button"
              onClick={() => handleScrollTo('founder-notes')}
              className="nav-link-btn font-royal"
            >
              Founder's Notes
            </button>

            {user ? (
              <div className="nav-user-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="nav-user-pill-btn font-royal"
                  aria-expanded={userDropdownOpen}
                >
                  <User size={13} className="gold-icon" />
                  <span className="nav-user-name">{user.name}</span>
                  <ChevronDown size={13} className={`gold-icon dropdown-chevron ${userDropdownOpen ? 'open' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="nav-user-dropdown-menu luxury-glass">
                    <div className="dropdown-user-header">
                      <span className="dropdown-name font-royal">{user.name}</span>
                      <span className="dropdown-email font-poetic">{user.email}</span>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      onClick={() => navigateTo('#/profile')}
                      className="dropdown-menu-item font-royal"
                    >
                      <User size={14} className="gold-icon" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('#/orders')}
                      className="dropdown-menu-item font-royal"
                    >
                      <Package size={14} className="gold-icon" />
                      <span>Order History</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('#/addresses')}
                      className="dropdown-menu-item font-royal"
                    >
                      <MapPin size={14} className="gold-icon" />
                      <span>Address Book</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('#/checkout')}
                      className="dropdown-menu-item font-royal"
                    >
                      <ShoppingBag size={14} className="gold-icon" />
                      <span>Checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('#/payment')}
                      className="dropdown-menu-item font-royal"
                    >
                      <CreditCard size={14} className="gold-icon" />
                      <span>Payment</span>
                    </button>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-menu-item dropdown-logout font-royal"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
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

          {/* Action buttons & Mobile Hamburger Toggle */}
          <div className="navbar-actions">
            {/* Cart Button with Count Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              className="nav-cart-btn"
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              title="View Cart"
            >
              <ShoppingCart size={20} className="gold-icon" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="nav-cart-badge font-royal">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

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
              Fragrances
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

            <button
              type="button"
              onClick={() => navigateTo('#/checkout')}
              className="mobile-nav-link font-royal"
            >
              Checkout
            </button>

            <button
              type="button"
              onClick={() => navigateTo('#/payment')}
              className="mobile-nav-link font-royal"
            >
              Payment
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCart?.();
              }}
              className="mobile-nav-link mobile-cart-link font-royal"
            >
              <ShoppingBag size={16} className="gold-icon" />
              <span>Cart ({cartCount})</span>
            </button>

            {user ? (
              <div className="mobile-user-section">
                <div className="mobile-user-header">
                  <span className="font-royal">Signed in as <strong>{user.name}</strong></span>
                  <span className="mobile-user-email font-poetic">{user.email}</span>
                </div>

                <div className="mobile-user-links">
                  <button
                    type="button"
                    onClick={() => navigateTo('#/profile')}
                    className="mobile-user-item font-royal"
                  >
                    <User size={14} className="gold-icon" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('#/orders')}
                    className="mobile-user-item font-royal"
                  >
                    <Package size={14} className="gold-icon" />
                    <span>Order History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('#/addresses')}
                    className="mobile-user-item font-royal"
                  >
                    <MapPin size={14} className="gold-icon" />
                    <span>Address Book</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mobile-logout-btn font-royal"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
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
        onLoginSuccess={(loggedInUser) => {
          if (onLoginSuccess) {
            onLoginSuccess(loggedInUser);
          } else {
            setUser?.(loggedInUser);
          }
        }}
      />
    </>
  );
}
