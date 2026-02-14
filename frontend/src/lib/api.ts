import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('myrecovery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
