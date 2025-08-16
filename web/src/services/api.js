import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Emergency API
export const emergencyAPI = {
  getAll: (params) => api.get('/emergency/requests', { params }),
  getById: (id) => api.get(`/emergency/request/${id}`),
  updateStatus: (id, status) => api.put(`/emergency/request/${id}/status`, { status }),
  getLocations: () => api.get('/emergency/locations'),
  getTimeSlots: () => api.get('/emergency/time-slots'),
  getStatistics: () => api.get('/emergency/statistics'),
};

// Relief API
export const reliefAPI = {
  getAll: (params) => api.get('/relief/requests', { params }),
  getById: (id) => api.get(`/relief/request/${id}`),
  updateStatus: (id, status) => api.put(`/relief/request/${id}/status`, { status }),
  getTypes: () => api.get('/relief/types'),
  getStatistics: () => api.get('/relief/statistics'),
};

// Volunteer API
export const volunteerAPI = {
  getAll: (params) => api.get('/volunteer/search', { params }),
  getById: (id) => api.get(`/volunteer/profile/${id}`),
  updateStatus: (id, status, notes) => api.put(`/volunteer/${id}/status`, { status, notes }),
  getAvailable: (params) => api.get('/volunteer/available', { params }),
  getShifts: () => api.get('/volunteer/shifts'),
  getTasks: () => api.get('/volunteer/tasks'),
  getStatistics: () => api.get('/volunteer/statistics'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStatistics: () => api.get('/admin/statistics'),
  getSystemStats: () => api.get('/admin/system-stats'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
};

// Map API
export const mapAPI = {
  getLocations: () => api.get('/emergency/locations'),
  addLocation: (location) => api.post('/emergency/locations', location),
  updateLocation: (id, location) => api.put(`/emergency/locations/${id}`, location),
  deleteLocation: (id) => api.delete(`/emergency/locations/${id}`),
  getMapData: () => api.get('/admin/map-data'),
};

export default api;
