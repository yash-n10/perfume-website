import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  MessageSquare,
  LogOut,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Download,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Package,
  ShoppingCart,
  Plus,
  Trash2,
  ImageIcon,
  IndianRupee,
  PlusCircle,
  MinusCircle,
  Edit,
  ToggleLeft,
  ToggleRight,
  FileText,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api';
import { downloadInvoicePDF, printInvoice } from '../utils/invoiceGenerator';
import logo from '/logo_white.png';
import './AdminPanel.css';

const ADMIN_TOKEN_KEY = 'mohera_admin_token';
const ADMIN_USER_KEY = 'mohera_admin_username';

// ─── Navbar Sections ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'enquiries', label: 'Enquiries',    Icon: MessageSquare },
  { key: 'users',     label: 'Customers',    Icon: Users },
  { key: 'products',  label: 'Products',     Icon: Package },
  { key: 'orders',    label: 'Create Order', Icon: ShoppingCart },
];

const EMPTY_ORDER_ITEM = { product_name: '', quantity: 1, unit_price: '', total_price: 0 };
const EMPTY_ORDER = {
  customer_name: '', phone: '', email: '', address: '',
  order_type: 'offline', payment_mode: 'Cash', payment_status: 'success', paid_status: 1,
  send_email: true, send_whatsapp: true,
  items: [{ ...EMPTY_ORDER_ITEM }],
};
const EMPTY_PRODUCT = { product_name: '', price: '', image: '', description: '', status: 'active' };

export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem(ADMIN_USER_KEY) || '');

  // Login form
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [loginLoading, setLoginLoading]   = useState(false);
  const [loginError,   setLoginError]     = useState('');

  // Dashboard
  const [activeTab,    setActiveTab]    = useState('products');
  const [users,        setUsers]        = useState([]);
  const [enquiries,    setEnquiries]    = useState([]);
  const [products,     setProducts]     = useState([]);
  const [dataLoading,  setDataLoading]  = useState(false);
  const [dataError,    setDataError]    = useState('');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId,   setUpdatingId]   = useState(null);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm,     setProductForm]     = useState({ ...EMPTY_PRODUCT });
  const [productSaving,   setProductSaving]   = useState(false);
  const [productError,    setProductError]    = useState('');
  const [productSuccess,  setProductSuccess]  = useState('');
  const [editingProduct,  setEditingProduct]  = useState(null); // null = adding new

  // Order form & Bill PDF
  const [orderForm,         setOrderForm]         = useState({ ...EMPTY_ORDER, items: [{ ...EMPTY_ORDER_ITEM }] });
  const [orderSaving,       setOrderSaving]       = useState(false);
  const [orderError,        setOrderError]        = useState('');
  const [orderSuccess,      setOrderSuccess]      = useState('');
  const [selectedUserId,    setSelectedUserId]    = useState('');
  const [lastCreatedOrder,  setLastCreatedOrder]  = useState(null);
  const [pdfGenerating,     setPdfGenerating]     = useState(false);

  // ─── auth ─────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    setToken(''); setAdminUsername('');
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setUsers([]); setEnquiries([]); setProducts([]);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setLoginError('Please enter both admin username and password.'); return;
    }
    setLoginLoading(true);
    try {
      const response = await api.adminLogin({ username: usernameInput.trim(), password: passwordInput.trim() });
      if (response?.access_token) {
        const resolvedUser = response.username || usernameInput.trim();
        setToken(response.access_token);
        setAdminUsername(resolvedUser);
        localStorage.setItem(ADMIN_TOKEN_KEY, response.access_token);
        localStorage.setItem(ADMIN_USER_KEY, resolvedUser);
      } else {
        setLoginError('Invalid response from server.');
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── data fetch ───────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true); setDataError('');
    try {
      if (activeTab === 'users') {
        const data = await api.getAdminUsers(token);
        setUsers(Array.isArray(data) ? data : []);
      } else if (activeTab === 'enquiries') {
        const params = statusFilter ? { status: statusFilter } : {};
        const data = await api.getAdminEnquiryReport(token, params);
        setEnquiries(Array.isArray(data) ? data : []);
      } else if (activeTab === 'products') {
        const data = await api.listProducts();
        setProducts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'orders') {
        const [pdata, udata] = await Promise.all([
          api.listProducts('active'),
          api.getAdminUsers(token).catch(() => []),
        ]);
        if (Array.isArray(pdata)) setProducts(pdata);
        if (Array.isArray(udata)) setUsers(udata);
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('401') || err.message?.toLowerCase().includes('token')) {
        handleLogout(); setLoginError('Admin session expired. Please log in again.');
      } else {
        setDataError(err.message || 'Failed to load data.');
      }
    } finally {
      setDataLoading(false);
    }
  }, [token, activeTab, statusFilter, handleLogout]);

  useEffect(() => { if (token) fetchDashboardData(); }, [token, activeTab, fetchDashboardData]);

  // Pre-fetch count stats and user directory on initial auth
  useEffect(() => {
    if (!token) return;
    api.listProducts().then(d => { if (Array.isArray(d)) setProducts(d); }).catch(() => {});
    api.getAdminEnquiryReport(token).then(d => { if (Array.isArray(d)) setEnquiries(d); }).catch(() => {});
    api.getAdminUsers(token).then(d => { if (Array.isArray(d)) setUsers(d); }).catch(() => {});
  }, [token]);

  // ─── enquiry status ───────────────────────────────────────────────────────
  const handleStatusChange = async (enquiryId, newStatus) => {
    if (!token) return;
    setUpdatingId(enquiryId);
    try {
      const updated = await api.updateAdminEnquiryStatus(token, enquiryId, newStatus);
      if (updated?.id) setEnquiries(prev => prev.map(item => item.id === enquiryId ? { ...item, status: newStatus } : item));
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── CSV export ───────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (!enquiries.length) return;
    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Status', 'Date', 'Enquiry Message'];
    const rows = enquiries.map(item => [
      item.id,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.phone || '').replace(/"/g, '""')}"`,
      `"${(item.status || 'new').replace(/"/g, '""')}"`,
      `"${item.created_at ? new Date(item.created_at).toISOString() : ''}"`,
      `"${(item.enquiry || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `mohera_enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // ─── KPI ─────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter(e => !e.status || e.status === 'new' || e.status === 'pending').length;
    const inProgressCount = enquiries.filter(e => e.status === 'in_progress' || e.status === 'in_review').length;
    const resolvedCount = enquiries.filter(e => e.status === 'resolved').length;
    return { total, newCount, inProgressCount, resolvedCount };
  }, [enquiries]);

  // ─── filtered views ───────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t) || u.phone?.toLowerCase().includes(t);
  });

  const filteredEnquiries = enquiries.filter(e => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return e.name?.toLowerCase().includes(t) || e.email?.toLowerCase().includes(t) ||
      e.phone?.toLowerCase().includes(t) || e.enquiry?.toLowerCase().includes(t);
  });

  const filteredProducts = products.filter(p => {
    const termMatch = !searchTerm ||
      p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = !statusFilter || p.status === statusFilter;
    return termMatch && statusMatch;
  });

  // ─── product form handlers ────────────────────────────────────────────────
  const handleProductSave = async (e) => {
    e.preventDefault();
    setProductError(''); setProductSuccess('');
    if (!productForm.product_name.trim()) { setProductError('Product name is required.'); return; }
    if (productForm.price === '' || isNaN(productForm.price)) { setProductError('Valid price is required.'); return; }

    setProductSaving(true);
    try {
      const payload = {
        product_name: productForm.product_name.trim(),
        price: parseFloat(productForm.price),
        image: productForm.image.trim() || null,
        description: productForm.description.trim() || null,
        status: productForm.status,
      };
      let result;
      if (editingProduct) {
        result = await api.updateProduct(token, editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? result : p));
        setProductSuccess(`Product "${result.product_name}" updated successfully!`);
      } else {
        result = await api.createProduct(token, payload);
        setProducts(prev => [result, ...prev]);
        setProductSuccess(`Product "${result.product_name}" added successfully!`);
      }
      setProductForm({ ...EMPTY_PRODUCT });
      setEditingProduct(null);
      setShowProductForm(false);
    } catch (err) {
      setProductError(err.message || 'Failed to save product.');
    } finally {
      setProductSaving(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      product_name: product.product_name,
      price: String(product.price),
      image: product.image || '',
      description: product.description || '',
      status: product.status,
    });
    setShowProductForm(true);
    setProductError(''); setProductSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleProductStatus = async (product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const payload = {
        product_name: product.product_name,
        price: product.price,
        image: product.image,
        description: product.description,
        status: nextStatus,
      };
      const updated = await api.updateProduct(token, product.id, payload);
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    } catch (err) {
      alert(`Could not toggle status: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.deleteProduct(token, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert(`Could not delete product: ${err.message}`);
    }
  };

  // ─── user selection for order ─────────────────────────────────────────────
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    if (!userId) return;
    const user = users.find(u => String(u.id) === String(userId));
    if (user) {
      setOrderForm(prev => ({
        ...prev,
        customer_name: user.name || prev.customer_name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: prev.address || 'Registered Customer Address',
      }));
    }
  };

  // ─── order form handlers ──────────────────────────────────────────────────
  const updateOrderItem = (index, field, value) => {
    setOrderForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        const qty   = parseFloat(field === 'quantity'   ? value : items[index].quantity)  || 0;
        const price = parseFloat(field === 'unit_price' ? value : items[index].unit_price) || 0;
        items[index].total_price = +(qty * price).toFixed(2);
      }
      return { ...prev, items };
    });
  };

  const selectExistingProduct = (index, productName) => {
    const matched = products.find(p => p.product_name.toLowerCase() === productName.toLowerCase());
    if (matched) {
      setOrderForm(prev => {
        const items = [...prev.items];
        items[index] = {
          ...items[index],
          product_name: matched.product_name,
          unit_price: matched.price,
          total_price: +((items[index].quantity || 1) * matched.price).toFixed(2)
        };
        return { ...prev, items };
      });
    } else {
      updateOrderItem(index, 'product_name', productName);
    }
  };

  const addOrderItem = () => setOrderForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ORDER_ITEM }] }));
  const removeOrderItem = (index) => setOrderForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const orderTotal = useMemo(() =>
    orderForm.items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0).toFixed(2),
    [orderForm.items]
  );

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError(''); setOrderSuccess('');

    if (!orderForm.customer_name.trim()) { setOrderError('Customer name is required.'); return; }
    if (!orderForm.phone.trim()) { setOrderError('Phone is required.'); return; }
    if (!orderForm.address.trim()) { setOrderError('Address is required.'); return; }
    if (orderForm.items.some(i => !i.product_name.trim() || !i.unit_price)) {
      setOrderError('All items must have a product name and unit price.'); return;
    }

    setOrderSaving(true);
    try {
      const payload = {
        customer_name: orderForm.customer_name.trim(),
        phone: orderForm.phone.trim(),
        email: orderForm.email.trim() || 'walkin@mohera.com',
        address: orderForm.address.trim(),
        order_type: orderForm.order_type,
        total_price: parseFloat(orderTotal),
        payment_mode: orderForm.payment_mode,
        payment_status: orderForm.payment_status,
        paid_status: parseInt(orderForm.paid_status),
        send_email: Boolean(orderForm.send_email),
        send_whatsapp: Boolean(orderForm.send_whatsapp),
        items: orderForm.items.map(i => ({
          product_name: i.product_name.trim(),
          quantity: parseInt(i.quantity) || 1,
          unit_price: parseFloat(i.unit_price) || 0,
          total_price: parseFloat(i.total_price) || 0,
        })),
      };

      const result = await api.createOrder(payload);
      setLastCreatedOrder(result);
      setOrderSuccess(`Order #${result.id} created successfully for ${result.customer_name}! Grand Total: ₹${Number(result.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      setOrderForm({ ...EMPTY_ORDER, items: [{ ...EMPTY_ORDER_ITEM }] });
      setSelectedUserId('');
    } catch (err) {
      setOrderError(err.message || 'Failed to create order.');
    } finally {
      setOrderSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!lastCreatedOrder) return;
    setPdfGenerating(true);
    try {
      await downloadInvoicePDF(lastCreatedOrder, lastCreatedOrder.gst_number || '27AABCM1234F1Z1');
    } catch (err) {
      alert(`Could not generate PDF: ${err.message}`);
    } finally {
      setPdfGenerating(false);
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-page-container">
      <div className="admin-bg-orb orb-top" aria-hidden="true" />
      <div className="admin-bg-orb orb-bottom" aria-hidden="true" />

      {/* ── Header (No Storefront option) ── */}
      <header className="admin-header">
        <div className="admin-brand">
          <img src={logo} alt="MOHERA" className="admin-logo-img" />
          <span className="admin-badge font-royal">ADMIN CONSOLE</span>
        </div>

        {token && (
          <div className="admin-header-right">
            <div className="admin-user-info font-royal">
              <ShieldCheck size={14} className="gold-icon" />
              <span>{adminUsername || 'admin'}</span>
            </div>
            <button type="button" onClick={handleLogout} className="admin-logout-btn font-royal" title="Sign Out">
              <LogOut size={14} /><span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* ── Admin Navbar ── */}
      {token && (
        <nav className="admin-navbar" aria-label="Admin Navigation">
          <div className="admin-navbar-inner">
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`admin-nav-item font-royal ${activeTab === key ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(key);
                  setSearchTerm('');
                  setStatusFilter('');
                  setDataError('');
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
                {key === 'enquiries' && enquiries.length > 0 && (
                  <span className="admin-nav-count">{enquiries.length}</span>
                )}
                {key === 'users' && users.length > 0 && (
                  <span className="admin-nav-count">{users.length}</span>
                )}
                {key === 'products' && products.length > 0 && (
                  <span className="admin-nav-count">{products.length}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── Main Content Area ── */}
      <main className="admin-main">
        {!token ? (
          /* ── LOGIN ── */
          <div className="admin-login-wrapper">
            <div className="admin-login-card">
              <div className="admin-card-header">
                <div className="admin-icon-shield">
                  <ShieldCheck size={28} className="gold-icon" />
                </div>
                <h1 className="font-royal admin-login-title">Admin Access</h1>
                <p className="admin-login-subtitle">Secure administration portal for MOHERA Haute Parfumerie</p>
              </div>

              {loginError && (
                <div className="admin-alert-error" role="alert">
                  <AlertCircle size={16} /><span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="admin-form">
                <div className="admin-field-group">
                  <label className="admin-field-label font-royal" htmlFor="admin-username">Username</label>
                  <div className="admin-input-box">
                    <UserIcon size={16} className="admin-input-icon" />
                    <input id="admin-username" type="text" value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)} placeholder="admin"
                      required autoComplete="username" className="admin-input" />
                  </div>
                </div>
                <div className="admin-field-group">
                  <label className="admin-field-label font-royal" htmlFor="admin-password">Password</label>
                  <div className="admin-input-box">
                    <Lock size={16} className="admin-input-icon" />
                    <input id="admin-password" type={showPassword ? 'text' : 'password'} value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••••••"
                      required autoComplete="current-password" className="admin-input" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="admin-toggle-eye" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loginLoading} className="admin-submit-btn font-royal">
                  {loginLoading
                    ? <span className="admin-btn-content"><RefreshCw size={16} className="spin-icon" /> Authenticating...</span>
                    : 'Enter Admin Portal'}
                </button>
              </form>

              <div className="admin-card-footer">
                <p>Restricted access. All actions are logged and audited.</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── DASHBOARD VIEW ── */
          <div className="admin-content-area">

            {/* ════════════════════ PRODUCTS TAB ════════════════════ */}
            {activeTab === 'products' && (
              <div className="admin-products-view">
                {/* Actions & Filter Bar */}
                <div className="admin-dash-header">
                  <div className="admin-title-group">
                    <h2 className="admin-section-heading font-royal">
                      <Package size={20} className="gold-icon" />
                      Product Catalogue
                    </h2>
                    <span className="admin-section-subtext">Manage luxury perfumes, prices, stock statuses, and descriptions</span>
                  </div>

                  <div className="admin-controls">
                    <button
                      type="button"
                      className="admin-add-product-toggle-btn font-royal"
                      onClick={() => {
                        if (showProductForm && !editingProduct) {
                          setShowProductForm(false);
                        } else {
                          setEditingProduct(null);
                          setProductForm({ ...EMPTY_PRODUCT });
                          setShowProductForm(true);
                        }
                        setProductError('');
                        setProductSuccess('');
                      }}
                    >
                      <Plus size={16} />
                      <span>{showProductForm && !editingProduct ? 'Close Form' : 'Add Product'}</span>
                    </button>

                    <div className="admin-search-box">
                      <Search size={15} className="admin-search-icon" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="admin-select"
                      aria-label="Filter products by status"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>

                    <button
                      type="button"
                      onClick={fetchDashboardData}
                      disabled={dataLoading}
                      className="admin-refresh-btn"
                      title="Refresh product list"
                    >
                      <RefreshCw size={16} className={dataLoading ? 'spin-icon' : ''} />
                    </button>
                  </div>
                </div>

                {dataError && (
                  <div className="admin-alert-error" role="alert">
                    <AlertCircle size={15} /><span>{dataError}</span>
                  </div>
                )}

                {productSuccess && (
                  <div className="admin-alert-success" role="status">
                    <CheckCircle2 size={15} /><span>{productSuccess}</span>
                  </div>
                )}

                {/* Add / Edit Product Form Card */}
                {showProductForm && (
                  <div className="admin-form-card admin-product-form-card">
                    <div className="admin-card-header-row">
                      <h3 className="admin-form-card-title font-royal">
                        {editingProduct ? <Edit size={16} /> : <Plus size={16} />}
                        {editingProduct ? `Edit Product #${editingProduct.id}` : 'Add New Product'}
                      </h3>
                      <button
                        type="button"
                        className="admin-close-btn"
                        onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                      >
                        ✕
                      </button>
                    </div>

                    {productError && (
                      <div className="admin-alert-error" role="alert">
                        <AlertCircle size={14} /><span>{productError}</span>
                      </div>
                    )}

                    <form onSubmit={handleProductSave} className="admin-product-form">
                      <div className="admin-form-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Product Name *</label>
                          <input
                            type="text"
                            className="admin-plain-input"
                            placeholder="e.g. Royal OUD Extrait de Parfum"
                            value={productForm.product_name}
                            onChange={e => setProductForm(p => ({ ...p, product_name: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Price (₹) *</label>
                          <div className="admin-input-adornment-box">
                            <IndianRupee size={15} className="adornment-icon" />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="admin-plain-input with-adornment"
                              placeholder="2499.00"
                              value={productForm.price}
                              onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Status</label>
                          <select
                            className="admin-select w-full"
                            value={productForm.status}
                            onChange={e => setProductForm(p => ({ ...p, status: e.target.value }))}
                          >
                            <option value="active">Active (Available)</option>
                            <option value="inactive">Inactive (Hidden)</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Image URL / Path</label>
                          <div className="admin-input-adornment-box">
                            <ImageIcon size={15} className="adornment-icon" />
                            <input
                              type="text"
                              className="admin-plain-input with-adornment"
                              placeholder="https://... or /perfume.png"
                              value={productForm.image}
                              onChange={e => setProductForm(p => ({ ...p, image: e.target.value }))}
                            />
                          </div>
                        </div>

                        {productForm.image && (
                          <div className="product-form-preview-box">
                            <span className="product-form-preview-label font-royal">Image Preview</span>
                            <img
                              src={productForm.image}
                              alt="Preview"
                              className="product-form-preview-img"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label font-royal">Description</label>
                        <textarea
                          rows={3}
                          className="admin-textarea"
                          placeholder="Fragrance notes, bottle size, longevity details, etc."
                          value={productForm.description}
                          onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                        />
                      </div>

                      <div className="admin-btn-row">
                        <button type="submit" disabled={productSaving} className="admin-submit-btn font-royal">
                          {productSaving
                            ? <span className="admin-btn-content"><RefreshCw size={15} className="spin-icon" /> Saving Product...</span>
                            : <span>{editingProduct ? 'Update Product' : 'Save & Add Product'}</span>}
                        </button>
                        <button
                          type="button"
                          className="admin-cancel-btn font-royal"
                          onClick={() => {
                            setEditingProduct(null);
                            setShowProductForm(false);
                            setProductForm({ ...EMPTY_PRODUCT });
                            setProductError('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List Table with product_name, price, image, description, status, add_time */}
                <div className="admin-table-card">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th className="font-royal">ID</th>
                          <th className="font-royal">Image</th>
                          <th className="font-royal">Product Name</th>
                          <th className="font-royal">Price</th>
                          <th className="font-royal">Description</th>
                          <th className="font-royal">Status</th>
                          <th className="font-royal">Added On</th>
                          <th className="font-royal text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataLoading && !products.length ? (
                          <tr><td colSpan="8" className="admin-td-empty"><RefreshCw size={18} className="spin-icon" /> Loading products...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                          <tr><td colSpan="8" className="admin-td-empty">No products found. Click "Add Product" above to create one.</td></tr>
                        ) : filteredProducts.map(product => (
                          <tr key={product.id}>
                            <td className="admin-td-id">#{product.id}</td>
                            <td className="product-img-cell">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.product_name}
                                  className="product-thumb"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="product-thumb-placeholder">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="customer-name-bold">{product.product_name}</span>
                            </td>
                            <td className="product-price-cell font-royal">
                              ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="product-desc-cell">
                              {product.description ? (
                                <span className="product-desc-text" title={product.description}>
                                  {product.description.slice(0, 75)}{product.description.length > 75 ? '…' : ''}
                                </span>
                              ) : (
                                <span className="admin-subtext">—</span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`product-status-pill ${product.status === 'active' ? 'status-active' : 'status-inactive'}`}
                                onClick={() => handleToggleProductStatus(product)}
                                title="Click to toggle active/inactive"
                              >
                                {product.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                <span>{product.status}</span>
                              </button>
                            </td>
                            <td className="admin-td-date">
                              {product.add_time ? (
                                <>
                                  <div>{new Date(product.add_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                  <small className="time-display">{new Date(product.add_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</small>
                                </>
                              ) : '—'}
                            </td>
                            <td>
                              <div className="product-actions">
                                <button
                                  type="button"
                                  className="product-edit-btn font-royal"
                                  onClick={() => handleEditProduct(product)}
                                  title="Edit Product"
                                >
                                  <Edit size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="product-delete-btn"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  title="Delete Product"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════ CREATE ORDER TAB ════════════════════ */}
            {activeTab === 'orders' && (
              <div className="admin-order-form-wrapper">

                {/* Bill Created Success Banner with PDF Download */}
                {lastCreatedOrder && (
                  <div className="order-bill-success-card">
                    <div className="bill-card-top">
                      <div className="bill-badge font-royal">
                        <CheckCircle2 size={18} className="success-icon" />
                        ORDER CREATED & BILL READY
                      </div>
                      <span className="bill-order-number font-royal">#MOH-ORD-{lastCreatedOrder.id}</span>
                    </div>

                    <div className="bill-card-body">
                      <h3 className="bill-customer-name font-royal">{lastCreatedOrder.customer_name}</h3>
                      <p className="bill-details-line">
                        Phone: <strong>{lastCreatedOrder.phone}</strong> | Email: <strong>{lastCreatedOrder.email || '—'}</strong> | Payment: <strong>{lastCreatedOrder.payment_mode} ({lastCreatedOrder.payment_status})</strong>
                      </p>
                      <div className="bill-grand-total-banner font-royal">
                        Total Amount: <span>₹{Number(lastCreatedOrder.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      {/* Delivery Status Tags */}
                      <div className="bill-delivery-tags">
                        <span className={`delivery-tag ${lastCreatedOrder.email_sent ? 'tag-sent' : 'tag-not-sent'}`}>
                          <Mail size={13} />
                          {lastCreatedOrder.email_sent ? 'Receipt Sent to Email' : 'Email Receipt Queued / Skipped'}
                        </span>

                        <span className={`delivery-tag ${lastCreatedOrder.whatsapp_sent ? 'tag-sent' : 'tag-ready'}`}>
                          <MessageSquare size={13} />
                          {lastCreatedOrder.whatsapp_sent ? 'Receipt Sent to WhatsApp' : 'WhatsApp Receipt Ready'}
                        </span>
                      </div>

                      {/* Action Buttons for PDF, Print, WhatsApp */}
                      <div className="bill-action-buttons">
                        <button
                          type="button"
                          className="btn-bill-download font-royal"
                          onClick={handleDownloadPDF}
                          disabled={pdfGenerating}
                        >
                          <Download size={16} />
                          <span>{pdfGenerating ? 'Generating PDF...' : 'Download Invoice (PDF)'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn-bill-print font-royal"
                          onClick={() => printInvoice(lastCreatedOrder, lastCreatedOrder.gst_number || '27AABCM1234F1Z1')}
                        >
                          <Printer size={16} />
                          <span>Print Bill</span>
                        </button>

                        {lastCreatedOrder.whatsapp_url && (
                          <a
                            href={lastCreatedOrder.whatsapp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-bill-whatsapp font-royal"
                            title="Open chat in WhatsApp Web with prefilled invoice message"
                          >
                            <MessageSquare size={16} />
                            <span>Send on WhatsApp</span>
                            <ExternalLink size={13} />
                          </a>
                        )}

                        <button
                          type="button"
                          className="btn-bill-new font-royal"
                          onClick={() => setLastCreatedOrder(null)}
                        >
                          + Create Another Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="admin-form-card admin-order-card">
                  <div className="admin-dash-header">
                    <div className="admin-title-group">
                      <h2 className="admin-section-heading font-royal">
                        <ShoppingCart size={20} className="gold-icon" />
                        Create Order (Admin Portal)
                      </h2>
                      <span className="admin-section-subtext">Book offline sales, phone orders, or custom client fragrances directly</span>
                    </div>
                  </div>

                  {orderError && (
                    <div className="admin-alert-error" role="alert">
                      <AlertCircle size={15} /><span>{orderError}</span>
                    </div>
                  )}

                  {orderSuccess && !lastCreatedOrder && (
                    <div className="admin-alert-success" role="status">
                      <CheckCircle2 size={15} /><span>{orderSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleOrderSubmit} className="admin-order-form">

                    {/* Quick Fill from Registered Users Table */}
                    <div className="order-user-fetch-box">
                      <div className="fetch-label-row">
                        <Users size={15} className="gold-icon" />
                        <span className="font-royal fetch-title">Fetch Customer from Users Table:</span>
                      </div>
                      <div className="fetch-select-row">
                        <select
                          className="admin-select fetch-user-select"
                          value={selectedUserId}
                          onChange={e => handleSelectUser(e.target.value)}
                        >
                          <option value="">-- Choose registered customer (or enter walk-in below) --</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              #{u.id} - {u.name} ({u.phone}) - {u.email}
                            </option>
                          ))}
                        </select>
                        {selectedUserId && (
                          <button
                            type="button"
                            className="admin-clear-user-btn font-royal"
                            onClick={() => {
                              setSelectedUserId('');
                              setOrderForm(p => ({ ...p, customer_name: '', phone: '', email: '', address: '' }));
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <fieldset className="order-fieldset">
                      <legend className="font-royal order-legend">Customer Details</legend>
                      <div className="admin-form-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Customer Name *</label>
                          <input
                            type="text"
                            className="admin-plain-input"
                            placeholder="Full Name"
                            value={orderForm.customer_name}
                            onChange={e => setOrderForm(p => ({ ...p, customer_name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Phone Number (WhatsApp) *</label>
                          <input
                            type="tel"
                            className="admin-plain-input"
                            placeholder="10-digit phone"
                            value={orderForm.phone}
                            onChange={e => setOrderForm(p => ({ ...p, phone: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Email</label>
                          <input
                            type="email"
                            className="admin-plain-input"
                            placeholder="customer@email.com (optional)"
                            value={orderForm.email}
                            onChange={e => setOrderForm(p => ({ ...p, email: e.target.value }))}
                          />
                        </div>
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Order Type</label>
                          <select
                            className="admin-select w-full"
                            value={orderForm.order_type}
                            onChange={e => setOrderForm(p => ({ ...p, order_type: e.target.value }))}
                          >
                            <option value="offline">Offline / Walk-in Store</option>
                            <option value="phone">Phone / WhatsApp Order</option>
                            <option value="online">Online / Custom Order</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label font-royal">Delivery / Billing Address *</label>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          placeholder="Complete address with city & pincode (or Walk-in store counter)"
                          value={orderForm.address}
                          onChange={e => setOrderForm(p => ({ ...p, address: e.target.value }))}
                          required
                        />
                      </div>
                    </fieldset>

                    {/* Order Line Items */}
                    <fieldset className="order-fieldset">
                      <legend className="font-royal order-legend">Order Line Items</legend>

                      {orderForm.items.map((item, index) => (
                        <div key={index} className="order-item-row">
                          <div className="admin-field-group order-item-name">
                            <label className="admin-field-label font-royal">Product Name *</label>
                            <input
                              type="text"
                              list={`product-datalist-${index}`}
                              className="admin-plain-input"
                              placeholder="Select or enter product name"
                              value={item.product_name}
                              onChange={e => selectExistingProduct(index, e.target.value)}
                              required
                            />
                            <datalist id={`product-datalist-${index}`}>
                              {products.map(p => (
                                <option key={p.id} value={p.product_name}>
                                  ₹{p.price} — {p.product_name}
                                </option>
                              ))}
                            </datalist>
                          </div>

                          <div className="admin-field-group order-item-qty">
                            <label className="admin-field-label font-royal">Qty</label>
                            <input
                              type="number"
                              min="1"
                              className="admin-plain-input"
                              value={item.quantity}
                              onChange={e => updateOrderItem(index, 'quantity', e.target.value)}
                            />
                          </div>

                          <div className="admin-field-group order-item-price">
                            <label className="admin-field-label font-royal">Unit Price (₹) *</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="admin-plain-input"
                              placeholder="0.00"
                              value={item.unit_price}
                              onChange={e => updateOrderItem(index, 'unit_price', e.target.value)}
                              required
                            />
                          </div>

                          <div className="admin-field-group order-item-total">
                            <label className="admin-field-label font-royal">Total (₹)</label>
                            <div className="order-item-total-val font-royal">
                              ₹{Number(item.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          {orderForm.items.length > 1 && (
                            <button
                              type="button"
                              className="order-remove-btn"
                              onClick={() => removeOrderItem(index)}
                              title="Remove item"
                            >
                              <MinusCircle size={18} />
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="order-items-footer">
                        <button type="button" className="order-add-item-btn font-royal" onClick={addOrderItem}>
                          <PlusCircle size={15} /> Add Another Product
                        </button>

                        <div className="order-grand-total font-royal">
                          Grand Total: <span>₹{Number(orderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </fieldset>

                    {/* Payment Details */}
                    <fieldset className="order-fieldset">
                      <legend className="font-royal order-legend">Payment Details</legend>
                      <div className="admin-form-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Payment Mode</label>
                          <select
                            className="admin-select w-full"
                            value={orderForm.payment_mode}
                            onChange={e => setOrderForm(p => ({ ...p, payment_mode: e.target.value }))}
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI / GPay / PhonePe</option>
                            <option value="Card">Card (Debit / Credit)</option>
                            <option value="NetBanking">Net Banking</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Payment Status</label>
                          <select
                            className="admin-select w-full"
                            value={orderForm.payment_status}
                            onChange={e => setOrderForm(p => ({ ...p, payment_status: e.target.value }))}
                          >
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Paid Status</label>
                          <select
                            className="admin-select w-full"
                            value={orderForm.paid_status}
                            onChange={e => setOrderForm(p => ({ ...p, paid_status: e.target.value }))}
                          >
                            <option value={1}>Paid (1)</option>
                            <option value={0}>Unpaid (0)</option>
                          </select>
                        </div>
                      </div>
                    </fieldset>

                    {/* Receipt & Notifications */}
                    <fieldset className="order-fieldset">
                      <legend className="font-royal order-legend">Receipt & Notifications</legend>
                      <div className="order-notification-options">
                        <label className="order-notification-checkbox font-royal">
                          <input
                            type="checkbox"
                            checked={orderForm.send_email}
                            onChange={e => setOrderForm(p => ({ ...p, send_email: e.target.checked }))}
                          />
                          <span className="checkbox-indicator" />
                          <span className="checkbox-text">
                            <Mail size={15} className="gold-icon" /> Send Tax Invoice to Customer Email {orderForm.email ? `(${orderForm.email})` : ''}
                          </span>
                        </label>

                        <label className="order-notification-checkbox font-royal">
                          <input
                            type="checkbox"
                            checked={orderForm.send_whatsapp}
                            onChange={e => setOrderForm(p => ({ ...p, send_whatsapp: e.target.checked }))}
                          />
                          <span className="checkbox-indicator" />
                          <span className="checkbox-text">
                            <MessageSquare size={15} className="gold-icon" /> Send Bill Receipt via WhatsApp {orderForm.phone ? `(${orderForm.phone})` : ''}
                          </span>
                        </label>
                      </div>
                    </fieldset>

                    <button type="submit" disabled={orderSaving} className="admin-submit-btn font-royal order-submit-btn">
                      {orderSaving
                        ? <span className="admin-btn-content"><RefreshCw size={16} className="spin-icon" /> Creating Order & Bill...</span>
                        : <span className="admin-btn-content"><ShoppingCart size={16} /> Place Order & Generate Bill</span>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ════════════════════ ENQUIRIES TAB ════════════════════ */}
            {activeTab === 'enquiries' && (
              <div className="admin-enquiries-view">
                {/* KPI Ribbon */}
                <div className="enquiry-metrics-grid">
                  <div className="metric-card">
                    <div className="metric-header"><span className="metric-title font-royal">Total Inquiries</span><MessageSquare size={16} className="gold-icon" /></div>
                    <div className="metric-value font-royal">{metrics.total}</div>
                    <span className="metric-subtext">All customer queries</span>
                  </div>
                  <div className="metric-card metric-status-new">
                    <div className="metric-header"><span className="metric-title font-royal">New / Pending</span><Clock size={16} className="status-icon-pending" /></div>
                    <div className="metric-value font-royal">{metrics.newCount}</div>
                    <span className="metric-subtext">Needs attention</span>
                  </div>
                  <div className="metric-card metric-status-progress">
                    <div className="metric-header"><span className="metric-title font-royal">In Progress</span><Sparkles size={16} className="status-icon-progress" /></div>
                    <div className="metric-value font-royal">{metrics.inProgressCount}</div>
                    <span className="metric-subtext">Under review</span>
                  </div>
                  <div className="metric-card metric-status-resolved">
                    <div className="metric-header"><span className="metric-title font-royal">Resolved</span><CheckCircle2 size={16} className="status-icon-resolved" /></div>
                    <div className="metric-value font-royal">{metrics.resolvedCount}</div>
                    <span className="metric-subtext">Completed inquiries</span>
                  </div>
                </div>

                <div className="admin-dash-header">
                  <div className="admin-title-group">
                    <h2 className="admin-section-heading font-royal">Customer Enquiries</h2>
                    <span className="admin-section-subtext">Review messages and fragrance consultation requests</span>
                  </div>

                  <div className="admin-controls">
                    <div className="admin-search-box">
                      <Search size={15} className="admin-search-icon" />
                      <input
                        type="text"
                        placeholder="Search enquiries..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="admin-select"
                      aria-label="Filter enquiries by status"
                    >
                      <option value="">All Statuses</option>
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button
                      type="button"
                      onClick={exportToCSV}
                      disabled={enquiries.length === 0}
                      className="admin-action-btn font-royal"
                      title="Export Enquiries to CSV"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={fetchDashboardData}
                      disabled={dataLoading}
                      className="admin-refresh-btn"
                      title="Refresh inquiries"
                    >
                      <RefreshCw size={16} className={dataLoading ? 'spin-icon' : ''} />
                    </button>
                  </div>
                </div>

                {dataError && (
                  <div className="admin-alert-error" role="alert">
                    <AlertCircle size={15} /><span>{dataError}</span>
                  </div>
                )}

                <div className="admin-table-card">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th className="font-royal">ID</th>
                          <th className="font-royal">Customer</th>
                          <th className="font-royal">Contact Info</th>
                          <th className="font-royal">Message</th>
                          <th className="font-royal">Status</th>
                          <th className="font-royal">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataLoading && !enquiries.length ? (
                          <tr><td colSpan="6" className="admin-td-empty"><RefreshCw size={18} className="spin-icon" /> Loading enquiry reports...</td></tr>
                        ) : filteredEnquiries.length === 0 ? (
                          <tr><td colSpan="6" className="admin-td-empty">No enquiries found matching criteria.</td></tr>
                        ) : filteredEnquiries.map(enq => (
                          <tr key={enq.id}>
                            <td className="admin-td-id">#{enq.id}</td>
                            <td><span className="customer-name-bold">{enq.name}</span></td>
                            <td className="admin-td-contact">
                              {enq.email && (
                                <a href={`mailto:${enq.email}`} className="contact-link" title={`Email ${enq.email}`}>
                                  <Mail size={13} /><span>{enq.email}</span>
                                </a>
                              )}
                              {enq.phone && (
                                <a href={`tel:${enq.phone}`} className="contact-link" title={`Call ${enq.phone}`}>
                                  <Phone size={13} /><span>{enq.phone}</span>
                                </a>
                              )}
                            </td>
                            <td className="admin-td-message">
                              <p className="admin-message-bubble">{enq.enquiry}</p>
                            </td>
                            <td>
                              <div className="status-dropdown-wrapper">
                                <select
                                  value={enq.status || 'new'}
                                  onChange={e => handleStatusChange(enq.id, e.target.value)}
                                  disabled={updatingId === enq.id}
                                  className={`status-select status-${(enq.status || 'new').toLowerCase()}`}
                                >
                                  <option value="new">New</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                                {updatingId === enq.id && <RefreshCw size={12} className="spin-icon status-spin" />}
                              </div>
                            </td>
                            <td className="admin-td-date">
                              <div className="date-display">
                                <Calendar size={13} className="text-muted" />
                                <span>{enq.created_at ? new Date(enq.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                              </div>
                              <small className="time-display">{enq.created_at ? new Date(enq.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════ USERS / CUSTOMERS TAB ════════════════════ */}
            {activeTab === 'users' && (
              <div className="admin-users-view">
                <div className="admin-dash-header">
                  <div className="admin-title-group">
                    <h2 className="admin-section-heading font-royal">Customer Directory</h2>
                    <span className="admin-section-subtext">All verified accounts registered through MOHERA</span>
                  </div>

                  <div className="admin-controls">
                    <div className="admin-search-box">
                      <Search size={15} className="admin-search-icon" />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={fetchDashboardData}
                      disabled={dataLoading}
                      className="admin-refresh-btn"
                      title="Refresh registered users"
                    >
                      <RefreshCw size={16} className={dataLoading ? 'spin-icon' : ''} />
                    </button>
                  </div>
                </div>

                {dataError && (
                  <div className="admin-alert-error" role="alert">
                    <AlertCircle size={15} /><span>{dataError}</span>
                  </div>
                )}

                <div className="admin-table-card">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th className="font-royal">ID</th>
                          <th className="font-royal">Customer</th>
                          <th className="font-royal">Email</th>
                          <th className="font-royal">Phone</th>
                          <th className="font-royal">Registered Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataLoading && !users.length ? (
                          <tr><td colSpan="5" className="admin-td-empty"><RefreshCw size={18} className="spin-icon" /> Loading registered users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr><td colSpan="5" className="admin-td-empty">No customers found.</td></tr>
                        ) : filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td className="admin-td-id">#{u.id}</td>
                            <td><span className="customer-name-bold">{u.name}</span></td>
                            <td className="admin-td-email">{u.email}</td>
                            <td className="admin-td-phone">{u.phone}</td>
                            <td className="admin-td-date">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
