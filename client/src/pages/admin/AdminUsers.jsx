import React, { useState, useEffect } from 'react';
import { Search, Ban, UserCheck, Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../store/authStore';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actioning, setActioning] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleBan = async (userId, currentBan, name) => {
    const action = currentBan ? 'unban' : 'ban';
    const reason = !currentBan ? prompt(`Reason for banning ${name}?`) : '';
    if (!currentBan && reason === null) return;
    setActioning(userId);
    try {
      await api.patch(`/admin/users/${userId}/ban`, { ban: !currentBan, reason });
      toast.success(`User ${action}ned`);
      fetchUsers();
    } catch { toast.error('Failed'); }
    finally { setActioning(null); }
  };

  const handleRole = async (userId, currentRole, name) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${name}'s role to ${newRole}?`)) return;
    setActioning(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch { toast.error('Failed'); }
    finally { setActioning(null); }
  };

  return (
    <div className="main-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">User Management 👥</h1>
        <p className="page-subtitle">Manage all registered users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUsers()}
            className="form-input"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="form-input"
          style={{ width: 140 }}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => { setPage(1); fetchUsers(); }}>
          <Search size={14} /> Search
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Posts</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="avatar" />
                      ) : (
                        <div className="avatar avatar-placeholder" style={{ fontSize: '0.75rem' }}>
                          {user.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.email}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700,
                      background: user.role === 'admin' ? 'rgba(245,197,24,0.15)' : 'rgba(136,136,170,0.15)',
                      color: user.role === 'admin' ? 'var(--bee-yellow)' : 'var(--text-secondary)'
                    }}>
                      {user.role === 'admin' ? '👑 Admin' : 'User'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem' }}>{user.postsCount || 0}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700,
                      background: user.isBanned ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                      color: user.isBanned ? 'var(--error)' : 'var(--success)'
                    }}>
                      {user.isBanned ? '🚫 Banned' : '✓ Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleBan(user._id, user.isBanned, user.name)}
                        disabled={actioning === user._id}
                        style={{
                          background: user.isBanned ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: user.isBanned ? 'var(--success)' : 'var(--error)',
                          border: `1px solid ${user.isBanned ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem'
                        }}
                      >
                        {user.isBanned ? <><UserCheck size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleRole(user._id, user.role, user.name)}
                        disabled={actioning === user._id}
                        style={{
                          background: 'rgba(245,197,24,0.1)', color: 'var(--bee-yellow)',
                          border: '1px solid rgba(245,197,24,0.3)',
                          padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem'
                        }}
                      >
                        {user.role === 'admin' ? <><ShieldOff size={12} /> Demote</> : <><Shield size={12} /> Promote</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
