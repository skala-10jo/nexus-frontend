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

  // Get integration status (1:1 relationship, no integrationId needed)
  getIntegrationStatus: () => api.get('/slack/status'),

  // Disconnect integration
  disconnectIntegration: () => api.delete('/slack/disconnect'),

  // Get channels (no integrationId needed)
  getChannels: () => api.get('/slack/channels'),

  // Send message (no integrationId needed)
  sendMessage: (data) => api.post('/slack/send', data),

  // Get message history (no integrationId needed)
  getMessageHistory: (channelId) => api.get(`/slack/channels/${channelId}/history`)
};

export default slackAPI;
