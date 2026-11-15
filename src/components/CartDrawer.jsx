import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  isLoading = false,
  onProceedToCheckout,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const total = cart?.total || 0;
  const count = cart?.count || 0;

  const handleCheckout = () => {
    onClose();
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      window.location.hash = '#/checkout';
    }
  };

  return (
    <div
      className="cart-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your Shopping Cart"
    >
      <div className="cart-drawer-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title-box">
            <ShoppingBag size={18} className="gold-icon" />
            <h3 className="cart-drawer-title font-royal">Your Fragrance Cart</h3>
            {count > 0 && (
              <span className="cart-badge-pill font-royal">{count} {count === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cart-close-btn"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={48} className="cart-empty-icon" />
              </div>
              <h4 className="cart-empty-title font-royal">Your Cart is Empty</h4>
              <p className="cart-empty-desc font-poetic">
                Discover our Haute Parfumerie collection and find your signature scent.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById('collections-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-gold cart-empty-btn font-royal"
              >
                <Sparkles size={14} />
                <span>Explore Fragrances</span>
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-img-wrap">
                    <img
                      src={item.image || '/products/belle_poster.jpeg'}
                      alt={item.product_name}
                      className="cart-item-img"
                    />
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-top-row">
                      <h4 className="cart-item-name font-royal">{item.product_name}</h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="cart-item-remove-btn"
                        title="Remove fragrance"
                        disabled={isLoading}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="cart-item-price-unit font-poetic">
                      ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="cart-item-bottom-row">
                      {/* Quantity Controls */}
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading}
                          className="cart-qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          className="cart-qty-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="cart-item-subtotal font-royal">
                        ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span className="cart-summary-label font-royal">Subtotal</span>
              <span className="cart-summary-value font-royal">
                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label font-royal">Shipping</span>
              <span className="cart-summary-value cart-free-shipping font-royal">COMPLIMENTARY</span>
            </div>

            <div className="cart-divider" />

            <div className="cart-summary-row cart-total-row">
              <span className="cart-total-label font-royal">Total</span>
              <span className="cart-total-value font-royal gold-gradient-text">
                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading || items.length === 0}
              className="btn-gold cart-checkout-btn font-royal"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="cart-continue-btn font-royal"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
