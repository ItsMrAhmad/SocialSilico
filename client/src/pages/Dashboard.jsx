import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PenLine, Link2, History, TrendingUp, CheckCircle, XCircle,
  Clock, ArrowRight, Calendar as CalendarIcon, Sparkles, Zap,
  Share2, ShieldCheck, AlertCircle, PlusCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore, { api } from '../store/authStore';

const PLATFORMS = [
  { id: 'twitter', name: 'X / Twitter', color: '#1DA1F2', icon: '𝕏' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'f' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📷' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'in' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/posts?limit=6')
    ]).then(([analyticsRes, postsRes]) => {
      setAnalytics(analyticsRes.data);
      const allPosts = postsRes.data.posts || [];
      setRecentPosts(allPosts);
      setScheduledPosts(allPosts.filter(p => p.status === 'scheduled'));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const connectedAccounts = user?.connectedAccounts?.filter(a => a.isActive) || [];
  const connectedPlatforms = connectedAccounts.map(a => a.platform);
  const nextScheduled = scheduledPosts[0];

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="main-content" style={{ maxWidth: 1180, margin: '0 auto' }}>
      {/* Hero Welcome Banner */}
      <div style={{
        background: 'radial-gradient(ellipse 70% 100% at 90% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 60%), var(--gradient-surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '30px 32px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', color: 'var(--silico-violet)', fontWeight: 600, marginBottom: 12 }}>
              <Sparkles size={12} /> SocialSilico Pro Workspace
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: "'Montserrat', sans-serif", margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Welcome back, {firstName} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
              Your multichannel command center is active. Schedule, syndicate, and analyze content effortlessly.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ai-studio')} style={{ gap: 6 }}>
              <Sparkles size={15} style={{ color: 'var(--silico-violet)' }} /> AI Studio
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/calendar')} style={{ gap: 6 }}>
              <CalendarIcon size={15} /> Calendar
            </button>
            <Link to="/compose" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <PenLine size={15} /> Create Post
            </Link>
          </div>
        </div>
      </div>

      {/* Connected Channel Quick Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
        {PLATFORMS.map(p => {
          const isConnected = connectedPlatforms.includes(p.id);
          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)',
                border: `1px solid ${isConnected ? 'rgba(124, 58, 237, 0.3)' : 'var(--border)'}`,
                borderRadius: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: isConnected ? `${p.color}20` : 'var(--bg-elevated)',
                  color: isConnected ? p.color : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700
                }}>
                  {p.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: isConnected ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? 'var(--success)' : 'var(--text-muted)' }} />
                    {isConnected ? 'Active & Linked' : 'Not Connected'}
                  </div>
                </div>
              </div>
              {!isConnected && (
                <Link to="/accounts" style={{ fontSize: '0.75rem', color: 'var(--silico-violet)', fontWeight: 600, textDecoration: 'none' }}>
                  Connect +
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Metrics Grid */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--silico-violet)' }}>
          <div className="stat-label">Total Posts</div>
          <div className="stat-value" style={{ color: 'var(--silico-violet)' }}>
            {loading ? '-' : analytics?.totalPosts || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={13} style={{ color: 'var(--success)' }} /> All-time created
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="stat-label">Published Successfully</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {loading ? '-' : analytics?.publishedPosts || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across channels</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--silico-indigo)' }}>
          <div className="stat-label">Success Rate</div>
          <div className="stat-value" style={{ color: 'var(--silico-indigo)' }}>
            {loading ? '-' : `${analytics?.successRate || 100}%`}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery reliability</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="stat-label">Scheduled in Queue</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>
            {loading ? '-' : scheduledPosts.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Link to="/calendar" style={{ color: 'var(--info)', textDecoration: 'none' }}>View Calendar →</Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Chart + Spotlight */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 24, marginBottom: 28 }}>
        {/* Activity Trend Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', margin: '0 0 4px 0' }}>
                Publishing Activity Trend
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Posts created & scheduled over the last 30 days
              </p>
            </div>
            <span className="badge badge-primary">Daily Volume</span>
          </div>

          {analytics?.postsOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={analytics.postsOverTime}>
                <defs>
                  <linearGradient id="colorPostsSilico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-primary)'
                  }}
                />
                <Area type="monotone" dataKey="count" name="Posts" stroke="#7C3AED" strokeWidth={2.5} fill="url(#colorPostsSilico)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 10 }}>
              <TrendingUp size={36} opacity={0.3} />
              <p style={{ fontSize: '0.85rem' }}>No activity yet. Create your first post to see trends!</p>
            </div>
          )}
        </div>

        {/* Next Scheduled Post or Quick Action Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: 'var(--silico-violet)' }} /> Next in Queue
            </h2>
            <Link to="/calendar" style={{ fontSize: '0.8rem', color: 'var(--silico-violet)', textDecoration: 'none', fontWeight: 600 }}>
              Open Calendar
            </Link>
          </div>

          {nextScheduled ? (
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 16,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="badge badge-warning" style={{ gap: 4 }}>
                    <Clock size={12} /> Scheduled
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(nextScheduled.scheduledAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                  {nextScheduled.content.slice(0, 140)}...
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {nextScheduled.platforms?.map(p => {
                    const platform = PLATFORMS.find(pl => pl.id === p);
                    return (
                      <span key={p} style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem',
                        fontWeight: 700, background: 'var(--bg-card)', color: platform?.color
                      }}>
                        {platform?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Link to="/history" className="btn btn-secondary btn-sm">
                  Manage Queue →
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px dashed var(--border)',
              borderRadius: 14,
              padding: 24,
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12
            }}>
              <CalendarIcon size={32} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Your schedule queue is empty</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Plan ahead by scheduling posts to multiple networks simultaneously.</p>
              </div>
              <Link to="/compose" className="btn btn-primary btn-sm" style={{ marginTop: 6 }}>
                <PlusCircle size={14} /> Schedule a Post
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Posts Feed */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', margin: 0 }}>
            Recent Publishing Activity
          </h2>
          <Link to="/history" style={{ fontSize: '0.82rem', color: 'var(--silico-violet)', fontWeight: 600, textDecoration: 'none' }}>
            View all history →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            No posts published yet. Ready to broadcast your first message?
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentPosts.map(post => (
              <div
                key={post._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {post.platforms?.map(p => {
                      const pl = PLATFORMS.find(item => item.id === p);
                      return (
                        <span key={p} style={{ color: pl?.color, fontWeight: 700, fontSize: '0.85rem' }}>
                          {pl?.icon}
                        </span>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.content}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`badge badge-${post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'warning' : 'danger'}`}>
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
