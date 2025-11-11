import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
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

// Slack API
export const slackAPI = {
  // Get OAuth authorization URL
  getAuthUrl: () => api.get('/slack/auth/url'),

  // Handle OAuth callback
  handleCallback: (code, state) => api.post('/slack/auth/callback', { code, state }),

  // Get all integrations
  getIntegrations: () => api.get('/slack/integrations'),

  // Get specific integration
  getIntegration: (integrationId) => api.get(`/slack/integrations/${integrationId}`),

  // Delete integration
  deleteIntegration: (integrationId) => api.delete(`/slack/integrations/${integrationId}`),

  // Get channels for integration
  getChannels: (integrationId) => api.get(`/slack/integrations/${integrationId}/channels`),

  // Send message
  sendMessage: (integrationId, data) => api.post(`/slack/integrations/${integrationId}/send`, data),

  // Get message history
  getMessageHistory: (integrationId, channelId) => api.get(`/slack/integrations/${integrationId}/channels/${channelId}/history`)
};

export default slackAPI;
