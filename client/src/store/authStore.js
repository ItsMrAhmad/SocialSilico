import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '' 
    : 'https://socialsilico.onrender.com');

const api = axios.create({ baseURL: `${API_BASE}/api` });

// Attach token to every request
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      setToken: (token) => {
        set({ token });
      },

      fetchMe: async (token) => {
        const authToken = token || get().token;
        if (!authToken) {
          set({ user: null, token: null, loading: false });
          return false;
        }
        try {
          set({ loading: true, error: null });
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          if (res.data?.user) {
            set({ user: res.data.user, token: authToken, loading: false, error: null });
            return true;
          }
          set({ user: null, token: null, loading: false });
          return false;
        } catch (err) {
          console.error('fetchMe error:', err);
          // CRITICAL: Only clear token if server explicitly responded with 401 (invalid/expired) or 403 (suspended)
          if (err.response?.status === 401 || err.response?.status === 403) {
            set({ user: null, token: null, loading: false, error: err.response?.data?.error || err.message });
            return false;
          }
          // If server is spinning up on Render or temporary network error (502, 503, timeout),
          // DO NOT wipe the stored user session! Keep cached user logged in!
          set({ loading: false });
          return !!get().user;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch { }
        set({ user: null, token: null, loading: false, error: null });
        try {
          localStorage.removeItem('socialsilico-auth');
        } catch { }
      },

      updateUser: (userData) => set(state => ({ user: { ...state.user, ...userData } })),
    }),
    {
      name: 'socialsilico-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export { api };
export default useAuthStore;
