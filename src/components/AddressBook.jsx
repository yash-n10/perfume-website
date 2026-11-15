import React, { useState, useEffect } from 'react';
import {
  MapPin, Plus, Trash2, Edit2, CheckCircle2,
  ArrowLeft, Home, Building2, Sparkles, AlertCircle, X, ShoppingBag
} from 'lucide-react';
import { api, getAccessToken } from '../api';

export default function AddressBook({ user, onRequireAuth }) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      onRequireAuth?.();
      return;
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getAddresses();
      setAddresses(data || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setFormData({
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
    setModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setFormData({
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
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingAddress) {
        await api.updateAddress(editingAddress.id, formData);
        setSuccessMessage('Address updated successfully.');
      } else {
        await api.addAddress(formData);
        setSuccessMessage('New address saved to your address book.');
      }
      setModalOpen(false);
      await fetchAddresses();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.deleteAddress(addressId);
      setAddresses(addresses.filter((a) => a.id !== addressId));
      setSuccessMessage('Address deleted.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await api.setDefaultAddress(addressId);
      await fetchAddresses();
      setSuccessMessage('Default delivery address updated.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to set default address.');
    }
  };

  if (!getAccessToken()) {
    return (
      <div className="address-book-page">
        <div className="address-book-auth-card luxury-glass">
          <MapPin size={48} className="gold-icon" />
          <h2 className="font-royal">Address Book</h2>
          <p className="font-poetic">Please sign in to manage your delivery addresses.</p>
          <button type="button" onClick={onRequireAuth} className="btn-gold font-royal">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="address-book-page">
      <div className="address-book-header">
        <button
          type="button"
          onClick={() => { window.location.hash = '#/'; }}
          className="address-back-btn font-royal"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="address-title-block">
          <div className="address-eyebrow font-royal">
            <Sparkles size={13} className="gold-icon" />
            <span>Personal Concierge</span>
          </div>
          <h1 className="address-page-title font-royal">
            Address <span className="gold-gradient-text">Book</span>
          </h1>
          <p className="address-page-subtitle font-poetic">
            Manage your saved delivery destinations for effortless bespoke order dispatch.
          </p>
        </div>

        <div className="address-header-actions">
          <button
            type="button"
            onClick={() => { window.location.hash = '#/checkout'; }}
            className="btn-outline-gold font-royal"
            style={{ padding: '9px 16px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ShoppingBag size={14} />
            <span>Go to Checkout</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn-gold address-add-btn font-royal"
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="address-alert-success font-royal">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="address-alert-error font-royal">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {/* Main List */}
      {isLoading ? (
        <div className="address-loading font-royal gold-gradient-text">
          Loading your address book...
        </div>
      ) : addresses.length === 0 ? (
        <div className="address-empty-card luxury-glass">
          <MapPin size={44} className="gold-icon" />
          <h3 className="font-royal">No Saved Addresses</h3>
          <p className="font-poetic">
            You haven't saved any delivery addresses yet. Add your address for faster checkout.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
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
                    onClick={() => handleSetDefault(addr.id)}
                    className="address-action-link font-royal"
                  >
                    Set as Default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(addr)}
                  className="address-icon-action"
                  title="Edit address"
                >
                  <Edit2 size={15} />
                  <span className="font-royal">Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="address-icon-action address-del"
                  title="Delete address"
                >
                  <Trash2 size={15} />
                  <span className="font-royal">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div
          className="address-modal-overlay"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="address-modal-card luxury-glass" onClick={(e) => e.stopPropagation()}>
            <div className="address-modal-header">
              <h3 className="address-modal-title font-royal">
                {editingAddress ? 'Edit Delivery Destination' : 'Add New Delivery Destination'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="address-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="address-modal-form">
              <div className="form-grid-row">
                <div className="form-group">
                  <label className="font-royal">Address Label</label>
                  <select
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="checkout-input font-royal"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Bespoke">Bespoke / Studio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="font-royal">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="checkout-input"
                  />
                </div>
              </div>

              <div className="form-grid-row">
                <div className="form-group">
                  <label className="font-royal">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 Mobile Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="checkout-input"
                  />
                </div>

                <div className="form-group">
                  <label className="font-royal">PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit PIN code"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="checkout-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="font-royal">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="Flat / Villa / House No., Building Name, Street"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="checkout-input"
                />
              </div>

              <div className="form-group">
                <label className="font-royal">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Area, Landmark or Colony"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className="checkout-input"
                />
              </div>

              <div className="form-grid-row">
                <div className="form-group">
                  <label className="font-royal">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="checkout-input"
                  />
                </div>

                <div className="form-group">
                  <label className="font-royal">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="checkout-input"
                  />
                </div>
              </div>

              <label className="checkbox-row font-royal">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline-gold font-royal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold font-royal"
                >
                  {isSubmitting ? 'Saving...' : editingAddress ? 'Update Destination' : 'Save Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
