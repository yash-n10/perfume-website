import { BACKEND_URL } from './config';

export const API_BASE_URL = BACKEND_URL.replace(/\/$/, '');


const AUTH_TOKEN_KEY = 'mohera_access_token';

export function getAccessToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAccessToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAccessToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request(path, { method = 'GET', body, authenticated = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = authenticated ? getAccessToken() : null;

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const detail = data?.detail;
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(' ')
            : detail || 'The request could not be completed.';
        throw new Error(message);
    }

    return data;
}

export const api = {
    health: () => request('/api/health'),
    sendOtp: (email) => request('/api/auth/send-otp', { method: 'POST', body: { email } }),
    verifyOtp: (email, code) => request('/api/auth/verify-otp', { method: 'POST', body: { email, code } }),
    signup: (details) => request('/api/auth/signup', { method: 'POST', body: details }),
    login: (credentials) => request('/api/auth/login', { method: 'POST', body: credentials }),
    currentUser: () => request('/api/auth/me', { authenticated: true }),
    createEnquiry: (details) => request('/api/enquiries', { method: 'POST', body: details }),

    // Admin APIs
    adminLogin: (credentials) => request('/api/admin/login', { method: 'POST', body: credentials }),
    getAdminUsers: (token, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/admin/users${query ? `?${query}` : ''}`, { headers }).then(r => r.json());
    },
    getAdminEnquiryReport: (token, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/admin/enquiries/report${query ? `?${query}` : ''}`, { headers }).then(r => r.json());
    },
    updateAdminEnquiryStatus: (token, enquiryId, status) => {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/admin/enquiries/${enquiryId}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status }),
        }).then(r => r.json());
    },

    // Products APIs
    listProducts: (status = null) => {
        const query = status ? `?status=${status}` : '';
        return request(`/api/products${query}`);
    },
    createProduct: (token, payload) => {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        }).then(r => r.json());
    },
    updateProduct: (token, productId, payload) => {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload),
        }).then(r => r.json());
    },
    deleteProduct: (token, productId) => {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers,
        }).then(r => r.status === 204 ? true : r.json());
    },

    // Orders APIs
    createOrder: (payload) => request('/api/orders', { method: 'POST', body: payload }),
    listOrders: (token, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/orders${query ? `?${query}` : ''}`, { headers }).then(r => r.json());
    },
    updateOrderStatus: (token, orderId, payload) => {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload),
        }).then(r => r.json());
    },
    getOrder: (token, orderId) => {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        return fetch(`${API_BASE_URL}/api/orders/${orderId}`, { headers }).then(r => r.json());
    },

    // Cart APIs
    getCart: () => request('/api/cart', { authenticated: true }),
    addToCart: (productId, quantity = 1) => request('/api/cart', {
        method: 'POST',
        body: { product_id: productId, quantity },
        authenticated: true,
    }),
    updateCartItem: (itemId, quantity) => request(`/api/cart/${itemId}`, {
        method: 'PATCH',
        body: { quantity },
        authenticated: true,
    }),
    removeCartItem: (itemId) => request(`/api/cart/${itemId}`, {
        method: 'DELETE',
        authenticated: true,
    }),
    clearCart: () => request('/api/cart', {
        method: 'DELETE',
        authenticated: true,
    }),
    getCartCount: () => request('/api/cart/count', { authenticated: true }),
    syncCart: (items) => request('/api/cart/sync', {
        method: 'POST',
        body: { items },
        authenticated: true,
    }),

    // Addresses APIs
    getAddresses: () => request('/api/addresses', { authenticated: true }),
    addAddress: (addressData) => request('/api/addresses', {
        method: 'POST',
        body: addressData,
        authenticated: true,
    }),
    updateAddress: (addressId, addressData) => request(`/api/addresses/${addressId}`, {
        method: 'PATCH',
        body: addressData,
        authenticated: true,
    }),
    deleteAddress: (addressId) => request(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        authenticated: true,
    }),
    setDefaultAddress: (addressId) => request(`/api/addresses/${addressId}/default`, {
        method: 'PATCH',
        authenticated: true,
    }),

    // Authenticated Checkout & User Orders
    checkout: (payload) => request('/api/orders/checkout', {
        method: 'POST',
        body: payload,
        authenticated: true,
    }),
    guestCheckout: (payload) => request('/api/orders/guest-checkout', {
        method: 'POST',
        body: payload,
    }),
    getMyOrders: () => request('/api/orders/my-orders', { authenticated: true }),
    getMyOrder: (orderId) => request(`/api/orders/my-orders/${orderId}`, { authenticated: true }),

    // Order Reviews APIs
    createOrderReview: (orderId, reviewData) => request(`/api/orders/${orderId}/reviews`, {
        method: 'POST',
        body: reviewData,
        authenticated: true,
    }),
    getOrderReviews: (orderId) => request(`/api/orders/${orderId}/reviews`, { authenticated: true }),
    getMyReviews: () => request('/api/orders/reviews/my', { authenticated: true }),
};
