import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, Link2, History, TrendingUp, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore, { api } from '../store/authStore';

const PLATFORM_COLORS = {
  twitter: '#1DA1F2', facebook: '#1877F2',
  instagram: '#E1306C', linkedin: '#0A66C2',
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/posts?limit=5')
    ]).then(([analyticsRes, postsRes]) => {
      setAnalytics(analyticsRes.data);
      setRecentPosts(postsRes.data.posts);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const connectedCount = user?.connectedAccounts?.filter(a => a.isActive)?.length || 0;

  return (
    <div className="main-content" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your social accounts</p>
        </div>
        <Link to="/compose" className="btn btn-primary">
          <PenLine size={16} /> New Post
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Posts</div>
              <div className="stat-value" style={{ color: 'var(--bee-yellow)' }}>{analytics?.totalPosts || 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Published</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{analytics?.publishedPosts || 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Successfully posted</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Success Rate</div>
              <div className="stat-value" style={{ color: 'var(--bee-amber)' }}>{analytics?.successRate || 0}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Publication rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Connected</div>
              <div className="stat-value" style={{ color: 'var(--info)' }}>{connectedCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active accounts</div>
            </div>
          </div>

          {/* Chart */}
          {analytics?.postsOverTime?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', marginBottom: 20 }}>
                Posts Over Time (Last 30 Days)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics.postsOverTime}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="count" name="Posts" stroke="#F5C518" strokeWidth={2} fill="url(#colorPosts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Platform Breakdown */}
          {analytics?.platformBreakdown?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', marginBottom: 16 }}>
                Platform Usage
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {analytics.platformBreakdown.map(p => (
                  <div key={p.platform} style={{
                    padding: '12px 20px', borderRadius: 12,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: PLATFORM_COLORS[p.platform] || '#888'
                    }} />
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p.platform}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.count} posts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Posts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem' }}>Recent Posts</h2>
              <Link to="/history" style={{ color: 'var(--bee-yellow)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {recentPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>No posts yet</h3>
                <p>Create your first post to see it here</p>
                <Link to="/compose" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                  <PenLine size={14} /> Compose Post
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentPosts.map(post => (
                  <div key={post._id} style={{
                    padding: '14px 16px', background: 'var(--bg-elevated)',
                    borderRadius: 10, border: '1px solid var(--border-subtle)',
                    display: 'flex', gap: 12, alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.9rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 8 }}>
                        {post.content}
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {post.platforms?.map(p => (
                          <span key={p} className={`platform-badge platform-${p}`}>{p}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span className={`status-badge status-${post.status}`}>{post.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {connectedCount === 0 && (
            <div className="card" style={{
              marginTop: 24,
              background: 'rgba(245,197,24,0.05)',
              border: '1px solid rgba(245,197,24,0.2)',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <span style={{ fontSize: '2rem' }}>🔗</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Connect your social accounts</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Link Twitter, Facebook, Instagram, or LinkedIn to start posting.</p>
              </div>
              <Link to="/accounts" className="btn btn-primary btn-sm">
                <Link2 size={14} /> Connect
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
