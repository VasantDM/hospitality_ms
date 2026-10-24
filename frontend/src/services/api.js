import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gv_pms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const roomsAPI = {
  getCategories: () => api.get('/rooms/categories'),
  getCategory: (id) => api.get(`/rooms/categories/${id}`),
  createCategory: (data) => api.post('/rooms/categories', data),
  updateCategory: (id, data) => api.patch(`/rooms/categories/${id}`, data),
  getRooms: (params) => api.get('/rooms', { params }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.patch(`/rooms/${id}`, data),
};

export const reservationsAPI = {
  getReservations: (params) => api.get('/reservations', { params }),
  getReservation: (id) => api.get(`/reservations/${id}`),
  createReservation: (data) => api.post('/reservations', data),
  checkIn: (id) => api.post(`/reservations/${id}/check-in`),
  checkOut: (id) => api.post(`/reservations/${id}/check-out`),
};

export const restaurantAPI = {
  getTables: (params) => api.get('/restaurant/tables', { params }),
  updateTableStatus: (id, status) => api.patch(`/restaurant/tables/${id}/status?status=${status}`),
  getCategories: () => api.get('/restaurant/categories'),
  getMenu: (params) => api.get('/restaurant/menu', { params }),
  getOrders: (params) => api.get('/restaurant/orders', { params }),
  createOrder: (data) => api.post('/restaurant/orders', data),
  updateOrderStatus: (id, status) => api.patch(`/restaurant/orders/${id}/status?status=${status}`),
};

export const foliosAPI = {
  getFolio: (id) => api.get(`/folios/${id}`),
  getFolioByReservation: (resId) => api.get(`/folios/by-reservation/${resId}`),
  addCharge: (folioId, data) => api.post(`/folios/${folioId}/items`, data),
  addPayment: (folioId, data) => api.post(`/folios/${folioId}/payments`, data),
};

export const housekeepingAPI = {
  getTasks: (params) => api.get('/housekeeping/tasks', { params }),
  createTask: (data) => api.post('/housekeeping/tasks', data),
  updateTask: (id, data) => api.patch(`/housekeeping/tasks/${id}`, data),
  getMaintenance: (params) => api.get('/housekeeping/maintenance', { params }),
  createMaintenance: (data) => api.post('/housekeeping/maintenance', data),
  updateMaintenance: (id, data) => api.patch(`/housekeeping/maintenance/${id}`, data),
};

export const analyticsAPI = {
  getKPIs: () => api.get('/analytics/kpis'),
  getRevenueTrends: () => api.get('/analytics/revenue-trends'),
};

export default api;
