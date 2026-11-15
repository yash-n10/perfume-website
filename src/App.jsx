import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BottleShowcase from './components/BottleShowcase';
import FounderNotes from './components/FounderNotes';
import BrandPhilosophy from './components/BrandPhilosophy';
import Collections from './components/Collections';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPage';
import AddressBook from './components/AddressBook';
import MyOrders from './components/MyOrders';
import { api, getAccessToken, clearAccessToken } from './api';
import {
  getGuestCart,
  clearGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from './utils/cartManager';
import './App.css';

export default function App() {
  const getNormalizedPath = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const hash = window.location.hash.toLowerCase().replace(/\/$/, '');
    return { path, hash };
  };

  const [routeInfo, setRouteInfo] = useState(getNormalizedPath);
  const [particles, setParticles] = useState([]);

  // Auth, Cart, and Drawer States
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handlePopState = () => {
      setRouteInfo(getNormalizedPath());
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Gold ambient particles
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

  // Fetch current user and cart
  const refreshCart = useCallback(async () => {
    if (!getAccessToken()) {
      const sessionCart = getGuestCart();
      setCart(sessionCart);
      return;
    }
    try {
      const cartData = await api.getCart();
      if (cartData) setCart(cartData);
    } catch {
      // ignore
    }
  }, []);

  // Listen to guest cart changes from sessionStorage
  useEffect(() => {
    const handleGuestCartChange = (e) => {
      if (!getAccessToken()) {
        setCart(e.detail || getGuestCart());
      }
    };
    window.addEventListener('mohera-guest-cart-change', handleGuestCartChange);
    return () => window.removeEventListener('mohera-guest-cart-change', handleGuestCartChange);
  }, []);

  // Initial authentication check & cart population
  useEffect(() => {
    if (!getAccessToken()) {
      const sessionCart = getGuestCart();
      setCart(sessionCart);
      return;
    }

    api.currentUser()
      .then((currUser) => {
        setUser(currUser);
        refreshCart();
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
        setCart(getGuestCart());
      });
  }, [refreshCart]);

  // Handle successful login: merge guest cart into DB and refresh
  const handleLoginSuccess = useCallback(async (loggedInUser) => {
    setUser(loggedInUser);
    const guestCart = getGuestCart();
    if (guestCart && guestCart.items && guestCart.items.length > 0) {
      try {
        const syncItems = guestCart.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        }));
        const mergedCart = await api.syncCart(syncItems);
        clearGuestCart();
        setCart(mergedCart);
      } catch (err) {
        console.warn('Failed to sync guest cart on login:', err);
        clearGuestCart();
        const dbCart = await api.getCart().catch(() => null);
        if (dbCart) setCart(dbCart);
      }
    } else {
      const dbCart = await api.getCart().catch(() => null);
      if (dbCart) setCart(dbCart);
    }
  }, []);

  // Handle user logout
  const handleLogout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setCart(getGuestCart());
  }, []);

  // Cart operations
  const handleUpdateCartQuantity = async (itemId, newQty) => {
    if (!getAccessToken()) {
      const updated = updateGuestCartQuantity(itemId, newQty);
      setCart(updated);
      return;
    }

    setIsCartLoading(true);
    try {
      const updated = await api.updateCartItem(itemId, newQty);
      setCart(updated);
    } catch (err) {
      alert(err.message || 'Failed to update item quantity.');
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleRemoveCartItem = async (itemId) => {
    if (!getAccessToken()) {
      const updated = removeFromGuestCart(itemId);
      setCart(updated);
      return;
    }

    setIsCartLoading(true);
    try {
      const updated = await api.removeCartItem(itemId);
      setCart(updated);
    } catch (err) {
      alert(err.message || 'Failed to remove item.');
    } finally {
      setIsCartLoading(false);
    }
  };

  // Route matches
  const isAdminRoute =
    routeInfo.path.endsWith('/admin_panel') ||
    routeInfo.path === '/admin_panel' ||
    routeInfo.hash === '#/admin_panel' ||
    routeInfo.hash === '#admin_panel';

  const isCheckoutRoute =
    routeInfo.hash === '#/checkout' ||
    routeInfo.hash === '#checkout';

  const isPaymentRoute =
    routeInfo.hash === '#/payment' ||
    routeInfo.hash === '#payment';

  const isOrdersRoute =
    routeInfo.hash === '#/orders' ||
    routeInfo.hash === '#orders' ||
    routeInfo.hash === '#/my-orders';

  const isAddressesRoute =
    routeInfo.hash === '#/addresses' ||
    routeInfo.hash === '#addresses';

  if (isAdminRoute) {
    return <AdminPanel />;
  }

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
      <div className="ambient-orb orb-1" aria-hidden="true" />
      <div className="ambient-orb orb-2" aria-hidden="true" />

      {/* Navigation */}
      <Navbar
        user={user}
        setUser={setUser}
        cartCount={cart?.count || 0}
        onOpenCart={() => setIsCartOpen(true)}
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={setIsAuthOpen}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Global Slide-In Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        isLoading={isCartLoading}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          window.location.hash = '#/checkout';
        }}
      />

      {/* MAIN VIEWPORT ROUTER */}
      {isCheckoutRoute || isPaymentRoute ? (
        <CheckoutPage
          user={user}
          initialStep={isPaymentRoute ? 3 : 1}
          onRequireAuth={() => setIsAuthOpen(true)}
          onCartUpdated={(newCart) => setCart(newCart)}
        />
      ) : isOrdersRoute ? (
        <MyOrders
          user={user}
          onRequireAuth={() => setIsAuthOpen(true)}
        />
      ) : isAddressesRoute ? (
        <AddressBook
          user={user}
          onRequireAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        /* Default Landing Page Presentation */
        <main className="main-content-simple">
          {/* Opening Screen */}
          <div className="coming-soon-layout">
            <div className="coming-soon-left">
              <Hero />
            </div>
            <div className="coming-soon-right">
              <BottleShowcase />
            </div>
          </div>

          {/* Founder's Vision: Open Letter & Personal Note Slideshow */}
          <FounderNotes />

          {/* Brand Philosophy: More Than a Fragrance */}
          <BrandPhilosophy />

          {/* Collections Showcase with Add-to-Cart & Verified Products */}
          <Collections
            user={user}
            onRequireAuth={() => setIsAuthOpen(true)}
            onCartUpdated={(newCart) => setCart(newCart)}
            onOpenCart={() => setIsCartOpen(true)}
          />

          {/* Contact Us Section */}
          <Contact />
        </main>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
