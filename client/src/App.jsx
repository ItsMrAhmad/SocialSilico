import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Compose from './pages/Compose';
import Accounts from './pages/Accounts';
import PostHistory from './pages/PostHistory';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';

// Layout
import AppLayout from './components/layout/AppLayout';

const ProtectedRoute = ({ children }) => {
  const { token, user, loading } = useAuthStore();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useAuthStore();
  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { token, fetchMe } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    if (token) fetchMe();
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: 'var(--shadow-md)',
          },
          success: { iconTheme: { primary: '#F5C518', secondary: '#000' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected App */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/history" element={<PostHistory />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute><AppLayout isAdmin /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
