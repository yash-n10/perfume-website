import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  MessageSquare,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Search,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import logo from '/logo_white.png';
import './AdminPanel.css';

const ADMIN_TOKEN_KEY = 'mohera_admin_token';
const ADMIN_USER_KEY = 'mohera_admin_username';

export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem(ADMIN_USER_KEY) || '');

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'enquiries'
  const [users, setUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleLogout = useCallback(() => {
    setToken('');
    setAdminUsername('');
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setUsers([]);
    setEnquiries([]);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    setDataError('');

    try {
      if (activeTab === 'users') {
        const data = await api.getAdminUsers(token);
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && data.detail) {
          throw new Error(data.detail);
        } else {
          setUsers([]);
        }
      } else {
        const params = statusFilter ? { status: statusFilter } : {};
        const data = await api.getAdminEnquiryReport(token, params);
        if (Array.isArray(data)) {
          setEnquiries(data);
        } else if (data && data.detail) {
          throw new Error(data.detail);
        } else {
          setEnquiries([]);
        }
      }
    } catch (err) {
      if (err.message && (err.message.includes('401') || err.message.toLowerCase().includes('credential') || err.message.toLowerCase().includes('token'))) {
        handleLogout();
        setLoginError('Admin session expired. Please log in again.');
      } else {
        setDataError(err.message || 'Failed to load data.');
      }
    } finally {
      setDataLoading(false);
    }
  }, [token, activeTab, statusFilter, handleLogout]);

  // When logged in, fetch initial data
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, activeTab, fetchDashboardData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setLoginError('Please enter both admin username and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await api.adminLogin({
        username: usernameInput.trim(),
        password: passwordInput.trim()
      });

      if (response && response.access_token) {
        setToken(response.access_token);
        const resolvedUser = response.username || usernameInput.trim();
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

  // Filtered views
  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term))
    );
  });

  const filteredEnquiries = enquiries.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (e.name && e.name.toLowerCase().includes(term)) ||
      (e.email && e.email.toLowerCase().includes(term)) ||
      (e.phone && e.phone.toLowerCase().includes(term)) ||
      (e.enquiry && e.enquiry.toLowerCase().includes(term))
    );
  });

  return (
    <div className="admin-page-container">
      {/* Background Ambience */}
      <div className="admin-bg-orb orb-top" aria-hidden="true"></div>
      <div className="admin-bg-orb orb-bottom" aria-hidden="true"></div>

      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <a href="/" className="admin-back-link" title="Return to store">
            <ArrowLeft size={16} />
            <span>Storefront</span>
          </a>
          <div className="admin-brand-separator">/</div>
          <div className="admin-brand">
            <img src={logo} alt="MOHERA" className="admin-logo-img" />
            <span className="admin-badge font-royal">ADMIN CONSOLE</span>
          </div>
        </div>

        {token && (
          <div className="admin-header-right">
            <div className="admin-user-info font-royal">
              <ShieldCheck size={14} className="gold-icon" />
              <span>{adminUsername || 'admin'}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-logout-btn font-royal"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        {!token ? (
          /* ============================================================ */
          /* LOGIN FORM                                                    */
          /* ============================================================ */
          <div className="admin-login-wrapper">
            <div className="admin-login-card">
              <div className="admin-card-header">
                <div className="admin-icon-shield">
                  <ShieldCheck size={28} className="gold-icon" />
                </div>
                <h1 className="font-royal admin-login-title">Admin Access</h1>
                <p className="admin-login-subtitle">
                  Secure administration portal for MOHERA Haute Parfumerie
                </p>
              </div>

              {loginError && (
                <div className="admin-alert-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="admin-form">
                <div className="admin-field-group">
                  <label className="admin-field-label font-royal" htmlFor="admin-username">
                    Username
                  </label>
                  <div className="admin-input-box">
                    <UserIcon size={16} className="admin-input-icon" />
                    <input
                      id="admin-username"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="admin"
                      required
                      autoComplete="username"
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label font-royal" htmlFor="admin-password">
                    Password
                  </label>
                  <div className="admin-input-box">
                    <Lock size={16} className="admin-input-icon" />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      className="admin-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="admin-toggle-eye"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="admin-submit-btn font-royal"
                >
                  {loginLoading ? (
                    <span className="admin-btn-content">
                      <RefreshCw size={16} className="spin-icon" /> Authenticating...
                    </span>
                  ) : (
                    'Enter Admin Portal'
                  )}
                </button>
              </form>

              <div className="admin-card-footer">
                <p>Restricted access. All actions are logged and audited.</p>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* DASHBOARD VIEW                                               */
          /* ============================================================ */
          <div className="admin-dashboard-container">
            {/* Navigation Tabs & Controls */}
            <div className="admin-dash-header">
              <div className="admin-tabs">
                <button
                  type="button"
                  className={`admin-tab-btn font-royal ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users size={16} />
                  <span>Users Directory</span>
                  <span className="admin-tab-count">{users.length}</span>
                </button>

                <button
                  type="button"
                  className={`admin-tab-btn font-royal ${activeTab === 'enquiries' ? 'active' : ''}`}
                  onClick={() => setActiveTab('enquiries')}
                >
                  <MessageSquare size={16} />
                  <span>Customer Enquiries</span>
                  <span className="admin-tab-count">{enquiries.length}</span>
                </button>
              </div>

              <div className="admin-controls">
                <div className="admin-search-box">
                  <Search size={14} className="admin-input-icon" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={activeTab === 'users' ? 'Search by name, email, phone...' : 'Search enquiries...'}
                    className="admin-search-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="admin-search-clear"
                      onClick={() => setSearchTerm('')}
                    >
                      ×
                    </button>
                  )}
                </div>

                {activeTab === 'enquiries' && (
                  <select
                    className="admin-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                )}

                <button
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={dataLoading}
                  className="admin-refresh-btn font-royal"
                  title="Refresh records"
                >
                  <RefreshCw size={14} className={dataLoading ? 'spin-icon' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {dataError && (
              <div className="admin-alert-error" role="alert">
                <AlertCircle size={16} />
                <span>{dataError}</span>
              </div>
            )}

            {/* Dashboard Content Table */}
            <div className="admin-table-card">
              {activeTab === 'users' ? (
                /* Users Table */
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
                      {dataLoading && users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="admin-td-empty">
                            <RefreshCw size={18} className="spin-icon" /> Loading registered users...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="admin-td-empty">
                            No registered users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="admin-td-id">#{user.id}</td>
                            <td className="admin-td-name">{user.name}</td>
                            <td className="admin-td-email">{user.email}</td>
                            <td className="admin-td-phone">{user.phone}</td>
                            <td className="admin-td-date">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Enquiries Table */
                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th className="font-royal">ID</th>
                        <th className="font-royal">Customer</th>
                        <th className="font-royal">Contact Info</th>
                        <th className="font-royal">Enquiry / Message</th>
                        <th className="font-royal">Status</th>
                        <th className="font-royal">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataLoading && enquiries.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="admin-td-empty">
                            <RefreshCw size={18} className="spin-icon" /> Loading enquiry reports...
                          </td>
                        </tr>
                      ) : filteredEnquiries.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="admin-td-empty">
                            No enquiries found.
                          </td>
                        </tr>
                      ) : (
                        filteredEnquiries.map((enq) => (
                          <tr key={enq.id}>
                            <td className="admin-td-id">#{enq.id}</td>
                            <td className="admin-td-name">{enq.name}</td>
                            <td className="admin-td-contact">
                              <div>{enq.email}</div>
                              <small className="admin-subtext">{enq.phone}</small>
                            </td>
                            <td className="admin-td-message">
                              <p className="admin-message-bubble">{enq.enquiry}</p>
                            </td>
                            <td className="admin-td-status">
                              <span className={`status-badge status-${(enq.status || 'pending').toLowerCase()}`}>
                                {enq.status || 'pending'}
                              </span>
                            </td>
                            <td className="admin-td-date">
                              {enq.created_at ? new Date(enq.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
