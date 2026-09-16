import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Clock, CheckCircle, AlertCircle, Eye, RefreshCw, Filter, Sparkles
} from 'lucide-react';
import { api } from '../store/authStore';
import toast from 'react-hot-toast';

const PLATFORMS = [
  { id: 'twitter', name: 'X / Twitter', color: '#1DA1F2', icon: '𝕏' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'f' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📷' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'in' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activePost, setActivePost] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts?limit=100');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Failed to load posts for calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchPlatform = selectedPlatform === 'all' || post.platforms?.includes(selectedPlatform);
      const matchStatus = selectedStatus === 'all' || post.status === selectedStatus;
      return matchPlatform && matchStatus;
    });
  }, [posts, selectedPlatform, selectedStatus]);

  // Group posts by date string 'YYYY-MM-DD'
  const postsByDate = useMemo(() => {
    const map = {};
    filteredPosts.forEach(post => {
      const targetDate = post.scheduledAt || post.createdAt;
      if (!targetDate) return;
      const d = new Date(targetDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(post);
    });
    return map;
  }, [filteredPosts]);

  // Generate calendar grid cells (42 cells: 6 weeks)
  const calendarCells = useMemo(() => {
    const cells = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({ dayNum, dateKey, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dayNum: i, dateKey, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dayNum: i, dateKey, isCurrentMonth: false });
    }

    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const handleCellClick = (dateKey) => {
    navigate(`/compose?scheduledDate=${dateKey}`);
  };

  return (
    <div className="main-content" style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarIcon style={{ color: 'var(--silico-violet)' }} size={28} /> Content Calendar
          </h1>
          <p className="page-subtitle">Visualize, schedule, and orchestrate posts across all channels</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchPosts} title="Refresh calendar">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/compose')}>
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      {/* Toolbar: Month Picker & Platform Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: 10, padding: 4 }}>
            <button className="btn btn-ghost btn-sm" onClick={handlePrevMonth} style={{ padding: '6px 10px' }} title="Previous month">
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleToday} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              Today
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleNextMonth} style={{ padding: '6px 10px' }} title="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* Platform & Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Platform Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-elevated)', padding: 4, borderRadius: 10 }}>
            <button
              onClick={() => setSelectedPlatform('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                background: selectedPlatform === 'all' ? 'var(--primary)' : 'transparent',
                color: selectedPlatform === 'all' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All
            </button>
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  background: selectedPlatform === p.id ? p.color : 'transparent',
                  color: selectedPlatform === p.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.2s'
                }}
              >
                <span>{p.icon}</span> {p.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          {DAYS_OF_WEEK.map(day => (
            <div key={day} style={{ padding: '12px 10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Month Day Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 650 }}>
          {calendarCells.map((cell, idx) => {
            const dayPosts = postsByDate[cell.dateKey] || [];
            const isToday = cell.dateKey === todayStr;

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(cell.dateKey)}
                style={{
                  minHeight: 110,
                  padding: '8px',
                  borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid var(--border-subtle)',
                  borderBottom: idx >= 35 ? 'none' : '1px solid var(--border-subtle)',
                  background: isToday ? 'rgba(124, 58, 237, 0.08)' : cell.isCurrentMonth ? 'transparent' : 'rgba(0,0,0,0.15)',
                  opacity: cell.isCurrentMonth ? 1 : 0.45,
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                className="calendar-cell"
              >
                {/* Day Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: isToday ? 800 : 600,
                    width: 26, height: 26,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isToday ? 'var(--primary)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-primary)',
                  }}>
                    {cell.dayNum}
                  </span>

                  {dayPosts.length > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Day Posts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
                  {dayPosts.slice(0, 3).map((post) => {
                    const statusColor = post.status === 'published' ? 'var(--success)' : post.status === 'scheduled' ? 'var(--primary)' : 'var(--error)';
                    const timeStr = post.scheduledAt
                      ? new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={post._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePost(post);
                        }}
                        style={{
                          background: 'var(--bg-card)',
                          borderLeft: `3px solid ${statusColor}`,
                          borderRadius: 6,
                          padding: '4px 6px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          transition: 'transform 0.15s, background 0.15s',
                        }}
                        className="post-chip"
                      >
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeStr}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {post.platforms?.slice(0, 2).map(p => {
                            const platform = PLATFORMS.find(pl => pl.id === p);
                            return (
                              <span key={p} style={{ color: platform?.color, fontWeight: 700, fontSize: '0.75rem' }}>
                                {platform?.icon}
                              </span>
                            );
                          })}
                        </div>
                        <span style={{
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          flex: 1, color: 'var(--text-primary)'
                        }}>
                          {post.content}
                        </span>
                      </div>
                    );
                  })}

                  {dayPosts.length > 3 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, paddingLeft: 4 }}>
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Details Modal */}
      {activePost && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setActivePost(null)}>
          <div
            className="card"
            style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${activePost.status === 'published' ? 'success' : activePost.status === 'scheduled' ? 'warning' : 'danger'}`}>
                  {activePost.status}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activePost.scheduledAt ? `Scheduled: ${new Date(activePost.scheduledAt).toLocaleString()}` : new Date(activePost.createdAt).toLocaleString()}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActivePost(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Target Platforms</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                {activePost.platforms?.map(p => {
                  const platform = PLATFORMS.find(pl => pl.id === p);
                  return (
                    <span key={p} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'var(--bg-elevated)', padding: '6px 12px',
                      borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                      border: `1px solid ${platform?.color}40`, color: platform?.color
                    }}>
                      <span>{platform?.icon}</span> {platform?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Content</h4>
              <div style={{
                background: 'var(--bg-elevated)', padding: 16, borderRadius: 12,
                fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid var(--border)'
              }}>
                {activePost.content}
              </div>
            </div>

            {activePost.mediaUrls?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Media</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                  {activePost.mediaUrls.map((url, i) => (
                    <img key={i} src={url} alt="Attachment" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setActivePost(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                navigate('/compose', { state: { initialContent: activePost.content, initialPlatforms: activePost.platforms } });
              }}>
                Duplicate / Re-compose
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
