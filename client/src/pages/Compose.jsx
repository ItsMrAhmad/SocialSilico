import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Image, Calendar, X, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore, { api } from '../store/authStore';

const PLATFORMS = [
  { id: 'twitter', name: 'X / Twitter', color: '#1DA1F2', icon: '𝕏', limit: 280 },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'f', limit: 63206 },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📷', limit: 2200 },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'in', limit: 3000 },
];

export default function Compose() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [files, setFiles] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewPlatform, setPreviewPlatform] = useState('twitter');

  const connectedAccounts = user?.connectedAccounts?.filter(a => a.isActive) || [];
  const connectedPlatforms = connectedAccounts.map(a => a.platform);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId) ? prev.filter(p => p !== platformId) : [...prev, platformId]
    );
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles].slice(0, 4));
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handlePublish = async () => {
    if (!content.trim()) { toast.error('Please write some content'); return; }
    if (!selectedPlatforms.length) { toast.error('Select at least one platform'); return; }

    setPublishing(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      if (scheduledAt) formData.append('scheduledAt', scheduledAt);
      files.forEach(f => formData.append('media', f));

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResults(res.data.platformResults || []);

      if (res.data.post.status === 'scheduled') {
        toast.success('Post scheduled successfully! 📅');
        navigate('/history');
      } else {
        const success = res.data.platformResults?.filter(r => r.status === 'success').length;
        const total = selectedPlatforms.length;
        toast.success(`Published to ${success}/${total} platforms 🎉`);
        if (success === total) {
          setTimeout(() => navigate('/history'), 2000);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  // Find the most restrictive character limit
  const activeLimit = selectedPlatforms.reduce((min, p) => {
    const platform = PLATFORMS.find(pl => pl.id === p);
    return platform && platform.limit < min ? platform.limit : min;
  }, Infinity);

  const charCount = content.length;
  const overLimit = activeLimit !== Infinity && charCount > activeLimit;

  return (
    <div className="main-content" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Compose Post ✍️</h1>
        <p className="page-subtitle">Write once, publish everywhere</p>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {/* Platform Selector */}
        <div className="card">
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", marginBottom: 16, fontSize: '1rem' }}>
            Select Platforms
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {PLATFORMS.map(platform => {
              const isConnected = connectedPlatforms.includes(platform.id);
              const isSelected = selectedPlatforms.includes(platform.id);

              return (
                <button
                  key={platform.id}
                  onClick={() => isConnected && togglePlatform(platform.id)}
                  disabled={!isConnected}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${isSelected ? platform.color : 'var(--border)'}`,
                    background: isSelected ? `${platform.color}15` : 'var(--bg-elevated)',
                    color: isConnected ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: isConnected ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.2s',
                    opacity: isConnected ? 1 : 0.5,
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', color: platform.color }}>{platform.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{platform.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {isConnected ? `${platform.limit.toLocaleString()} chars` : 'Not connected'}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle size={16} style={{ position: 'absolute', top: 8, right: 8, color: platform.color }} />
                  )}
                </button>
              );
            })}
          </div>

          {connectedPlatforms.length === 0 && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)',
              fontSize: '0.85rem', color: 'var(--bee-yellow)', display: 'flex', gap: 8
            }}>
              <AlertCircle size={16} />
              Connect social accounts first — <a href="/accounts" style={{ textDecoration: 'underline' }}>Go to Accounts</a>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem' }}>Content</h3>
            <span style={{
              fontSize: '0.8rem', fontWeight: 600,
              color: overLimit ? 'var(--error)' : charCount > activeLimit * 0.9 ? 'var(--warning)' : 'var(--text-muted)'
            }}>
              {charCount}{activeLimit !== Infinity ? ` / ${activeLimit}` : ''}
            </span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? Write your post here..."
            className="form-input form-textarea"
            style={{ minHeight: 180, fontSize: '1rem', lineHeight: 1.6 }}
          />

          {/* Media Upload */}
          <div style={{ marginTop: 16 }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
              transition: 'all 0.2s'
            }}>
              <Image size={16} /> Add Media (max 4)
              <input type="file" accept="image/*,video/mp4" multiple hidden onChange={handleFileChange} />
            </label>

            {files.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                {files.map((file, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                    />
                    <button
                      onClick={() => removeFile(i)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--error)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', border: 'none', cursor: 'pointer'
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule (optional) */}
        <div className="card">
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', marginBottom: 12 }}>
            <Calendar size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Schedule (Optional)
          </h3>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            className="form-input"
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
          />
          {scheduledAt && (
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Will be published: {new Date(scheduledAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Live Platform Preview */}
        {content.trim() && (
          <div className="card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem' }}>
                👁️ Live Platform Preview
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreviewPlatform(p.id)}
                    className={`btn btn-sm ${previewPlatform === p.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Card Preview */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 16,
              maxWidth: 550,
              margin: '0 auto'
            }}>
              {/* Mock Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="avatar" style={{ width: 38, height: 38 }} />
                ) : (
                  <div className="avatar avatar-placeholder" style={{ width: 38, height: 38 }}>
                    {user?.name?.slice(0, 2).toUpperCase() || 'SB'}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {user?.name || 'SocialSilico User'}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      via {PLATFORMS.find(p => p.id === previewPlatform)?.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Just now · 🌍 Public
                  </div>
                </div>
              </div>

              {/* Mock Content */}
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginBottom: files.length > 0 ? 12 : 0
              }}>
                {content}
              </p>

              {/* Mock Media */}
              {files.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: files.length > 1 ? '1fr 1fr' : '1fr',
                  gap: 8,
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginTop: 10
                }}>
                  {files.map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{
                        width: '100%',
                        maxHeight: files.length === 1 ? 280 : 160,
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={publishing || overLimit || !selectedPlatforms.length || !content.trim()}
          className="btn btn-primary btn-lg"
          style={{
            opacity: publishing || overLimit || !selectedPlatforms.length || !content.trim() ? 0.6 : 1,
            cursor: publishing ? 'wait' : 'pointer',
          }}
        >
          {publishing ? (
            <><div className="spinner" style={{ borderTopColor: '#000' }} /> Publishing...</>
          ) : scheduledAt ? (
            <><Calendar size={18} /> Schedule Post</>
          ) : (
            <><Send size={18} /> Publish Now</>
          )}
        </button>

        {/* Results */}
        {results && (
          <div className="card animate-fade-up">
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', marginBottom: 12 }}>
              Publication Results
            </h3>
            {results.map(r => (
              <div key={r.platform} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                background: r.status === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${r.status === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                marginBottom: 8
              }}>
                {r.status === 'success'
                  ? <CheckCircle size={16} color="var(--success)" />
                  : <AlertCircle size={16} color="var(--error)" />}
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{r.platform}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 'auto' }}>
                  {r.status === 'success' ? '✓ Published' : r.error || 'Failed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
