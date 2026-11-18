import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Check, ShieldCheck, MapPin, CreditCard,
  ShoppingBag, Plus, Trash2, CheckCircle2, Download,
  Truck, ArrowRight, Sparkles, AlertCircle, UserCheck,
  Home, Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, getAccessToken } from '../api';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import {
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  clearGuestCart,
} from '../utils/cartManager';
import logo from '/logo_white.png';

export default function CheckoutPage({ user, onRequireAuth, onCartUpdated, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep); // 1: Cart Review, 2: Address, 3: Payment, 4: Confirmation
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash on Delivery');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isLoggedIn = Boolean(getAccessToken());

  // New address / guest address form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    full_name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  // Load cart and addresses on mount or when user changes
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        if (isLoggedIn) {
          const [cartData, addressList] = await Promise.all([
            api.getCart().catch(() => null),
            api.getAddresses().catch(() => []),
          ]);
          setCart(cartData);
          setAddresses(addressList || []);

          if (addressList && addressList.length > 0) {
            const def = addressList.find((a) => a.is_default) || addressList[0];
            setSelectedAddressId(def.id);
            setShowNewAddressForm(false);
          } else {
            setShowNewAddressForm(true);
          }
        } else {
          // Guest Cart from Session
          const sessionCart = getGuestCart();
          setCart(sessionCart);
          setAddresses([]);
          setShowNewAddressForm(true);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load checkout details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user, isLoggedIn]);

  useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
    }
  }, [initialStep]);

  const handleUpdateQuantity = async (itemId, qty) => {
    try {
      if (isLoggedIn) {
        const updated = await api.updateCartItem(itemId, qty);
        setCart(updated);
        onCartUpdated?.(updated);
      } else {
        const updated = updateGuestCartQuantity(itemId, qty);
        setCart(updated);
        onCartUpdated?.(updated);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      if (isLoggedIn) {
        const updated = await api.removeCartItem(itemId);
        setCart(updated);
        onCartUpdated?.(updated);
      } else {
        const updated = removeFromGuestCart(itemId);
        setCart(updated);
        onCartUpdated?.(updated);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setErrorMessage('Please fill in all required address fields.');
      return;
    }

    if (!isLoggedIn) {
      // Guest: address is stored in state, ready for payment step
      setErrorMessage(null);
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const saved = await api.addAddress(newAddress);
      const updatedList = await api.getAddresses();
      setAddresses(updatedList);
      setSelectedAddressId(saved.id);
      setShowNewAddressForm(false);
      setStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Could not save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart?.items?.length) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let order;

      if (isLoggedIn) {
        // Authenticated Checkout
        if (!selectedAddressId && !showNewAddressForm) {
          setErrorMessage('Please select or add a delivery address.');
          setStep(2);
          setIsSubmitting(false);
          return;
        }

        const payload = {
          payment_mode: paymentMode,
        };
        if (selectedAddressId) {
          payload.address_id = selectedAddressId;
        } else {
          // If user filled in a new address (or address book was empty), provide it so backend persists it
          payload.address = newAddress;
        }

        order = await api.checkout(payload);

        // If user entered a new address, refresh user address book in background
        if (showNewAddressForm || !selectedAddressId) {
          api.getAddresses().then((updatedList) => {
            if (updatedList) setAddresses(updatedList);
          }).catch(() => { });
        }
      } else {
        // Guest Checkout
        if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
          setErrorMessage('Please complete all delivery address fields.');
          setStep(2);
          setIsSubmitting(false);
          return;
        }

        const guestPayload = {
          customer_name: newAddress.full_name.trim(),
          phone: newAddress.phone.trim(),
          email: newAddress.email ? newAddress.email.trim() : '',
          address_line1: newAddress.address_line1.trim(),
          address_line2: newAddress.address_line2 ? newAddress.address_line2.trim() : null,
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          pincode: newAddress.pincode.trim(),
          payment_mode: paymentMode,
          items: cart.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.subtotal,
          })),
        };

        order = await api.guestCheckout(guestPayload);
        clearGuestCart();
      }

      setPlacedOrder(order);
      setStep(4);
      onCartUpdated?.({ items: [], total: 0, count: 0 });

      // Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#e8c86a', '#9e7415', '#ffffff'],
        });
      } catch {
        // ignore
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (placedOrder) {
      downloadInvoicePDF(placedOrder);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (isLoading) {
    return (
      <div className="checkout-loading-screen">
        <div className="checkout-spinner" />
        <p className="font-royal gold-gradient-text">Preparing your bespoke checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Top Header */}
      <header className="checkout-header">
        <button
          type="button"
          onClick={() => {
            if (step > 1 && step < 4) {
              setStep(step - 1);
            } else {
              window.location.hash = '#/';
            }
          }}
          className="checkout-back-link font-royal"
        >
          <ArrowLeft size={16} />
          <span>{step === 4 ? 'Back to Home' : 'Back'}</span>
        </button>

        <a href="#/" className="checkout-brand">
          <img src={logo} alt="MOHERA" className="checkout-logo-img" />
          <span className="checkout-brand-title font-royal">MOHERA</span>
        </a>

        <div className="checkout-security-badge font-royal">
          <ShieldCheck size={14} className="gold-icon" />
          <span>256-bit Secure Checkout</span>
        </div>
      </header>

      {/* Guest Mode Callout */}
      {!isLoggedIn && step < 4 && (
        <div className="checkout-guest-banner luxury-glass">
          <div className="guest-banner-left">
            <UserCheck size={18} className="gold-icon" />
            <span className="font-poetic">
              Checking out as a <strong>Guest</strong>. Want to save your delivery addresses and track orders?
            </span>
          </div>
          <button
            type="button"
            onClick={onRequireAuth}
            className="guest-signin-btn font-royal"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {/* Progress Steps (if not confirmed) */}
      {step < 4 && (
        <div className="checkout-progress-bar">
          <div
            className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
            onClick={() => setStep(1)}
          >
            <div className="step-circle font-royal">
              {step > 1 ? <Check size={14} /> : '1'}
            </div>
            <span className="step-title font-royal">Review Cart</span>
          </div>

          <div className={`progress-line ${step >= 2 ? 'active' : ''}`} />

          <div
            className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
            onClick={() => cart?.items?.length > 0 && setStep(2)}
          >
            <div className="step-circle font-royal">
              {step > 2 ? <Check size={14} /> : '2'}
            </div>
            <span className="step-title font-royal">Delivery Address</span>
          </div>

          <div className={`progress-line ${step >= 3 ? 'active' : ''}`} />

          <div
            className={`progress-step ${step >= 3 ? 'active' : ''}`}
            onClick={() => ((isLoggedIn && selectedAddressId) || showNewAddressForm) && setStep(3)}
          >
            <div className="step-circle font-royal">3</div>
            <span className="step-title font-royal">Payment</span>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="checkout-alert-error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="checkout-alert-close"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Checkout Grid */}
      {step < 4 ? (
        <div className="checkout-layout-grid">
          {/* Left Column: Current Step Content */}
          <div className="checkout-main-content">
            {/* STEP 1: REVIEW CART */}
            {step === 1 && (
              <div className="checkout-step-card luxury-glass">
                <div className="step-header">
                  <ShoppingBag size={20} className="gold-icon" />
                  <h2 className="step-heading font-royal">Review Your Selections</h2>
                </div>

                {(!cart?.items || cart.items.length === 0) ? (
                  <div className="checkout-empty-cart">
                    <ShoppingBag size={48} className="gold-icon" />
                    <h3 className="font-royal">Your cart is empty</h3>
                    <p className="font-poetic">Explore our collection to select your fragrance.</p>
                    <button
                      type="button"
                      onClick={() => { window.location.hash = '#/'; }}
                      className="btn-gold font-royal"
                    >
                      Browse Fragrances
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="checkout-items-table">
                      {cart.items.map((item) => (
                        <div key={item.id} className="checkout-item-row">
                          <img
                            src={item.image || '/products/belle_poster.jpeg'}
                            alt={item.product_name}
                            className="checkout-item-thumb"
                          />
                          <div className="checkout-item-meta">
                            <h4 className="checkout-item-title font-royal">{item.product_name}</h4>
                            <span className="checkout-item-unit-price font-poetic">
                              ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                            </span>
                          </div>

                          <div className="checkout-item-qty-actions">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="checkout-qty-btn"
                            >
                              -
                            </button>
                            <span className="checkout-qty-num">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="checkout-qty-btn"
                            >
                              +
                            </button>
                          </div>

                          <div className="checkout-item-total font-royal">
                            ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="checkout-item-del-btn"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="checkout-step-actions">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="btn-gold font-royal"
                      >
                        <span>Continue to Address Details</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 2: ADDRESS SELECTION */}
            {step === 2 && (
              <div className="checkout-step-card luxury-glass">
                <div className="step-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={20} className="gold-icon" />
                    <h2 className="step-heading font-royal" style={{ margin: 0 }}>
                      {isLoggedIn ? 'Select Delivery Address' : 'Guest Delivery Address'}
                    </h2>
                  </div>
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => { window.location.hash = '#/addresses'; }}
                      className="btn-outline-gold font-royal"
                      style={{ padding: '6px 14px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      title="Manage your saved addresses in Address Book"
                    >
                      <MapPin size={12} />
                      <span>Address Book</span>
                    </button>
                  )}
                </div>

                {/* List Existing Addresses (for Logged In Users) */}
                {isLoggedIn && addresses.length > 0 && (
                  <div className="addresses-selection-grid">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          className={`address-select-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setShowNewAddressForm(false);
                          }}
                        >
                          <div className="address-select-header">
                            <span className="address-label-badge font-royal">{addr.label}</span>
                            {addr.is_default && (
                              <span className="address-default-badge font-royal">Default</span>
                            )}
                            <div className={`address-radio-circle ${isSelected ? 'checked' : ''}`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>

                          <h4 className="address-recipient font-royal">{addr.full_name}</h4>
                          <p className="address-text">
                            {addr.address_line1}
                            {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                            <br />
                            {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                          <p className="address-phone font-royal">Phone: {addr.phone}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add New Address Button (for Logged In Users) */}
                {isLoggedIn && addresses.length > 0 && !showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setSelectedAddressId(null);
                    }}
                    className="btn-outline-gold checkout-add-address-trigger font-royal"
                  >
                    <Plus size={16} />
                    <span>Deliver to a New Address</span>
                  </button>
                )}

                {/* Inline New Address / Guest Address Form */}
                {showNewAddressForm && (
                  <form onSubmit={handleSaveAddress} className="checkout-address-form">
                    <div className="form-subheading-row">
                      <h3 className="font-royal">
                        {isLoggedIn ? 'New Delivery Destination' : 'Recipient & Shipping Details'}
                      </h3>
                      {isLoggedIn && addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewAddressForm(false);
                            setSelectedAddressId(addresses[0]?.id || null);
                          }}
                          className="cancel-form-link font-royal"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="form-grid-row">
                      <div className="form-group">
                        <label className="font-royal">Recipient Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={newAddress.full_name}
                          onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                          className="checkout-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="font-royal">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="Mobile for delivery updates"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="checkout-input"
                        />
                      </div>
                    </div>

                    {/* Email field (especially helpful for guest receipts) */}
                    <div className="form-group">
                      <label className="font-royal">Email Address (for order receipt & invoice)</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={newAddress.email || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                        className="checkout-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="font-royal">Address Line 1 (Flat/House No., Street) *</label>
                      <input
                        type="text"
                        required
                        placeholder="House / Apartment / Street Name"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        className="checkout-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="font-royal">Address Line 2 (Area, Landmark)</label>
                      <input
                        type="text"
                        placeholder="Landmark, locality or area"
                        value={newAddress.address_line2}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                        className="checkout-input"
                      />
                    </div>

                    <div className="form-grid-row">
                      <div className="form-group">
                        <label className="font-royal">City / Town *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mumbai, New Delhi"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="checkout-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="font-royal">State *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maharashtra"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="checkout-input"
                        />
                      </div>
                    </div>

                    <div className="form-grid-row">
                      <div className="form-group">
                        <label className="font-royal">PIN Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="6-digit postal code"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="checkout-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="font-royal">Address Label</label>
                        <div className="address-label-pills">
                          {[
                            { label: 'Home', icon: Home },
                            { label: 'Office', icon: Building2 },
                            { label: 'Bespoke', icon: Sparkles },
                            { label: 'Other', icon: MapPin },
                          ].map(({ label, icon: Icon }) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setNewAddress({ ...newAddress, label })}
                              className={`address-label-pill-btn font-royal ${newAddress.label === label ? 'active' : ''}`}
                            >
                              <Icon size={13} />
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isLoggedIn && (
                      <label className="checkbox-row font-royal">
                        <input
                          type="checkbox"
                          checked={newAddress.is_default}
                          onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                        />
                        <span>Set as default delivery address</span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold font-royal"
                    >
                      {isSubmitting ? 'Saving Address...' : 'Save & Proceed to Payment'}
                    </button>
                  </form>
                )}

                <div className="checkout-step-actions">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline-gold font-royal"
                  >
                    Back to Cart
                  </button>

                  <button
                    type="button"
                    disabled={!selectedAddressId && (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.pincode)}
                    onClick={() => setStep(3)}
                    className="btn-gold font-royal"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT PAGE */}
            {step === 3 && (
              <div className="checkout-step-card luxury-glass">
                <div className="step-header">
                  <CreditCard size={20} className="gold-icon" />
                  <h2 className="step-heading font-royal">Secure Payment</h2>
                </div>

                <p className="payment-intro font-poetic">
                  Choose Cash on Delivery. Online payment is coming soon.
                </p>

                <div className="payment-options-list">
                  {/* Option 1: Cash on Delivery */}
                  <div className={`payment-option-wrapper ${paymentMode === 'Cash on Delivery' ? 'selected' : ''}`}>
                    <label className="payment-option-card">
                      <input
                        type="radio"
                        name="payment_mode"
                        value="Cash on Delivery"
                        checked={paymentMode === 'Cash on Delivery'}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      />
                      <div className="payment-option-info">
                        <div className="payment-title font-royal">
                          <span>Cash on Delivery (COD)</span>
                          <span className="payment-popular-pill font-royal">Recommended</span>
                        </div>
                        <p className="payment-desc font-poetic">
                          Pay conveniently with cash or UPI directly to the courier upon delivery.
                        </p>
                      </div>
                    </label>
                    {paymentMode === 'Cash on Delivery' && (
                      <div className="payment-subpanel cod-panel">
                        <div className="cod-reassurance-box">
                          <CheckCircle2 size={16} className="gold-icon" />
                          <span>No upfront payment required. Inspect your bespoke package upon arrival.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Online payments will be enabled once a payment gateway is available. */}
                  <div className="payment-option-wrapper payment-option-disabled">
                    <label className="payment-option-card">
                      <input type="radio" name="payment_mode" disabled />
                      <div className="payment-option-info">
                        <div className="payment-title font-royal">
                          <span>Online Payment</span>
                          <span className="payment-coming-soon-pill font-royal">Coming Soon</span>
                        </div>
                        <p className="payment-desc font-poetic">
                          Pay online by UPI, card, or net banking. This option is not available yet.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Selected / Guest Address Preview */}
                <div className="payment-delivery-summary">
                  <div className="delivery-summary-header font-royal">
                    <Truck size={16} className="gold-icon" />
                    <span>Delivering to</span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="change-address-btn font-royal"
                    >
                      Change
                    </button>
                  </div>
                  {isLoggedIn && selectedAddress ? (
                    <p className="delivery-summary-text">
                      <strong>{selectedAddress.full_name}</strong> ({selectedAddress.phone})
                      <br />
                      {selectedAddress.address_line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  ) : (
                    <p className="delivery-summary-text">
                      <strong>{newAddress.full_name}</strong> ({newAddress.phone})
                      <br />
                      {newAddress.address_line1}{newAddress.address_line2 ? `, ${newAddress.address_line2}` : ''}, {newAddress.city}, {newAddress.state} - {newAddress.pincode}
                    </p>
                  )}
                </div>

                <div className="checkout-step-actions">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-outline-gold font-royal"
                  >
                    Back to Address
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="btn-gold checkout-place-order-btn font-royal"
                  >
                    <Sparkles size={16} />
                    <span>{isSubmitting ? 'Securing Your Order...' : `Place Order (₹${cart?.total?.toLocaleString('en-IN')})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Order Summary Sidebar */}
          <aside className="checkout-sidebar">
            <div className="checkout-summary-card luxury-glass">
              <h3 className="summary-title font-royal">Order Summary</h3>

              <div className="summary-items-list">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="summary-item-line">
                    <span className="summary-item-name font-royal">
                      {item.quantity} × {item.product_name}
                    </span>
                    <span className="summary-item-val font-royal">
                      ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-calc-rows">
                <div className="calc-row">
                  <span className="font-royal">Subtotal</span>
                  <span className="font-royal">₹{(cart?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="calc-row">
                  <span className="font-royal">Delivery</span>
                  <span className="calc-free font-royal">COMPLIMENTARY</span>
                </div>
                <div className="calc-row">
                  <span className="font-royal">GST (18% Included)</span>
                  <span className="font-royal">
                    ₹{((cart?.total || 0) * 0.18 / 1.18).toFixed(2)}
                  </span>
                </div>

                <div className="calc-divider" />

                <div className="calc-row calc-total-row">
                  <span className="calc-total-label font-royal">Total Amount</span>
                  <span className="calc-total-amount font-royal gold-gradient-text">
                    ₹{(cart?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="checkout-perks font-poetic">
                <div className="perk-item">
                  <Check size={14} className="gold-icon" />
                  <span>Handcrafted & Inspected in India</span>
                </div>
                <div className="perk-item">
                  <Check size={14} className="gold-icon" />
                  <span>Complimentary Luxury Velvet Pouch</span>
                </div>
                <div className="perk-item">
                  <Check size={14} className="gold-icon" />
                  <span>Verified Safe Fragrance Chemistry</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* STEP 4: ORDER CONFIRMATION */
        <div className="checkout-confirmation-card luxury-glass">
          <div className="confirm-icon-box">
            <CheckCircle2 size={54} className="confirm-check-icon" />
          </div>

          <span className="confirm-eyebrow font-royal">
            {isLoggedIn ? 'Order Placed Successfully' : 'Guest Order Placed Successfully'}
          </span>
          <h2 className="confirm-title font-royal">
            Thank you, <span className="gold-gradient-text">{placedOrder?.customer_name}</span>
          </h2>
          <p className="confirm-desc font-poetic">
            Your signature MOHERA fragrance has been booked. A confirmation receipt has been generated.
          </p>

          <div className="confirm-order-badge font-royal">
            <span>Order Reference: #{placedOrder?.id}</span>
          </div>

          <div className="confirm-details-grid">
            <div className="confirm-detail-card">
              <span className="detail-card-label font-royal">Delivery Address</span>
              <p className="detail-card-val">{placedOrder?.address}</p>
            </div>

            <div className="confirm-detail-card">
              <span className="detail-card-label font-royal">Payment Mode</span>
              <p className="detail-card-val font-royal">{placedOrder?.payment_mode}</p>
            </div>

            <div className="confirm-detail-card">
              <span className="detail-card-label font-royal">Order Total</span>
              <p className="detail-card-val font-royal gold-gradient-text">
                ₹{placedOrder?.total_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="confirm-detail-card">
              <span className="detail-card-label font-royal">Contact Details</span>
              <p className="detail-card-val font-royal">
                {placedOrder?.phone} <br /> {placedOrder?.email || 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="confirm-actions-row">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="btn-outline-gold font-royal"
            >
              <Download size={16} />
              <span>Download Tax Invoice</span>
            </button>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => { window.location.hash = '#/orders'; }}
                className="btn-gold font-royal"
              >
                <span>View Order in Profile</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequireAuth}
                className="btn-gold font-royal"
              >
                <span>Sign Up to Track Orders</span>
                <ArrowRight size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() => { window.location.hash = '#/'; }}
              className="confirm-home-link font-royal"
            >
              Back to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
