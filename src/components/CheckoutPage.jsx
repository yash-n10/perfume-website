import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Check, ShieldCheck, MapPin, CreditCard,
  ShoppingBag, Plus, Trash2, CheckCircle2, Download,
  Truck, ArrowRight, Sparkles, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, getAccessToken } from '../api';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import logo from '/logo_white.png';

export default function CheckoutPage({ user, onRequireAuth, onCartUpdated }) {
  const [step, setStep] = useState(1); // 1: Cart Review, 2: Address, 3: Payment, 4: Confirmation
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash on Delivery');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // New address form modal / toggle
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  // Load cart and addresses on mount
  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      onRequireAuth?.();
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [cartData, addressList] = await Promise.all([
          api.getCart().catch(() => null),
          api.getAddresses().catch(() => []),
        ]);
        setCart(cartData);
        setAddresses(addressList || []);

        // Pick default address or first address
        if (addressList && addressList.length > 0) {
          const def = addressList.find((a) => a.is_default) || addressList[0];
          setSelectedAddressId(def.id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load checkout details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  const handleUpdateQuantity = async (itemId, qty) => {
    try {
      const updated = await api.updateCartItem(itemId, qty);
      setCart(updated);
      onCartUpdated?.(updated);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const updated = await api.removeCartItem(itemId);
      setCart(updated);
      onCartUpdated?.(updated);
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

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const saved = await api.addAddress(newAddress);
      const updatedList = await api.getAddresses();
      setAddresses(updatedList);
      setSelectedAddressId(saved.id);
      setShowNewAddressForm(false);
      setNewAddress({
        label: 'Home',
        full_name: user?.name || '',
        phone: user?.phone || '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
      });
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

    if (!selectedAddressId && !showNewAddressForm) {
      setErrorMessage('Please select or add a delivery address.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      let payload = {
        payment_mode: paymentMode,
      };

      if (selectedAddressId) {
        payload.address_id = selectedAddressId;
      } else if (showNewAddressForm) {
        payload.address = newAddress;
      }

      const order = await api.checkout(payload);
      setPlacedOrder(order);
      setStep(4);
      onCartUpdated?.({ items: [], total: 0, count: 0 });

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#e8c86a', '#9e7415', '#ffffff'],
        });
      } catch {
        // ignore if confetti fails
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

  // Not logged in state
  if (!getAccessToken()) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-auth-guard luxury-glass">
          <ShoppingBag size={48} className="gold-icon" />
          <h2 className="font-royal">Sign in to Checkout</h2>
          <p className="font-poetic">
            Please log in or create an account to securely complete your fragrance order.
          </p>
          <button
            type="button"
            onClick={onRequireAuth}
            className="btn-gold font-royal"
          >
            Login / Register
          </button>
        </div>
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
            onClick={() => (selectedAddressId || showNewAddressForm) && setStep(3)}
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
                        <span>Continue to Address Selection</span>
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
                <div className="step-header">
                  <MapPin size={20} className="gold-icon" />
                  <h2 className="step-heading font-royal">Select Delivery Address</h2>
                </div>

                {/* List Existing Addresses */}
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

                {/* Add New Address Button */}
                {!showNewAddressForm && (
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

                {/* Inline New Address Form */}
                {showNewAddressForm && (
                  <form onSubmit={handleSaveAddress} className="checkout-address-form">
                    <div className="form-subheading-row">
                      <h3 className="font-royal">New Delivery Details</h3>
                      {addresses.length > 0 && (
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
                        <label className="font-royal">Address Label</label>
                        <select
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          className="checkout-input font-royal"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Bespoke">Bespoke / Studio</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="font-royal">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Recipient Full Name"
                          value={newAddress.full_name}
                          onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                          className="checkout-input"
                        />
                      </div>
                    </div>

                    <div className="form-grid-row">
                      <div className="form-group">
                        <label className="font-royal">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="Mobile for delivery updates"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="checkout-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="font-royal">Pincode *</label>
                        <input
                          type="text"
                          required
                          placeholder="6-digit PIN code"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="checkout-input"
                        />
                      </div>
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
                        placeholder="Landmark or locality (optional)"
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

                    <label className="checkbox-row font-royal">
                      <input
                        type="checkbox"
                        checked={newAddress.is_default}
                        onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                      />
                      <span>Set as default delivery address</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold font-royal"
                    >
                      {isSubmitting ? 'Saving Address...' : 'Save & Select Address'}
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
                    disabled={!selectedAddressId && !showNewAddressForm}
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
                  <h2 className="step-heading font-royal">Payment Mode</h2>
                </div>

                <p className="payment-intro font-poetic">
                  Choose your preferred payment method. All transactions are securely processed.
                </p>

                <div className="payment-options-list">
                  {/* Option 1: Cash on Delivery */}
                  <label className={`payment-option-card ${paymentMode === 'Cash on Delivery' ? 'selected' : ''}`}>
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

                  {/* Option 2: UPI */}
                  <label className={`payment-option-card ${paymentMode === 'UPI / QR' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment_mode"
                      value="UPI / QR"
                      checked={paymentMode === 'UPI / QR'}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    />
                    <div className="payment-option-info">
                      <div className="payment-title font-royal">
                        <span>Instant UPI (Google Pay / PhonePe / Paytm / BHIM)</span>
                      </div>
                      <p className="payment-desc font-poetic">
                        Scan & pay immediately using your favorite UPI application.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Credit & Debit Card */}
                  <label className={`payment-option-card ${paymentMode === 'Credit / Debit Card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment_mode"
                      value="Credit / Debit Card"
                      checked={paymentMode === 'Credit / Debit Card'}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    />
                    <div className="payment-option-info">
                      <div className="payment-title font-royal">
                        <span>Credit / Debit Card</span>
                      </div>
                      <p className="payment-desc font-poetic">
                        Accepting Visa, MasterCard, RuPay, and American Express with OTP authentication.
                      </p>
                    </div>
                  </label>

                  {/* Option 4: Net Banking */}
                  <label className={`payment-option-card ${paymentMode === 'Net Banking' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment_mode"
                      value="Net Banking"
                      checked={paymentMode === 'Net Banking'}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    />
                    <div className="payment-option-info">
                      <div className="payment-title font-royal">
                        <span>Net Banking</span>
                      </div>
                      <p className="payment-desc font-poetic">
                        Direct transfer via all major Indian banks (HDFC, ICICI, SBI, Axis, etc.).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Selected Address Preview */}
                {selectedAddress && (
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
                    <p className="delivery-summary-text">
                      <strong>{selectedAddress.full_name}</strong> ({selectedAddress.phone})
                      <br />
                      {selectedAddress.address_line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}

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

          <span className="confirm-eyebrow font-royal">Order Placed Successfully</span>
          <h2 className="confirm-title font-royal">
            Thank you, <span className="gold-gradient-text">{placedOrder?.customer_name}</span>
          </h2>
          <p className="confirm-desc font-poetic">
            Your signature MOHERA fragrance has been booked. A confirmation email and receipt have been dispatched.
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
                {placedOrder?.phone} <br /> {placedOrder?.email}
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

            <button
              type="button"
              onClick={() => { window.location.hash = '#/orders'; }}
              className="btn-gold font-royal"
            >
              <span>View Order in Profile</span>
              <ArrowRight size={16} />
            </button>

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
