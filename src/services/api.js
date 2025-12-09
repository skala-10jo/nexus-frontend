import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const PYTHON_API_URL = 'http://localhost:8000/api/ai';

// Create axios instance for Java backend
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for Python backend
export const pythonAPI = axios.create({
  baseURL: PYTHON_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token (Java API)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token (Python API)
pythonAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (Java API)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (Python API)
pythonAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

// User API
export const userAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  uploadAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updatePreferredLanguage: (id, language) => api.patch(`/users/${id}/preferred-language`, { language })
};

// Schedule API
export const scheduleAPI = {
  getAllSchedules: () => api.get('/schedules'),
  getSchedulesByDateRange: (start, end) =>
    api.get('/schedules/range', { params: { start, end } }),
  getUpcomingSchedules: () => api.get('/schedules/upcoming'),
  getScheduleById: (id) => api.get(`/schedules/${id}`),
  createSchedule: (data) => api.post('/schedules', data),
  updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`)
};

// Schedule Category API
export const scheduleCategoryAPI = {
  getCategories: () => api.get('/schedule-categories'),
  createCategory: (data) => api.post('/schedule-categories', data),
  updateCategory: (id, data) => api.put(`/schedule-categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/schedule-categories/${id}`),
  reorderCategories: (orders) => api.patch('/schedule-categories/reorder', orders)
};

export default api;
