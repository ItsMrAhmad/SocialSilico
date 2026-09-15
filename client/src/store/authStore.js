import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || '';
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
        if (token) {
          // Fetch user profile after login
          get().fetchMe(token);
        }
      },

      fetchMe: async (token) => {
        try {
          set({ loading: true });
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token || get().token}` }
          });
          set({ user: res.data.user, loading: false, error: null });
        } catch (err) {
          set({ user: null, token: null, loading: false });
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
