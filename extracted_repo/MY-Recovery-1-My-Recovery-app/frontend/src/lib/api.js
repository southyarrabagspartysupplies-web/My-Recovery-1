import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('anchor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
};

export const userAPI = {
  updateSettings: (data) => api.patch('/user/settings', data),
  getSettings: () => api.get('/auth/me'),
  exportData: () => api.get('/export', { responseType: 'blob' }),
};

export const copingToolsAPI = {
  getTools: () => api.get('/coping-tools'),
  toggleFavorite: (toolId) => api.post(`/coping-tools/${toolId}/favorite`),
};

export const cravingAPI = {
  createSession: (data) => api.post('/craving-sessions', data),
  completeSession: (sessionId, data) => api.patch(`/craving-sessions/${sessionId}/complete`, data),
  getSessions: () => api.get('/craving-sessions'),
};

export const journalAPI = {
  createEntry: (data) => api.post('/journal', data),
  getEntries: () => api.get('/journal'),
  getEntry: (id) => api.get(`/journal/${id}`),
  getInsights: () => api.get('/journal/insights'),
};

export const progressAPI = {
  getProgress: () => api.get('/progress'),
};

export const resourcesAPI = {
  getResources: () => api.get('/resources'),
  createResource: (data) => api.post('/resources', data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
};

export const timerAPI = {
  getGuidance: (duration) => api.get(`/timer-guidance/${duration}`),
};

export default api;
