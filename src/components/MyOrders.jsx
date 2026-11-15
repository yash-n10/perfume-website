import React, { useState, useEffect } from 'react';
import {
  PackageCheck, ArrowLeft, Download, Clock,
  CheckCircle2, XCircle, AlertCircle, ShoppingBag,
  Sparkles, ExternalLink, Calendar, MapPin, CreditCard,
  Star, MessageSquare, X
} from 'lucide-react';
import { api, getAccessToken } from '../api';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';

export default function MyOrders({ user, onRequireAuth }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    product_id: null,
    product_name: '',
    rating: 5,
    review_title: '',
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(null);
  const [reviewErrorMessage, setReviewErrorMessage] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      onRequireAuth?.();
      return;
    }

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getMyOrders();
      setOrders(data || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch order history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewModal = (order, item = null) => {
    setSelectedOrderForReview(order);
    setReviewErrorMessage(null);
    setReviewSuccessMessage(null);
    setReviewForm({
      product_id: item?.product_id || null,
      product_name: item?.product_name || (order.items?.[0]?.product_name || 'Bespoke Fragrance'),
      rating: 5,
      review_title: '',
      comment: '',
    });
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;
    if (!reviewForm.comment.trim()) {
      setReviewErrorMessage('Please write a short fragrance experience comment.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrorMessage(null);

    try {
      const payload = {
        product_id: reviewForm.product_id ? Number(reviewForm.product_id) : null,
        product_name: reviewForm.product_name,
        rating: reviewForm.rating,
        review_title: reviewForm.review_title ? reviewForm.review_title.trim() : null,
        comment: reviewForm.comment.trim(),
      };

      const newReview = await api.createOrderReview(selectedOrderForReview.id, payload);

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === selectedOrderForReview.id) {
            const existing = o.reviews || [];
            return {
              ...o,
              reviews: [newReview, ...existing],
            };
          }
          return o;
        })
      );

      setReviewSuccessMessage('Your fragrance review has been shared successfully!');
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccessMessage(null);
      }, 1400);
    } catch (err) {
      setReviewErrorMessage(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDownloadInvoice = (order) => {
    downloadInvoicePDF(order);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'success' || s === 'completed' || s === 'delivered') {
      return (
        <span className="order-badge badge-success font-royal">
          <CheckCircle2 size={12} />
          <span>Confirmed</span>
        </span>
      );
    }
    if (s === 'failed' || s === 'cancelled' || s === 'cancel') {
      return (
        <span className="order-badge badge-failed font-royal">
          <XCircle size={12} />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="order-badge badge-pending font-royal">
        <Clock size={12} />
        <span>Processing</span>
      </span>
    );
  };

  if (!getAccessToken()) {
    return (
      <div className="orders-page-container">
        <div className="orders-auth-card luxury-glass">
          <ShoppingBag size={48} className="gold-icon" />
          <h2 className="font-royal">Your Orders</h2>
          <p className="font-poetic">Please sign in to view your previous fragrance orders.</p>
          <button type="button" onClick={onRequireAuth} className="btn-gold font-royal">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      {/* Header */}
      <div className="orders-page-header">
        <button
          type="button"
          onClick={() => { window.location.hash = '#/'; }}
          className="orders-back-btn font-royal"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="orders-title-block">
          <div className="orders-eyebrow font-royal">
            <Sparkles size={13} className="gold-icon" />
            <span>Customer Concierge</span>
          </div>
          <h1 className="orders-page-title font-royal">
            Order <span className="gold-gradient-text">History</span>
          </h1>
          <p className="orders-page-subtitle font-poetic">
            Track your bespoke fragrance dispatches, past receipts, and official tax invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { window.location.hash = '#/profile'; }}
          className="btn-outline-gold font-royal"
          style={{ padding: '8px 16px', fontSize: '0.78rem' }}
        >
          <span>View Full Profile</span>
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="orders-alert-error font-royal">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="orders-loading-state font-royal gold-gradient-text">
          Retrieving your order records...
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-card luxury-glass">
          <div className="orders-empty-icon-box">
            <PackageCheck size={48} className="gold-icon" />
          </div>
          <h3 className="font-royal">No Fragrance Orders Yet</h3>
          <p className="font-poetic">
            You haven't placed any orders yet. Discover our collection to experience MOHERA Haute Parfumerie.
          </p>
          <button
            type="button"
            onClick={() => { window.location.hash = '#/'; }}
            className="btn-gold font-royal"
          >
            <span>Explore Collection</span>
            <ExternalLink size={14} />
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const orderReviews = order.reviews || [];
            return (
              <div key={order.id} className="order-history-card luxury-glass">
                {/* Order Card Top Bar */}
                <div className="order-card-topbar">
                  <div className="order-id-date">
                    <span className="order-ref font-royal">Order #{order.id}</span>
                    <span className="order-date font-poetic">
                      <Calendar size={13} />
                      {formatDate(order.order_datetime)}
                    </span>
                  </div>

                  <div className="order-status-invoice">
                    {getStatusBadge(order.payment_status)}
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(order)}
                      className="order-invoice-btn font-royal"
                      title="Download Tax Invoice"
                    >
                      <Download size={14} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="order-items-grid">
                  {order.items?.map((item) => (
                    <div key={item.id} className="order-item-chip">
                      <div className="order-item-left">
                        <span className="order-item-qty font-royal">{item.quantity}×</span>
                        <span className="order-item-title font-royal">{item.product_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="order-item-price font-royal">
                          ₹{item.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(order, item)}
                          className="order-item-review-trigger font-royal"
                          title="Review this product"
                        >
                          <Star size={12} className="gold-icon" />
                          <span>Review</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reviews on this order */}
                {orderReviews.length > 0 && (
                  <div className="order-reviews-section">
                    <div className="order-reviews-title font-royal">
                      <MessageSquare size={13} className="gold-icon" />
                      <span>Your Fragrance Reviews for this Order:</span>
                    </div>
                    <div className="order-reviews-cards">
                      {orderReviews.map((rev) => (
                        <div key={rev.id} className="order-review-bubble">
                          <div className="rev-header">
                            <div className="rev-stars">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={12}
                                  className={s <= rev.rating ? 'star-filled' : 'star-empty'}
                                />
                              ))}
                            </div>
                            {rev.product_name && (
                              <span className="rev-product-pill font-royal">{rev.product_name}</span>
                            )}
                            <span className="rev-date font-poetic">{formatDate(rev.created_at)}</span>
                          </div>
                          {rev.review_title && (
                            <h5 className="rev-headline font-royal">"{rev.review_title}"</h5>
                          )}
                          <p className="rev-comment font-poetic">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Footer Details */}
                <div className="order-card-footer">
                  <div className="order-meta-info">
                    <div className="order-meta-row">
                      <MapPin size={14} className="gold-icon" />
                      <span className="order-meta-text">{order.address}</span>
                    </div>

                    <div className="order-meta-row">
                      <CreditCard size={14} className="gold-icon" />
                      <span className="order-meta-text font-royal">
                        Payment Mode: <strong>{order.payment_mode}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="order-footer-actions">
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(order)}
                      className="btn-outline-gold order-review-btn font-royal"
                    >
                      <Star size={14} />
                      <span>Write Review</span>
                    </button>

                    <div className="order-total-block">
                      <span className="order-total-label font-royal">Total Paid</span>
                      <span className="order-total-amount font-royal gold-gradient-text">
                        ₹{order.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-card luxury-glass review-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title-box">
                <Star size={20} className="gold-icon" />
                <h3 className="modal-title font-royal">Review Fragrance</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <p className="modal-subtitle font-poetic">
              Order #{selectedOrderForReview?.id} • Share your olfactory experience, sillage, and longevity.
            </p>

            {reviewSuccessMessage ? (
              <div className="review-modal-success font-royal">
                <CheckCircle2 size={36} className="gold-icon" />
                <h4>Thank You!</h4>
                <p>{reviewSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="modal-form review-form">
                {reviewErrorMessage && (
                  <div className="modal-alert-error font-royal">
                    <span>{reviewErrorMessage}</span>
                  </div>
                )}

                {selectedOrderForReview?.items && selectedOrderForReview.items.length > 1 && (
                  <div className="form-group">
                    <label className="font-royal">Select Product to Review</label>
                    <select
                      value={reviewForm.product_id || ''}
                      onChange={(e) => {
                        const pid = e.target.value ? Number(e.target.value) : null;
                        const match = selectedOrderForReview.items.find((i) => i.product_id === pid);
                        setReviewForm({
                          ...reviewForm,
                          product_id: pid,
                          product_name: match ? match.product_name : selectedOrderForReview.items[0]?.product_name,
                        });
                      }}
                      className="checkout-input font-royal"
                    >
                      {selectedOrderForReview.items.map((item) => (
                        <option key={item.id} value={item.product_id || ''}>
                          {item.product_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group rating-form-group">
                  <label className="font-royal">Overall Rating</label>
                  <div className="interactive-stars-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="star-click-btn"
                        aria-label={`${star} Stars`}
                      >
                        <Star
                          size={28}
                          className={star <= reviewForm.rating ? 'star-filled active' : 'star-empty'}
                        />
                      </button>
                    ))}
                    <span className="rating-tag font-royal">
                      {reviewForm.rating === 5 && 'Outstanding • Haute Parfumerie'}
                      {reviewForm.rating === 4 && 'Very Good • Exquisite'}
                      {reviewForm.rating === 3 && 'Average • Subtle'}
                      {reviewForm.rating === 2 && 'Needs Improvement'}
                      {reviewForm.rating === 1 && 'Unsatisfactory'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="font-royal">Headline / Scent Impression</label>
                  <input
                    type="text"
                    placeholder="e.g. Captivating sillage with a deep, lingering amber finish"
                    value={reviewForm.review_title}
                    onChange={(e) => setReviewForm({ ...reviewForm, review_title: e.target.value })}
                    className="checkout-input"
                  />
                </div>

                <div className="form-group">
                  <label className="font-royal">Fragrance Experience & Notes *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how the fragrance opened, settled on your skin, and its longevity throughout the day..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="checkout-input review-textarea"
                  />
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="btn-outline-gold font-royal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="btn-gold font-royal"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Fragrance Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
