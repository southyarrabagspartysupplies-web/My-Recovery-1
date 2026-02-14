import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../lib/api';
import { saveToken, removeToken, getToken } from '../lib/auth';

interface User {
  id: string;
  email: string;
  display_name: string;
  timezone: string;
  sponsor_name?: string;
  sponsor_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  timer_minutes: number;
  sobriety_date?: string;
  onboarded: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; needsOnboarding?: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  completeOnboarding: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      await saveToken(response.data.token);
      set({ user: response.data.user, isAuthenticated: true });
      return { success: true, needsOnboarding: !response.data.user.onboarded };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  },

  register: async (email, password, displayName) => {
    try {
      const response = await authAPI.register({ email, password, display_name: displayName });
      await saveToken(response.data.token);
      set({ user: response.data.user, isAuthenticated: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  },

  logout: async () => {
    await removeToken();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return false;
      }
      const response = await authAPI.getMe();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      await removeToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  setUser: (user) => set({ user }),

  completeOnboarding: async (data) => {
    try {
      await authAPI.completeOnboarding(data);
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...data, onboarded: true } });
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Failed to complete onboarding' };
    }
  },
}));
