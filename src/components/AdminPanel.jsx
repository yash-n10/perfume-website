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
  Download,
  Calendar,
  CheckCircle2,
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
} from 'lucide-react';
import { api } from '../api';
import logo from '/logo_white.png';
import './AdminPanel.css';

const ADMIN_TOKEN_KEY = 'mohera_admin_token';
const ADMIN_USER_KEY = 'mohera_admin_username';

// ─── nav sections ────────────────────────────────────────────────────────────
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
  const [activeTab,    setActiveTab]    = useState('enquiries');
  const [users,        setUsers]        = useState([]);
  const [enquiries,    setEnquiries]    = useState([]);
  const [products,     setProducts]     = useState([]);
  const [dataLoading,  setDataLoading]  = useState(false);
  const [dataError,    setDataError]    = useState('');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId,   setUpdatingId]   = useState(null);

  // Product form
  const [productForm,    setProductForm]    = useState({ ...EMPTY_PRODUCT });
  const [productSaving,  setProductSaving]  = useState(false);
  const [productError,   setProductError]   = useState('');
  const [productSuccess, setProductSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // null = adding new

  // Order form
  const [orderForm,    setOrderForm]    = useState({ ...EMPTY_ORDER, items: [{ ...EMPTY_ORDER_ITEM }] });
  const [orderSaving,  setOrderSaving]  = useState(false);
  const [orderError,   setOrderError]   = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

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
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return p.product_name?.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t);
  });

  // ─── product form handlers ────────────────────────────────────────────────
  const handleProductSave = async (e) => {
    e.preventDefault();
    setProductError(''); setProductSuccess('');
    if (!productForm.product_name.trim()) { setProductError('Product name is required.'); return; }
    if (!productForm.price || isNaN(productForm.price)) { setProductError('Valid price is required.'); return; }

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
        setProductSuccess('Product updated successfully!');
      } else {
        result = await api.createProduct(token, payload);
        setProducts(prev => [result, ...prev]);
        setProductSuccess('Product added successfully!');
      }
      setProductForm({ ...EMPTY_PRODUCT });
      setEditingProduct(null);
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
    setProductError(''); setProductSuccess('');
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
        email: orderForm.email.trim() || 'noemail@mohera.com',
        address: orderForm.address.trim(),
        order_type: orderForm.order_type,
        total_price: parseFloat(orderTotal),
        payment_mode: orderForm.payment_mode,
        payment_status: orderForm.payment_status,
        paid_status: parseInt(orderForm.paid_status),
        items: orderForm.items.map(i => ({
          product_name: i.product_name.trim(),
          quantity: parseInt(i.quantity) || 1,
          unit_price: parseFloat(i.unit_price) || 0,
          total_price: parseFloat(i.total_price) || 0,
        })),
      };
      const result = await api.createOrder(payload);
      setOrderSuccess(`Order #${result.id} created successfully for ${result.customer_name}!`);
      setOrderForm({ ...EMPTY_ORDER, items: [{ ...EMPTY_ORDER_ITEM }] });
    } catch (err) {
      setOrderError(err.message || 'Failed to create order.');
    } finally {
      setOrderSaving(false);
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-page-container">
      <div className="admin-bg-orb orb-top" aria-hidden="true" />
      <div className="admin-bg-orb orb-bottom" aria-hidden="true" />

      {/* ── Header ── */}
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

      {/* ── Main ── */}
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
          /* ── DASHBOARD ── */
          <div className="admin-dashboard-layout">

            {/* ── Sidebar Nav ── */}
            <nav className="admin-sidebar">
              <p className="admin-sidebar-label font-royal">Navigation</p>
              {NAV_ITEMS.map(({ key, label, Icon }) => (
                <button key={key} type="button"
                  className={`admin-nav-btn font-royal ${activeTab === key ? 'active' : ''}`}
                  onClick={() => { setActiveTab(key); setSearchTerm(''); setDataError(''); }}>
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* ── Content Area ── */}
            <div className="admin-content-area">

              {/* ── KPI ribbon (enquiries only) ── */}
              {activeTab === 'enquiries' && (
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
              )}

              {/* ── Section header / controls ── */}
              {(activeTab === 'enquiries' || activeTab === 'users' || activeTab === 'products') && (
                <div className="admin-dash-header">
                  <h2 className="admin-section-title font-royal">
                    {activeTab === 'enquiries' && 'Enquiries Report'}
                    {activeTab === 'users'     && 'Registered Customers'}
                    {activeTab === 'products'  && 'Product Catalogue'}
                  </h2>

                  <div className="admin-controls">
                    <div className="admin-search-box">
                      <Search size={14} className="admin-input-icon" />
                      <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder={activeTab === 'users' ? 'Search customers...' : activeTab === 'products' ? 'Search products...' : 'Search enquiries...'}
                        className="admin-search-input" />
                      {searchTerm && <button type="button" className="admin-search-clear" onClick={() => setSearchTerm('')}>×</button>}
                    </div>

                    {activeTab === 'enquiries' && (
                      <>
                        <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                          <option value="">All Statuses</option>
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button type="button" onClick={exportToCSV} disabled={!enquiries.length}
                          className="admin-export-btn font-royal" title="Download CSV Report">
                          <Download size={14} /><span>Export CSV</span>
                        </button>
                      </>
                    )}

                    <button type="button" onClick={fetchDashboardData} disabled={dataLoading}
                      className="admin-refresh-btn font-royal" title="Refresh">
                      <RefreshCw size={14} className={dataLoading ? 'spin-icon' : ''} /><span>Refresh</span>
                    </button>
                  </div>
                </div>
              )}

              {dataError && (
                <div className="admin-alert-error" role="alert">
                  <AlertCircle size={16} /><span>{dataError}</span>
                </div>
              )}

              {/* ════════════════════ ENQUIRIES TAB ════════════════════ */}
              {activeTab === 'enquiries' && (
                <div className="admin-table-card">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th className="font-royal">ID</th>
                          <th className="font-royal">Customer</th>
                          <th className="font-royal">Contact Details</th>
                          <th className="font-royal">Enquiry Message</th>
                          <th className="font-royal">Status / Action</th>
                          <th className="font-royal">Date Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataLoading && !enquiries.length ? (
                          <tr><td colSpan="6" className="admin-td-empty"><RefreshCw size={18} className="spin-icon" /> Loading...</td></tr>
                        ) : filteredEnquiries.length === 0 ? (
                          <tr><td colSpan="6" className="admin-td-empty">No enquiries found.</td></tr>
                        ) : filteredEnquiries.map(enq => {
                          const cs = (enq.status || 'new').toLowerCase();
                          return (
                            <tr key={enq.id}>
                              <td className="admin-td-id">#{enq.id}</td>
                              <td className="admin-td-name"><span className="customer-name-bold">{enq.name}</span></td>
                              <td className="admin-td-contact">
                                <a href={`mailto:${enq.email}`} className="contact-link"><Mail size={12} /><span>{enq.email}</span></a>
                                <a href={`tel:${enq.phone}`} className="contact-link sub-contact"><Phone size={12} /><span>{enq.phone}</span></a>
                              </td>
                              <td className="admin-td-message"><div className="admin-enquiry-box"><p>{enq.enquiry}</p></div></td>
                              <td className="admin-td-status">
                                <div className="status-action-wrapper">
                                  <select className={`status-select status-select-${cs}`} value={cs}
                                    disabled={updatingId === enq.id} onChange={e => handleStatusChange(enq.id, e.target.value)}>
                                    <option value="new">New</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                  </select>
                                  {updatingId === enq.id && <RefreshCw size={12} className="spin-icon status-spinner" />}
                                </div>
                              </td>
                              <td className="admin-td-date">
                                <div className="date-display">
                                  <Calendar size={12} className="date-icon" />
                                  <span>{enq.created_at ? new Date(enq.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                                </div>
                                <small className="time-display">{enq.created_at ? new Date(enq.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════════════════════ USERS TAB ════════════════════ */}
              {activeTab === 'users' && (
                <div className="admin-table-card">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th className="font-royal">ID</th>
                          <th className="font-royal">Name</th>
                          <th className="font-royal">Email</th>
                          <th className="font-royal">Phone</th>
                          <th className="font-royal">Registered Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataLoading && !users.length ? (
                          <tr><td colSpan="5" className="admin-td-empty"><RefreshCw size={18} className="spin-icon" /> Loading...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr><td colSpan="5" className="admin-td-empty">No registered customers found.</td></tr>
                        ) : filteredUsers.map(user => (
                          <tr key={user.id}>
                            <td className="admin-td-id">#{user.id}</td>
                            <td className="admin-td-name">{user.name}</td>
                            <td className="admin-td-email">{user.email}</td>
                            <td className="admin-td-phone">{user.phone}</td>
                            <td className="admin-td-date">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════════════════════ PRODUCTS TAB ════════════════════ */}
              {activeTab === 'products' && (
                <div className="admin-products-layout">

                  {/* Add / Edit Product Form */}
                  <div className="admin-form-card">
                    <h3 className="admin-form-card-title font-royal">
                      {editingProduct ? <><Package size={16} /> Edit Product</> : <><Plus size={16} /> Add New Product</>}
                    </h3>

                    {productError   && <div className="admin-alert-error"  role="alert"><AlertCircle size={14} /><span>{productError}</span></div>}
                    {productSuccess && <div className="admin-alert-success" role="status"><CheckCircle2 size={14} /><span>{productSuccess}</span></div>}

                    <form onSubmit={handleProductSave} className="admin-product-form">
                      <div className="admin-field-group">
                        <label className="admin-field-label font-royal">Product Name *</label>
                        <input type="text" className="admin-plain-input" placeholder="e.g. MOHERA Oud Royale 50ml"
                          value={productForm.product_name} onChange={e => setProductForm(p => ({ ...p, product_name: e.target.value }))} required />
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Price (₹) *</label>
                          <div className="admin-input-box">
                            <IndianRupee size={14} className="admin-input-icon" />
                            <input type="number" step="0.01" min="0" className="admin-input admin-input-pl"
                              placeholder="0.00" value={productForm.price}
                              onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} required />
                          </div>
                        </div>
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Status</label>
                          <select className="admin-select w-full" value={productForm.status}
                            onChange={e => setProductForm(p => ({ ...p, status: e.target.value }))}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label font-royal">Image URL</label>
                        <div className="admin-input-box">
                          <ImageIcon size={14} className="admin-input-icon" />
                          <input type="url" className="admin-input admin-input-pl" placeholder="https://..."
                            value={productForm.image} onChange={e => setProductForm(p => ({ ...p, image: e.target.value }))} />
                        </div>
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label font-royal">Description</label>
                        <textarea className="admin-textarea" rows={3} placeholder="Product description..."
                          value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
                      </div>

                      <div className="admin-form-actions">
                        <button type="submit" disabled={productSaving} className="admin-submit-btn font-royal">
                          {productSaving
                            ? <span className="admin-btn-content"><RefreshCw size={14} className="spin-icon" /> Saving...</span>
                            : editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                        {editingProduct && (
                          <button type="button" className="admin-cancel-btn font-royal"
                            onClick={() => { setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setProductError(''); setProductSuccess(''); }}>
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Products List Table */}
                  <div className="admin-table-card">
                    <div className="admin-table-responsive">
                      <table className="admin-data-table">
                        <thead>
                          <tr>
                            <th className="font-royal">ID</th>
                            <th className="font-royal">Image</th>
                            <th className="font-royal">Product Name</th>
                            <th className="font-royal">Price</th>
                            <th className="font-royal">Status</th>
                            <th className="font-royal">Added On</th>
                            <th className="font-royal">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataLoading && !products.length ? (
                            <tr><td colSpan="7" className="admin-td-empty"><RefreshCw size={18} className="spin-icon" /> Loading products...</td></tr>
                          ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="7" className="admin-td-empty">No products found. Add your first product above.</td></tr>
                          ) : filteredProducts.map(product => (
                            <tr key={product.id}>
                              <td className="admin-td-id">#{product.id}</td>
                              <td>
                                {product.image
                                  ? <img src={product.image} alt={product.product_name} className="product-thumb" onError={e => { e.target.style.display = 'none'; }} />
                                  : <div className="product-thumb-placeholder"><ImageIcon size={18} /></div>}
                              </td>
                              <td>
                                <span className="customer-name-bold">{product.product_name}</span>
                                {product.description && <small className="product-desc-preview">{product.description.slice(0, 60)}{product.description.length > 60 ? '…' : ''}</small>}
                              </td>
                              <td className="product-price-cell">₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td>
                                <span className={`product-status-badge ${product.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                  {product.status}
                                </span>
                              </td>
                              <td className="admin-td-date">
                                {product.add_time ? new Date(product.add_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                              </td>
                              <td>
                                <div className="product-actions">
                                  <button type="button" className="product-edit-btn font-royal" onClick={() => handleEditProduct(product)} title="Edit">Edit</button>
                                  <button type="button" className="product-delete-btn" onClick={() => handleDeleteProduct(product.id)} title="Delete"><Trash2 size={14} /></button>
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
                  <div className="admin-form-card admin-order-card">
                    <h2 className="admin-form-card-title font-royal"><ShoppingCart size={18} /> Create New Order</h2>

                    {orderError   && <div className="admin-alert-error"  role="alert"><AlertCircle size={14} /><span>{orderError}</span></div>}
                    {orderSuccess && <div className="admin-alert-success" role="status"><CheckCircle2 size={14} /><span>{orderSuccess}</span></div>}

                    <form onSubmit={handleOrderSubmit} className="admin-order-form">
                      {/* Customer Info */}
                      <fieldset className="order-fieldset">
                        <legend className="font-royal order-legend">Customer Details</legend>
                        <div className="admin-form-row">
                          <div className="admin-field-group">
                            <label className="admin-field-label font-royal">Customer Name *</label>
                            <input type="text" className="admin-plain-input" placeholder="Full Name"
                              value={orderForm.customer_name} onChange={e => setOrderForm(p => ({ ...p, customer_name: e.target.value }))} required />
                          </div>
                          <div className="admin-field-group">
                            <label className="admin-field-label font-royal">Phone *</label>
                            <input type="tel" className="admin-plain-input" placeholder="10-digit number"
                              value={orderForm.phone} onChange={e => setOrderForm(p => ({ ...p, phone: e.target.value }))} required />
                          </div>
                        </div>
                        <div className="admin-form-row">
                          <div className="admin-field-group">
                            <label className="admin-field-label font-royal">Email</label>
                            <input type="email" className="admin-plain-input" placeholder="customer@email.com"
                              value={orderForm.email} onChange={e => setOrderForm(p => ({ ...p, email: e.target.value }))} />
                          </div>
                          <div className="admin-field-group">
                            <label className="admin-field-label font-royal">Order Type</label>
                            <select className="admin-select w-full" value={orderForm.order_type} onChange={e => setOrderForm(p => ({ ...p, order_type: e.target.value }))}>
                              <option value="offline">Offline (Walk-in)</option>
                              <option value="online">Online</option>
                            </select>
                          </div>
                        </div>
                        <div className="admin-field-group">
                          <label className="admin-field-label font-royal">Address *</label>
                          <textarea className="admin-textarea" rows={2} placeholder="Shipping / Billing address"
                            value={orderForm.address} onChange={e => setOrderForm(p => ({ ...p, address: e.target.value }))} required />
                        </div>
                      </fieldset>

                      {/* Order Items */}
                      <fieldset className="order-fieldset">
                        <legend className="font-royal order-legend">Order Items</legend>
                        {orderForm.items.map((item, index) => (
                          <div key={index} className="order-item-row">
                            <div className="admin-field-group order-item-name">
                              <label className="admin-field-label font-royal">Product Name *</label>
                              <input type="text" className="admin-plain-input" placeholder="Product name"
                                value={item.product_name} onChange={e => updateOrderItem(index, 'product_name', e.target.value)} required />
                            </div>
                            <div className="admin-field-group order-item-qty">
                              <label className="admin-field-label font-royal">Qty</label>
                              <input type="number" min="1" className="admin-plain-input"
                                value={item.quantity} onChange={e => updateOrderItem(index, 'quantity', e.target.value)} />
                            </div>
                            <div className="admin-field-group order-item-price">
                              <label className="admin-field-label font-royal">Unit Price (₹)</label>
                              <input type="number" step="0.01" min="0" className="admin-plain-input" placeholder="0.00"
                                value={item.unit_price} onChange={e => updateOrderItem(index, 'unit_price', e.target.value)} required />
                            </div>
                            <div className="admin-field-group order-item-total">
                              <label className="admin-field-label font-royal">Total</label>
                              <div className="order-item-total-val">₹{Number(item.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                            </div>
                            {orderForm.items.length > 1 && (
                              <button type="button" className="order-remove-btn" onClick={() => removeOrderItem(index)} title="Remove item">
                                <MinusCircle size={18} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" className="order-add-item-btn font-royal" onClick={addOrderItem}>
                          <PlusCircle size={15} /> Add Item
                        </button>
                        <div className="order-grand-total font-royal">
                          Grand Total: <span>₹{Number(orderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </fieldset>

                      {/* Payment */}
                      <fieldset className="order-fieldset">
                        <legend className="font-royal order-legend">Payment Details</legend>
                        <div className="admin-form-row">
                          <div className="admin-field-group">
                            <label className="admin-field-label font-royal">Payment Mode</label>
                            <select className="admin-select w-full" value={orderForm.payment_mode} onChange={e => setOrderForm(p => ({ ...p, payment_mode: e.target.value }))}>
                              <option value="Cash">Cash</option>
                              <option value="UPI">UPI</option>
                              <option value="Card">Card (Debit/Credit)</option>
                              <option value="NetBanking">Net Banking</option>
                              <option value="Cheque">Cheque</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="admin-field-group">
                            <label className="admin-field-label font-royal">Payment Status</label>
                            <select className="admin-select w-full" value={orderForm.payment_status} onChange={e => setOrderForm(p => ({ ...p, payment_status: e.target.value }))}>
                              <option value="success">Success</option>
                              <option value="pending">Pending</option>
                              <option value="failed">Failed</option>
                              <option value="cancel">Cancelled</option>
                            </select>
                          </div>
                          <div className="admin-field-group">
                            <label className="admin-field-label font-royal">Paid Status</label>
                            <select className="admin-select w-full" value={orderForm.paid_status} onChange={e => setOrderForm(p => ({ ...p, paid_status: e.target.value }))}>
                              <option value={1}>Paid</option>
                              <option value={0}>Unpaid</option>
                            </select>
                          </div>
                        </div>
                      </fieldset>

                      <button type="submit" disabled={orderSaving} className="admin-submit-btn font-royal order-submit-btn">
                        {orderSaving
                          ? <span className="admin-btn-content"><RefreshCw size={16} className="spin-icon" /> Placing Order...</span>
                          : <span className="admin-btn-content"><ShoppingCart size={16} /> Place Order</span>}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
