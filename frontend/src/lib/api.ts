import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get backend URL from multiple sources with fallback
const getBackendUrl = () => {
  // Try expo config extra (from app.json)
  const extraUrl = Constants.expoConfig?.extra?.EXPO_BACKEND_URL;
  if (extraUrl) return extraUrl;
  
  // Try environment variable
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl) return envUrl;
  
  // Hardcoded fallback for production
  return 'https://recovery-auth-flow.preview.emergentagent.com';
};

const BACKEND_URL = getBackendUrl();
const API_BASE = `${BACKEND_URL}/api`;

console.log('[API] Backend URL:', BACKEND_URL);
console.log('[API] API Base:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 second timeout for mobile networks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  console.log('[API] Request:', config.method?.toUpperCase(), config.url);
  const token = await AsyncStorage.getItem('myrecovery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API] Error:', error.message, error.config?.url);
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timed out - check network connection');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  completeOnboarding: (data: any) => api.post('/auth/onboarding', data),
};

export const userAPI = {
  updateSettings: (data: any) => api.patch('/user/settings', data),
  getSettings: () => api.get('/auth/me'),
  deleteAccount: () => api.delete('/user/delete-account'),
};

export const copingToolsAPI = {
  getTools: () => api.get('/coping-tools'),
  toggleFavorite: (toolId: string) => api.post(`/coping-tools/${toolId}/favorite`),
};

export const cravingAPI = {
  createSession: (data: any) => api.post('/craving-sessions', data),
  completeSession: (sessionId: string, data: any) => api.patch(`/craving-sessions/${sessionId}/complete`, data),
  getSessions: () => api.get('/craving-sessions'),
};

export const journalAPI = {
  createEntry: (data: any) => api.post('/journal', data),
  getEntries: () => api.get('/journal'),
  getEntry: (id: string) => api.get(`/journal/${id}`),
  getInsights: () => api.get('/journal/insights'),
};

export const progressAPI = {
  getProgress: () => api.get('/progress'),
  getChartData: () => api.get('/progress/chart-data'),
};

export const resourcesAPI = {
  getResources: () => api.get('/resources'),
  createResource: (data: any) => api.post('/resources', data),
  deleteResource: (id: string) => api.delete(`/resources/${id}`),
};

export const calendarAPI = {
  getEvents: () => api.get('/calendar/events'),
  createEvent: (data: any) => api.post('/calendar/events', data),
  updateEvent: (id: string, data: any) => api.put(`/calendar/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/calendar/events/${id}`),
};

export default api;
