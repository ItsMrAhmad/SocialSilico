import React, { useState, useEffect } from 'react';
import { Trash2, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../store/authStore';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['', 'draft', 'scheduled', 'published', 'partial', 'failed'];

export default function PostHistory() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryingId, setRetryingId] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (status) params.set('status', status);
      const res = await api.get(`/posts?${params}`);
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page, status]);

  const handleRetry = async (postId) => {
    setRetryingId(postId);
    try {
      const res = await api.post(`/posts/${postId}/retry`);
      toast.success(res.data.message || 'Retry completed!');
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Post History 📋</h1>
        <p className="page-subtitle">All your published, scheduled, and draft posts</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No posts found</h3>
          <p>Posts you create will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => (
            <div key={post._id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Media thumbnail */}
                {post.media?.[0] && (
                  <img
                    src={post.media[0].url}
                    alt="media"
                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    marginBottom: 10, fontSize: '0.9rem', lineHeight: 1.5
                  }}>
                    {post.content}
                  </p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {post.platforms?.map(p => (
                      <span key={p} className={`platform-badge platform-${p}`}>{p}</span>
                    ))}
                    <span className={`status-badge status-${post.status}`}>{post.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                      {post.scheduledAt
                        ? `Scheduled: ${format(new Date(post.scheduledAt), 'MMM d, h:mm a')}`
                        : format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Platform Results */}
                  {post.platformResults?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {post.platformResults.map(r => (
                        <span key={r.platform} style={{
                          fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10,
                          background: r.status === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: r.status === 'success' ? 'var(--success)' : 'var(--error)',
                        }}>
                          {r.platform}: {r.status === 'success' ? '✓' : '✗ ' + (r.error?.slice(0, 20) || 'failed')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {(post.status === 'failed' || post.status === 'partial') && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRetry(post._id)}
                      disabled={retryingId === post._id}
                      title="Retry posting to failed platforms"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', gap: 4 }}
                    >
                      <RotateCw
                        size={13}
                        style={{
                          animation: retryingId === post._id ? 'spin 0.7s linear infinite' : 'none'
                        }}
                      />
                      {retryingId === post._id ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(post._id)}
                    style={{ color: 'var(--error)', padding: '6px 8px' }}
                    title="Delete post"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >← Prev</button>
          <span style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next →</button>
        </div>
      )}
    </div>
  );
}
