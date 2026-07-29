import { create } from 'zustand';
import { api } from '../services/api';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  isCheckingAuth: false,
  sessionExpiredReason: null,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null, sessionExpiredReason: null });
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ 
        token: data.token, 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  exploreDemo: async () => {
    set({ isLoading: true, error: null, sessionExpiredReason: null });
    try {
      const data = await api.post('/auth/demo-login');
      localStorage.setItem('token', data.token);
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      set({ error: error.message || 'Failed to enter Demo Workspace', isLoading: false });
      return false;
    }
  },

  logout: (reason = null) => {
    localStorage.removeItem('token');
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false,
      sessionExpiredReason: reason || null
    });
  },

  clearExpiredReason: () => {
    set({ sessionExpiredReason: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, isCheckingAuth: false });
      return;
    }
    
    set({ isCheckingAuth: true, isLoading: true });
    try {
      const data = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false, isCheckingAuth: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
    }
  }
}));

// Listen for unauthorized events to automatically logout
window.addEventListener('unauthorized', () => {
  useAuthStore.getState().logout('Your session has expired due to inactivity. Please log in again.');
});

export default useAuthStore;

