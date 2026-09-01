import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PenLine, Link2, History, BarChart3,
  Settings, LogOut, Users, FileText, Shield, Zap
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ThemeToggle from '../common/ThemeToggle';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/compose', icon: PenLine, label: 'Compose' },
  { to: '/accounts', icon: Link2, label: 'Accounts' },
  { to: '/history', icon: History, label: 'Post History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/posts', icon: FileText, label: 'All Posts' },
];

export default function AppLayout({ isAdmin }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="page-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #F5C518, #F97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem'
            }}>🐝</div>
            <span className="sidebar-logo-text">SocialBee</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Main Nav */}
        <nav style={{ flex: 1 }}>
          <div className="nav-section">Main</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className="nav-section" style={{ marginTop: 16 }}>Admin</div>
              {adminItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User Profile */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar" />
            ) : (
              <div className="avatar avatar-placeholder">{initials}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
