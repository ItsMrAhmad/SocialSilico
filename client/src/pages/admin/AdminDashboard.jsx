import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { api } from '../../store/authStore';

const PLATFORM_COLORS = { twitter: '#1DA1F2', facebook: '#1877F2', instagram: '#E1306C', linkedin: '#0A66C2' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="main-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          padding: '6px 14px', borderRadius: 8,
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          color: 'var(--error)', fontSize: '0.8rem', fontWeight: 700
        }}>
          🛡️ ADMIN
        </div>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and management</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : !stats ? (
        <div className="empty-state"><p>Failed to load stats</p></div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value" style={{ color: 'var(--bee-yellow)' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} /> All registered
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Posts</div>
              <div className="stat-value">{stats.totalPosts}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across all users</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Published</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.publishedPosts}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> Successful
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Failed Posts</div>
              <div className="stat-value" style={{ color: 'var(--error)' }}>{stats.failedPosts}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle size={12} /> Failed
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Banned Users</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.bannedUsers}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={12} /> Suspended
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* New Users Chart */}
            <div className="card">
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', marginBottom: 16 }}>
                New Users (30 Days)
              </h3>
              {stats.newUsersOverTime?.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={stats.newUsersOverTime}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="count" name="New Users" stroke="#F5C518" strokeWidth={2} fill="url(#userGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="empty-state" style={{ padding: 40 }}><p>No new users in 30 days</p></div>}
            </div>

            {/* Platform Stats */}
            <div className="card">
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', marginBottom: 16 }}>
                Platform Performance
              </h3>
              {stats.platformStats?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.platformStats.map(p => {
                    const successRate = p.total > 0 ? Math.round((p.success / p.total) * 100) : 0;
                    return (
                      <div key={p._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p._id}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{p.success}/{p.total} ({successRate}%)</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${successRate}%`,
                            background: PLATFORM_COLORS[p._id] || 'var(--bee-yellow)',
                            borderRadius: 3, transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="empty-state" style={{ padding: 40 }}><p>No platform data yet</p></div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
