import React, { useState, useEffect } from 'react';
import {
  User, Package, MapPin, Star, Sparkles, Download,
  CheckCircle2, Clock, XCircle, ArrowLeft, Plus,
  Edit2, Trash2, Home, Building2, ShoppingBag, X,
  ExternalLink, Calendar, CreditCard, MessageSquare, ShieldCheck
} from 'lucide-react';
import { api, getAccessToken } from '../api';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';

export default function Profile({ user, onRequireAuth, initialTab = 'orders' }) {
  // Tabs: 'orders' | 'addresses' | 'reviews'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState(null);

  // Reviews state
  const [myReviews, setMyReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

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

  // Address Modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
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
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [addressSuccessMessage, setAddressSuccessMessage] = useState(null);

  // Parse hash tab if provided: e.g. #/profile?tab=addresses
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('tab=addresses') || hash === '#/addresses' || hash === '#addresses') {
      setActiveTab('addresses');
    } else if (hash.includes('tab=reviews')) {
      setActiveTab('reviews');
    } else if (hash.includes('tab=orders') || hash === '#/orders' || hash === '#orders') {
      setActiveTab('orders');
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load profile data on mount
  useEffect(() => {
    if (!getAccessToken()) {
      onRequireAuth?.();
      return;
    }

    fetchOrders();
    fetchAddresses();
    fetchReviews();
  }, [user]);

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await api.getMyOrders();
      setOrders(data || []);
    } catch (err) {
      setOrdersError(err.message || 'Failed to load order history.');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setIsAddressesLoading(true);
    setAddressesError(null);
    try {
      const data = await api.getAddresses();
      setAddresses(data || []);
    } catch (err) {
      setAddressesError(err.message || 'Failed to load addresses.');
    } finally {
      setIsAddressesLoading(false);
    }
  };

  const fetchReviews = async () => {
    setIsReviewsLoading(true);
    try {
      const data = await api.getMyReviews();
      setMyReviews(data || []);
    } catch {
      // ignore
    } finally {
      setIsReviewsLoading(false);
    }
  };

  // Review handlers
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

      // Optimistically update order in state
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

      // Refresh global reviews tab
      setMyReviews((prev) => [newReview, ...prev]);

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

  // Address handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      label: 'Home',
      full_name: user?.name || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      is_default: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressFormData({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default,
    });
    setAddressModalOpen(true);
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setIsSubmittingAddress(true);
    setAddressesError(null);
    setAddressSuccessMessage(null);

    try {
      if (editingAddress) {
        await api.updateAddress(editingAddress.id, addressFormData);
        setAddressSuccessMessage('Address updated successfully.');
      } else {
        await api.addAddress(addressFormData);
        setAddressSuccessMessage('New address saved to your address book.');
      }
      setAddressModalOpen(false);
      await fetchAddresses();
    } catch (err) {
      setAddressesError(err.message || 'Failed to save address.');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      await api.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setAddressSuccessMessage('Address removed.');
    } catch (err) {
      setAddressesError(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.setDefaultAddress(id);
      await fetchAddresses();
      setAddressSuccessMessage('Default delivery address updated.');
    } catch (err) {
      setAddressesError(err.message || 'Failed to set default.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
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
      <div className="profile-page-container">
        <div className="profile-auth-guard luxury-glass">
          <User size={48} className="gold-icon" />
          <h2 className="font-royal">Your MOHERA Profile</h2>
          <p className="font-poetic">Please sign in to access your order history, saved addresses, and reviews.</p>
          <button type="button" onClick={onRequireAuth} className="btn-gold font-royal">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Profile Luxury Hero Card */}
      <div className="profile-hero-card luxury-glass">
        <div className="profile-hero-left">
          <div className="profile-avatar-circle font-royal">
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'M'}</span>
          </div>
          <div className="profile-hero-text">
            <div className="profile-prive-badge font-royal">
              <Sparkles size={12} className="gold-icon" />
              <span>MOHERA Privé Member</span>
            </div>
            <h1 className="profile-user-name font-royal">{user?.name}</h1>
            <p className="profile-user-email font-poetic">
              {user?.email} • {user?.phone}
            </p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box" onClick={() => setActiveTab('orders')}>
            <span className="stat-number font-royal">{orders.length}</span>
            <span className="stat-label font-royal">Orders</span>
          </div>
          <div className="profile-stat-box" onClick={() => setActiveTab('addresses')}>
            <span className="stat-number font-royal">{addresses.length}</span>
            <span className="stat-label font-royal">Addresses</span>
          </div>
          <div className="profile-stat-box" onClick={() => setActiveTab('reviews')}>
            <span className="stat-number font-royal">{myReviews.length}</span>
            <span className="stat-label font-royal">Reviews</span>
          </div>
        </div>
      </div>

      {/* Profile Luxury Navigation Tabs */}
      <div className="profile-tabs-nav">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`profile-tab-btn font-royal ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <Package size={16} />
          <span>Order History ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`profile-tab-btn font-royal ${activeTab === 'addresses' ? 'active' : ''}`}
        >
          <MapPin size={16} />
          <span>Address Book ({addresses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`profile-tab-btn font-royal ${activeTab === 'reviews' ? 'active' : ''}`}
        >
          <Star size={16} />
          <span>My Reviews ({myReviews.length})</span>
        </button>
      </div>

      {/* Alerts */}
      {addressSuccessMessage && (
        <div className="profile-alert-success font-royal">
          <CheckCircle2 size={16} />
          <span>{addressSuccessMessage}</span>
          <button type="button" onClick={() => setAddressSuccessMessage(null)}>×</button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: ORDER HISTORY & REVIEWS
          ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="profile-tab-pane">
          {ordersError && (
            <div className="profile-alert-error font-royal">
              <span>{ordersError}</span>
            </div>
          )}

          {isOrdersLoading ? (
            <div className="profile-loading-box font-royal">
              <span className="profile-spinner"></span>
              <span>Retrieving your luxury fragrance orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="profile-empty-state luxury-glass">
              <ShoppingBag size={48} className="gold-icon" />
              <h3 className="font-royal">No Fragrance Orders Yet</h3>
              <p className="font-poetic">Experience the artistry of MOHERA Haute Parfumerie.</p>
              <button
                type="button"
                onClick={() => { window.location.hash = '#/'; }}
                className="btn-gold font-royal"
              >
                <span>Explore Scent Collections</span>
                <ExternalLink size={14} />
              </button>
            </div>
          ) : (
            <div className="profile-orders-list">
              {orders.map((order) => {
                const orderReviews = order.reviews || [];
                return (
                  <div key={order.id} className="profile-order-card luxury-glass">
                    {/* Top Bar */}
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
                          onClick={() => downloadInvoicePDF(order)}
                          className="order-invoice-btn font-royal"
                          title="Download Tax Invoice"
                        >
                          <Download size={14} />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="order-items-grid">
                      {order.items?.map((item) => (
                        <div key={item.id} className="order-item-chip">
                          <div className="order-item-left">
                            <span className="order-item-qty font-royal">{item.quantity}×</span>
                            <span className="order-item-title font-royal">{item.product_name}</span>
                          </div>
                          <div className="order-item-right">
                            <span className="order-item-price font-royal">
                              ₹{item.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenReviewModal(order, item)}
                              className="order-item-review-trigger font-royal"
                              title="Review this fragrance"
                            >
                              <Star size={12} className="gold-icon" />
                              <span>Review Item</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Existing Reviews on this Order */}
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

                    {/* Order Footer & Action Row */}
                    <div className="order-card-footer">
                      <div className="order-meta-info">
                        <div className="order-meta-row">
                          <MapPin size={14} className="gold-icon" />
                          <span className="order-meta-text">{order.address}</span>
                        </div>
                        <div className="order-meta-row">
                          <CreditCard size={14} className="gold-icon" />
                          <span className="order-meta-text font-royal">
                            Mode: <strong>{order.payment_mode}</strong>
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
                          <span>Write a Review</span>
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: ADDRESS BOOK
          ========================================================================= */}
      {activeTab === 'addresses' && (
        <div className="profile-tab-pane">
          <div className="profile-tab-header">
            <div>
              <h2 className="profile-section-heading font-royal">Saved Destinations</h2>
              <p className="profile-section-sub font-poetic">
                Manage your delivery addresses for seamless checkout dispatch.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="btn-gold font-royal"
            >
              <Plus size={16} />
              <span>Add New Address</span>
            </button>
          </div>

          {addressesError && (
            <div className="profile-alert-error font-royal">
              <span>{addressesError}</span>
            </div>
          )}

          {isAddressesLoading ? (
            <div className="profile-loading-box font-royal">
              <span className="profile-spinner"></span>
              <span>Loading your address book...</span>
            </div>
          ) : addresses.length === 0 ? (
            <div className="profile-empty-state luxury-glass">
              <MapPin size={44} className="gold-icon" />
              <h3 className="font-royal">No Saved Addresses</h3>
              <p className="font-poetic">Add your shipping destination for effortless order dispatch.</p>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="btn-gold font-royal"
              >
                <Plus size={15} />
                <span>Add Your First Address</span>
              </button>
            </div>
          ) : (
            <div className="address-cards-grid">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-card luxury-glass ${addr.is_default ? 'is-default' : ''}`}
                >
                  <div className="address-card-header">
                    <span className="address-type-pill font-royal">
                      {addr.label === 'Home' ? <Home size={12} /> : <Building2 size={12} />}
                      <span>{addr.label}</span>
                    </span>
                    {addr.is_default && (
                      <span className="address-default-badge font-royal">
                        Default Destination
                      </span>
                    )}
                  </div>

                  <h3 className="address-recipient-name font-royal">{addr.full_name}</h3>
                  <p className="address-recipient-phone font-royal">Phone: {addr.phone}</p>

                  <p className="address-lines">
                    {addr.address_line1}
                    {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                    <br />
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>

                  <div className="address-card-actions">
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="address-action-link font-royal"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress(addr)}
                      className="address-icon-btn"
                      title="Edit address"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="address-icon-btn delete-btn"
                      title="Delete address"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: MY REVIEWS
          ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="profile-tab-pane">
          <div className="profile-tab-header">
            <div>
              <h2 className="profile-section-heading font-royal">Your Scent Reviews</h2>
              <p className="profile-section-sub font-poetic">
                Your personal notes, fragrance longevity impressions, and aroma ratings.
              </p>
            </div>
          </div>

          {isReviewsLoading ? (
            <div className="profile-loading-box font-royal">
              <span className="profile-spinner"></span>
              <span>Loading your fragrance reviews...</span>
            </div>
          ) : myReviews.length === 0 ? (
            <div className="profile-empty-state luxury-glass">
              <Star size={44} className="gold-icon" />
              <h3 className="font-royal">No Reviews Written Yet</h3>
              <p className="font-poetic">
                Share your olfactory journey by reviewing past orders in your Order History.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="btn-gold font-royal"
              >
                <span>View Orders to Review</span>
              </button>
            </div>
          ) : (
            <div className="my-reviews-grid">
              {myReviews.map((rev) => (
                <div key={rev.id} className="my-review-card luxury-glass">
                  <div className="my-rev-header">
                    <div className="rev-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= rev.rating ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                    </div>
                    <span className="rev-date font-poetic">{formatDate(rev.created_at)}</span>
                  </div>

                  <div className="my-rev-meta">
                    <span className="my-rev-product font-royal">
                      {rev.product_name || 'Bespoke Fragrance'}
                    </span>
                    <span className="my-rev-order-ref font-royal">Order #{rev.order_id}</span>
                  </div>

                  {rev.review_title && (
                    <h4 className="my-rev-title font-royal">"{rev.review_title}"</h4>
                  )}

                  <p className="my-rev-comment font-poetic">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          REVIEW SUBMISSION MODAL
          ========================================================================= */}
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

                {/* Product Selector */}
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

                {/* Interactive Star Rating */}
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

                {/* Review Title */}
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

                {/* Detailed Feedback */}
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

      {/* =========================================================================
          ADDRESS MODAL (ADD / EDIT)
          ========================================================================= */}
      {addressModalOpen && (
        <div className="modal-overlay" onClick={() => setAddressModalOpen(false)}>
          <div className="modal-card luxury-glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title-box">
                <MapPin size={20} className="gold-icon" />
                <h3 className="modal-title font-royal">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAddress} className="modal-form">
              <div className="form-grid-row">
                <div className="form-group">
                  <label className="font-royal">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.full_name}
                    onChange={(e) => setAddressFormData({ ...addressFormData, full_name: e.target.value })}
                    className="checkout-input"
                  />
                </div>
                <div className="form-group">
                  <label className="font-royal">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addressFormData.phone}
                    onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                    className="checkout-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="font-royal">Address Line 1 (Flat, House, Street) *</label>
                <input
                  type="text"
                  required
                  value={addressFormData.address_line1}
                  onChange={(e) => setAddressFormData({ ...addressFormData, address_line1: e.target.value })}
                  className="checkout-input"
                />
              </div>

              <div className="form-group">
                <label className="font-royal">Address Line 2 (Area, Landmark)</label>
                <input
                  type="text"
                  value={addressFormData.address_line2}
                  onChange={(e) => setAddressFormData({ ...addressFormData, address_line2: e.target.value })}
                  className="checkout-input"
                />
              </div>

              <div className="form-grid-row">
                <div className="form-group">
                  <label className="font-royal">City *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    className="checkout-input"
                  />
                </div>
                <div className="form-group">
                  <label className="font-royal">State *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
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
                    value={addressFormData.pincode}
                    onChange={(e) => setAddressFormData({ ...addressFormData, pincode: e.target.value })}
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
                        onClick={() => setAddressFormData({ ...addressFormData, label })}
                        className={`address-label-pill-btn font-royal ${addressFormData.label === label ? 'active' : ''}`}
                      >
                        <Icon size={13} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="checkbox-row font-royal">
                <input
                  type="checkbox"
                  checked={addressFormData.is_default}
                  onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="btn-outline-gold font-royal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAddress}
                  className="btn-gold font-royal"
                >
                  {isSubmittingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
