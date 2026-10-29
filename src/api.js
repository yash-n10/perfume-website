export const API_BASE_URL = (
    import.meta.env.BASE_URL && import.meta.env.BASE_URL.startsWith('http')
        ? import.meta.env.BASE_URL
        : import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

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
};