const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('travelease_token') || localStorage.getItem('travelgo_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => apiFetch('/auth/me'),
  updateProfile: (profileData) => apiFetch('/auth/me', { method: 'PUT', body: JSON.stringify(profileData) })
};

// Destinations API
export const destinationsAPI = {
  getAll: (search = '') => apiFetch(`/destinations${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => apiFetch(`/destinations/${id}`),
  create: (data) => apiFetch('/destinations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/destinations/${id}`, { method: 'DELETE' })
};

// Packages API
export const packagesAPI = {
  getAll: (destination_id = '') => apiFetch(`/packages${destination_id ? `?destination_id=${destination_id}` : ''}`),
  getById: (id) => apiFetch(`/packages/${id}`),
  create: (data) => apiFetch('/packages', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/packages/${id}`, { method: 'DELETE' })
};

// Hotels API
export const hotelsAPI = {
  getAll: (destination_id = '') => apiFetch(`/hotels${destination_id ? `?destination_id=${destination_id}` : ''}`),
  getById: (id) => apiFetch(`/hotels/${id}`),
  create: (data) => apiFetch('/hotels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/hotels/${id}`, { method: 'DELETE' })
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => apiFetch('/bookings/my-bookings'),
  getById: (id) => apiFetch(`/bookings/${id}`),
  cancel: (id) => apiFetch(`/bookings/${id}/cancel`, { method: 'PUT' })
};

// Admin API
export const adminAPI = {
  getStats: () => apiFetch('/admin/stats'),
  getAllBookings: () => apiFetch('/admin/bookings'),
  getAllUsers: () => apiFetch('/admin/users')
};
