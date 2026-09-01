import React, { useState, useEffect } from 'react';
import { Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../store/authStore';
import { format } from 'date-fns';

const STATUSES = ['', 'published', 'partial', 'failed', 'scheduled', 'draft'];
const PLATFORMS = ['', 'twitter', 'facebook', 'instagram', 'linkedin'];

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [platform, setPlatform] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.set('status', status);
      if (platform) params.set('platform', platform);
      const res = await api.get(`/admin/posts?${params}`);
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [page, status, platform]);

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    setDeleting(postId);
    try {
      await api.delete(`/admin/posts/${postId}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch { toast.error('Failed'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="main-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">All Posts 📋</h1>
        <p className="page-subtitle">Monitor all posts from all users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-input" style={{ width: 150 }}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={platform} onChange={e => { setPlatform(e.target.value); setPage(1); }} className="form-input" style={{ width: 150 }}>
          {PLATFORMS.map(p => <option key={p} value={p}>{p || 'All Platforms'}</option>)}
        </select>
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
                <th>Content</th>
                <th>User</th>
                <th>Platforms</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No posts found</td></tr>
              ) : posts.map(post => (
                <tr key={post._id}>
                  <td style={{ maxWidth: 280 }}>
                    <p style={{
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      fontSize: '0.85rem', lineHeight: 1.4
                    }}>
                      {post.content}
                    </p>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {post.user?.avatar ? (
                        <img src={post.user.avatar} alt="" className="avatar" style={{ width: 28, height: 28 }} />
                      ) : (
                        <div className="avatar avatar-placeholder" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                          {post.user?.name?.slice(0, 2)}
                        </div>
                      )}
                      <span style={{ fontSize: '0.85rem' }}>{post.user?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {post.platforms?.map(p => (
                        <span key={p} className={`platform-badge platform-${p}`} style={{ fontSize: '0.65rem' }}>{p}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className={`status-badge status-${post.status}`}>{post.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(post._id)}
                      disabled={deleting === post._id}
                    >
                      {deleting === post._id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
