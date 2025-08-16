import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
  updateProfilePicture: (pictureData: any) => api.put('/auth/profile/picture', pictureData),
};

// Emergency API calls
export const emergencyAPI = {
  createRequest: (requestData: any) => api.post('/emergency/requests', requestData),
  getRequests: (params?: any) => api.get('/emergency/requests', { params }),
  getRequestById: (id: string) => api.get(`/emergency/requests/${id}`),
  updateRequest: (id: string, updateData: any) => api.put(`/emergency/requests/${id}`, updateData),
  cancelRequest: (id: string) => api.delete(`/emergency/requests/${id}`),
  
  // Locations
  getLocations: (params?: any) => api.get('/emergency/locations', { params }),
  getLocationById: (id: string) => api.get(`/emergency/locations/${id}`),
  getLocationsByType: (type: string) => api.get(`/emergency/locations/type/${type}`),
  getAvailableLocations: () => api.get('/emergency/locations/available'),
  
  // Time slots
  getTimeSlots: (params?: any) => api.get('/emergency/timeslots', { params }),
  getTimeSlotsByDate: (date: string) => api.get(`/emergency/timeslots/date/${date}`),
  getAvailableTimeSlots: () => api.get('/emergency/timeslots/available'),
  bookTimeSlot: (slotId: string, bookingData: any) => api.post(`/emergency/timeslots/${slotId}/book`, bookingData),
  cancelTimeSlotBooking: (slotId: string) => api.delete(`/emergency/timeslots/${slotId}/book`),
};

// Relief API calls
export const reliefAPI = {
  createRequest: (requestData: any) => api.post('/relief/requests', requestData),
  getRequests: (params?: any) => api.get('/relief/requests', { params }),
  getRequestById: (id: string) => api.get(`/relief/requests/${id}`),
  updateRequest: (id: string, updateData: any) => api.put(`/relief/requests/${id}`, updateData),
  cancelRequest: (id: string) => api.delete(`/relief/requests/${id}`),
};

// Volunteer API calls
export const volunteerAPI = {
  register: (volunteerData: any) => api.post('/volunteer/register', volunteerData),
  getVolunteers: (params?: any) => api.get('/volunteer/volunteers', { params }),
  getVolunteerById: (id: string) => api.get(`/volunteer/volunteers/${id}`),
  updateVolunteer: (id: string, updateData: any) => api.put(`/volunteer/volunteers/${id}`, updateData),
  deleteVolunteer: (id: string) => api.delete(`/volunteer/volunteers/${id}`),
  updateAvailability: (id: string, availabilityData: any) => api.put(`/volunteer/volunteers/${id}/availability`, availabilityData),
  addTask: (id: string, taskData: any) => api.post(`/volunteer/volunteers/${id}/tasks`, taskData),
  removeTask: (id: string, taskId: string) => api.delete(`/volunteer/volunteers/${id}/tasks/${taskId}`),
};

// Notifications API calls
export const notificationAPI = {
  getNotifications: () => api.get('/auth/notifications'),
  markAsRead: (id: string) => api.put(`/auth/notifications/${id}/read`),
  markAllAsRead: () => api.put('/auth/notifications/read-all'),
  getUnreadCount: () => api.get('/auth/notifications/unread-count'),
};

// History API calls
export const historyAPI = {
  getEmergencyHistory: () => api.get('/auth/history/emergency'),
  getReliefHistory: () => api.get('/auth/history/relief'),
  getVolunteerHistory: () => api.get('/auth/history/volunteer'),
  getRecentActivity: () => api.get('/auth/history/recent'),
};

// Statistics API calls
export const statisticsAPI = {
  getEmergencyStats: () => api.get('/emergency/statistics'),
  getReliefStats: () => api.get('/relief/statistics'),
  getVolunteerStats: () => api.get('/volunteer/statistics'),
  getLocationStats: () => api.get('/emergency/locations/statistics'),
  getTimeSlotStats: () => api.get('/emergency/timeslots/statistics'),
};

// Storage utilities
export const storage = {
  setToken: (token: string) => AsyncStorage.setItem('authToken', token),
  getToken: () => AsyncStorage.getItem('authToken'),
  removeToken: () => AsyncStorage.removeItem('authToken'),
  setUser: (user: any) => AsyncStorage.setItem('user', JSON.stringify(user)),
  getUser: () => AsyncStorage.getItem('user').then(user => user ? JSON.parse(user) : null),
  removeUser: () => AsyncStorage.removeItem('user'),
  clearAll: () => AsyncStorage.clear(),
};

export default api;
