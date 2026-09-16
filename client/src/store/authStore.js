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
          set({ user: null, loading: false });
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
          set({ user: null, token: null, loading: false, error: err.message });
          return false;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch { }
        set({ user: null, token: null });
      },

      updateUser: (userData) => set(state => ({ user: { ...state.user, ...userData } })),
    }),
    {
      name: 'socialsilico-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export { api };
export default useAuthStore;
