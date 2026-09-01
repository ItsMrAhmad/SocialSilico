import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../store/authStore';

const PLATFORM_COLORS = {
  twitter: '#1DA1F2', facebook: '#1877F2',
  instagram: '#E1306C', linkedin: '#0A66C2'
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  const pieData = data?.platformBreakdown?.map(p => ({
    name: p.platform, value: p.count, color: PLATFORM_COLORS[p.platform] || '#888'
  })) || [];

  return (
    <div className="main-content" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Analytics 📊</h1>
        <p className="page-subtitle">Track your social media performance</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Posts</div>
          <div className="stat-value">{data?.totalPosts || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{data?.publishedPosts || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failed</div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{data?.failedPosts || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Success Rate</div>
          <div className="stat-value" style={{ color: 'var(--bee-yellow)' }}>{data?.successRate || 0}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Area Chart */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', marginBottom: 20 }}>
            Posts Over Time (30 Days)
          </h3>
          {data?.postsOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.postsOverTime}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="count" name="Posts" stroke="#F5C518" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No data yet. Post something to see analytics!</p>
            </div>
          )}
        </div>

        {/* Platform Pie */}
        {pieData.length > 0 && (
          <div className="card">
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', marginBottom: 16 }}>
              Posts by Platform
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart */}
        {pieData.length > 0 && (
          <div className="card">
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', marginBottom: 16 }}>
              Platform Comparison
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, textTransform: 'capitalize' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="value" name="Posts" radius={[6, 6, 0, 0]}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
