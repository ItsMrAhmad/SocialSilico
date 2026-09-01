import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

export default function ThemeToggle({ className = '', style = {} }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-theme-toggle ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: isDark ? 'var(--bee-yellow)' : 'var(--bee-orange)',
        cursor: 'pointer',
        transition: 'var(--transition)',
        ...style
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun size={18} style={{ transition: 'transform 0.3s ease' }} />
      ) : (
        <Moon size={18} style={{ transition: 'transform 0.3s ease' }} />
      )}
    </button>
  );
}
