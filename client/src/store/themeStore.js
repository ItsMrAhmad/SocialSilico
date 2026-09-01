import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyTheme = (theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        set({ theme: nextTheme });
      },
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      initTheme: () => {
        const currentTheme = get().theme || 'dark';
        applyTheme(currentTheme);
      }
    }),
    {
      name: 'socialbee-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme);
        }
      }
    }
  )
);

export default useThemeStore;
