import React, { useState, useEffect } from 'react';
import {
  PackageCheck, ArrowLeft, Download, Clock,
  CheckCircle2, XCircle, AlertCircle, ShoppingBag,
  Sparkles, ExternalLink, Calendar, MapPin, CreditCard
} from 'lucide-react';
import { api, getAccessToken } from '../api';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';

export default function MyOrders({ user, onRequireAuth }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      onRequireAuth?.();
      return;
    }

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

    fetchOrders();
  }, [user]);

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
          {orders.map((order) => (
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
                    <span className="order-item-price font-royal">
                      ₹{item.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

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

                <div className="order-total-block">
                  <span className="order-total-label font-royal">Total Paid</span>
                  <span className="order-total-amount font-royal gold-gradient-text">
                    ₹{order.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
