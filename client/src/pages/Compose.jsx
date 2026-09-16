import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Send, Image, Calendar as CalendarIcon, X, AlertCircle,
  CheckCircle, Sparkles, Clock, Eye, MessageCircle, Heart,
  Repeat2, Share, Bookmark, ThumbsUp, MessageSquare, CornerUpRight,
  Plus, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore, { api, API_BASE } from '../store/authStore';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📷', limit: 2200, note: 'Requires image attachment' },
  { id: 'twitter', name: 'X / Twitter', color: '#1DA1F2', icon: '𝕏', limit: 280, connectUrl: '/api/auth/twitter' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'f', limit: 63206, connectUrl: '/api/auth/facebook' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'in', limit: 3000 },
];

export default function Compose() {
  const { user, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Retrieve initial state passed from AI Studio or Calendar
  const initialContent = location.state?.initialContent || '';
  const initialPlatforms = location.state?.initialPlatforms || [];
  const queryDate = searchParams.get('scheduledDate');

  const [content, setContent] = useState(initialContent);
  const [selectedPlatforms, setSelectedPlatforms] = useState(initialPlatforms.length > 0 ? initialPlatforms : ['twitter']);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [scheduledAt, setScheduledAt] = useState(queryDate ? `${queryDate}T09:00` : '');
  const [isScheduling, setIsScheduling] = useState(!!queryDate);
  const [publishing, setPublishing] = useState(false);
  const [previewTab, setPreviewTab] = useState('twitter');

  // Pop-up modal state for connecting channels
  const [connectModalPlatform, setConnectModalPlatform] = useState(null);
  const [handleInput, setHandleInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connectedAccounts = user?.connectedAccounts?.filter(a => a.isActive) || [];
  const connectedPlatforms = connectedAccounts.map(a => a.platform);

  // If user has connected channels and current selected has none, auto-select first connected
  useEffect(() => {
    if (connectedPlatforms.length > 0 && selectedPlatforms.every(p => !connectedPlatforms.includes(p))) {
      setSelectedPlatforms([connectedPlatforms[0]]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(previewTab)) {
      setPreviewTab(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  useEffect(() => {
    if (location.state?.initialContent) {
      setContent(location.state.initialContent);
    }
    if (location.state?.initialPlatforms && location.state.initialPlatforms.length > 0) {
      setSelectedPlatforms(location.state.initialPlatforms);
    }
  }, [location.state]);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? (prev.length > 1 ? prev.filter(p => p !== platformId) : prev)
        : [...prev, platformId]
    );
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const combined = [...files, ...newFiles].slice(0, 4);
    setFiles(combined);

    const urls = combined.map(file => URL.createObjectURL(file));
    setFilePreviews(urls);
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setFilePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Direct channel link inside pop-up modal
  const handleDirectConnect = async (e) => {
    e.preventDefault();
    if (!handleInput.trim()) {
      toast.error('Please enter your account handle or username');
      return;
    }

    setConnecting(true);
    const cleanHandle = handleInput.trim().replace(/^@/, '');

    try {
      await api.post('/accounts/connect', {
        platform: connectModalPlatform.id,
        platformUserId: cleanHandle,
        platformUsername: `@${cleanHandle}`,
        platformName: nameInput.trim() || cleanHandle,
        avatar: user?.avatar || '',
        accessToken: 'token_' + Date.now(),
      });

      await fetchMe();
      toast.success(`${connectModalPlatform.name} account @${cleanHandle} connected! 🎉`);

      // Auto-select this newly connected platform in composer
      setSelectedPlatforms(prev => prev.includes(connectModalPlatform.id) ? prev : [...prev, connectModalPlatform.id]);
      setConnectModalPlatform(null);
      setHandleInput('');
      setNameInput('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to connect account');
    } finally {
      setConnecting(false);
    }
  };

  const handleOAuthConnect = (platform) => {
    if (platform.connectUrl) {
      window.location.href = `${API_BASE}${platform.connectUrl}`;
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to publish');
      return;
    }
    if (!selectedPlatforms.length) {
      toast.error('Select at least one platform');
      return;
    }

    // Check for unlinked platforms - if unlinked, trigger popup!
    const unlinked = selectedPlatforms.filter(p => !connectedPlatforms.includes(p));
    if (unlinked.length > 0) {
      const firstUnlinked = PLATFORMS.find(pl => pl.id === unlinked[0]);
      setConnectModalPlatform(firstUnlinked);
      toast.error(`Please connect ${firstUnlinked.name} before publishing!`, { duration: 4000 });
      return;
    }

    // Check Instagram media requirement
    if (selectedPlatforms.includes('instagram') && files.length === 0) {
      toast.error('Instagram requires at least one image attachment to publish!', { duration: 4500 });
      return;
    }

    setPublishing(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      if (isScheduling && scheduledAt) {
        formData.append('scheduledAt', new Date(scheduledAt).toISOString());
      }
      files.forEach(f => formData.append('media', f));

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.post?.status === 'scheduled') {
        toast.success('Post scheduled successfully! 📅');
        navigate('/calendar');
      } else {
        const successes = res.data.platformResults?.filter(r => r.status === 'success')?.length || 0;
        toast.success(`Published to ${successes}/${selectedPlatforms.length} channels! 🎉`);
        navigate('/history');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to dispatch post');
    } finally {
      setPublishing(false);
    }
  };

  const activeLimit = selectedPlatforms.reduce((min, p) => {
    const platform = PLATFORMS.find(pl => pl.id === p);
    return platform && platform.limit < min ? platform.limit : min;
  }, Infinity);

  const charCount = content.length;
  const isOverLimit = activeLimit !== Infinity && charCount > activeLimit;

  const currentPreviewPlatform = PLATFORMS.find(p => p.id === previewTab) || PLATFORMS[0];
  const displayName = user?.name || 'SocialSilico Creator';
  const handleName = user?.name ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@socialsilico';

  return (
    <div className="main-content" style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Composer & Syndication</h1>
          <p className="page-subtitle">Draft your message with real-time multi-network preview mockups</p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/ai-studio')}
          style={{ gap: 6 }}
        >
          <Sparkles size={15} style={{ color: 'var(--silico-violet)' }} /> Need Ideas? Open AI Studio
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)', gap: 24 }}>
        {/* Left Column: Editor & Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Target Platforms */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Publish To:
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {connectedPlatforms.length} channel(s) connected
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {PLATFORMS.map(p => {
                const isConnected = connectedPlatforms.includes(p.id);
                const isSelected = selectedPlatforms.includes(p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (!isConnected) {
                        setConnectModalPlatform(p);
                        setHandleInput('');
                        setNameInput('');
                        return;
                      }
                      togglePlatform(p.id);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? p.color : 'var(--border)'}`,
                      background: isSelected ? `${p.color}18` : 'var(--bg-elevated)',
                      color: isConnected ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: p.color, fontWeight: 700 }}>{p.icon}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isConnected ? 'var(--success)' : 'var(--error)',
                      fontWeight: 700
                    }}>
                      {isConnected ? 'Linked' : '+ Link'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Warning if Instagram selected without media */}
            {selectedPlatforms.includes('instagram') && files.length === 0 && (
              <div style={{
                marginTop: 12, padding: '8px 12px', borderRadius: 8,
                background: 'rgba(225, 48, 108, 0.12)', border: '1px solid rgba(225, 48, 108, 0.3)',
                color: '#E1306C', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <AlertCircle size={15} />
                <span><strong>Instagram requires an image attachment:</strong> Please attach at least 1 image below before publishing.</span>
              </div>
            )}
          </div>

          {/* Caption & Content Input */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Post Content
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: isOverLimit ? 'var(--error)' : 'var(--text-muted)'
                }}>
                  {charCount} / {activeLimit !== Infinity ? activeLimit : '∞'}
                </span>
              </div>
            </div>

            <textarea
              className="form-input"
              rows={6}
              placeholder="What do you want to share with your audience? Write once, publish across all connected channels..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                resize: 'vertical',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                borderColor: isOverLimit ? 'var(--error)' : undefined,
                marginBottom: 14
              }}
            />

            {/* Media Upload Area */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', gap: 6 }}>
                  <Image size={15} /> Attach Media
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Up to 4 images (PNG, JPG, WebP)
                </span>
              </div>

              {filePreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 12 }}>
                  {filePreviews.map((url, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 80, border: '1px solid var(--border)' }}>
                      <img src={url} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => removeFile(i)}
                        style={{
                          position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                          borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff',
                          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scheduling Options */}
            <div style={{
              background: 'var(--bg-elevated)',
              padding: '14px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              marginBottom: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isScheduling ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} style={{ color: 'var(--silico-violet)' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Schedule for Later</span>
                </div>
                <input
                  type="checkbox"
                  checked={isScheduling}
                  onChange={(e) => setIsScheduling(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--silico-violet)', cursor: 'pointer' }}
                />
              </div>

              {isScheduling && (
                <div>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    The post scheduler runs automatically every minute.
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, gap: 8, justifyContent: 'center' }}
              onClick={handlePublish}
              disabled={publishing || isOverLimit}
            >
              {publishing ? (
                <>Publishing...</>
              ) : isScheduling ? (
                <>
                  <CalendarIcon size={18} /> Schedule for Selected Date
                </>
              ) : (
                <>
                  <Send size={18} /> Publish Immediately
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Network Previews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={16} style={{ color: 'var(--silico-violet)' }} /> Live Platform Preview
            </h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {selectedPlatforms.map(pId => {
                const pl = PLATFORMS.find(item => item.id === pId);
                const isActive = previewTab === pId;
                return (
                  <button
                    key={pId}
                    onClick={() => setPreviewTab(pId)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      background: isActive ? pl?.color : 'var(--bg-elevated)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {pl?.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Card Mockup */}
          <div className="card" style={{ padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {/* Mock Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--silico-violet)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.9rem'
                  }}>
                    {displayName[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {displayName}
                    <span style={{ fontSize: '0.75rem', color: currentPreviewPlatform.color }}>●</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {previewTab === 'twitter' ? handleName : previewTab === 'linkedin' ? '1st • Social Strategist' : 'Just now • 🌍'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: currentPreviewPlatform.color, fontWeight: 800 }}>
                {currentPreviewPlatform.icon}
              </span>
            </div>

            {/* Mock Post Body */}
            <div style={{
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              marginBottom: 16,
              minHeight: 80
            }}>
              {content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Your post preview will appear here in real-time...</span>}
            </div>

            {/* Media Attachment Grid */}
            {filePreviews.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: filePreviews.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                gap: 6,
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
                maxHeight: 280
              }}>
                {filePreviews.map((url, i) => (
                  <img key={i} src={url} alt="Attachment" style={{ width: '100%', height: filePreviews.length === 1 ? 240 : 130, objectFit: 'cover' }} />
                ))}
              </div>
            )}

            {/* Mock Platform Engagement Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)', paddingTop: 12,
              color: 'var(--text-muted)', fontSize: '0.8rem'
            }}>
              {previewTab === 'twitter' ? (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={15} /> 0</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Repeat2 size={15} /> 0</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={15} /> 0</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bookmark size={15} /></span>
                </>
              ) : previewTab === 'linkedin' ? (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={15} /> Like</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={15} /> Comment</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Repeat2 size={15} /> Repost</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Send size={15} /> Send</span>
                </>
              ) : (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={15} /> Like</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={15} /> Comment</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Share size={15} /> Share</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connect Channel Modal Pop-up */}
      {connectModalPlatform && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setConnectModalPlatform(null)}>
          <div
            className="card"
            style={{ maxWidth: 460, width: '100%', borderRadius: 16, border: `2px solid ${connectModalPlatform.color}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem', color: connectModalPlatform.color }}>{connectModalPlatform.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Connect {connectModalPlatform.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Link your account to enable publishing to {connectModalPlatform.name}
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setConnectModalPlatform(null)}>
                <X size={16} />
              </button>
            </div>

            {/* OAuth Option */}
            {connectModalPlatform.connectUrl && (
              <div style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  className="oauth-btn"
                  onClick={() => handleOAuthConnect(connectModalPlatform)}
                  style={{ width: '100%', justifyContent: 'center', gap: 8, background: 'var(--bg-elevated)' }}
                >
                  <span style={{ color: connectModalPlatform.color }}>{connectModalPlatform.icon}</span> Connect with {connectModalPlatform.name} OAuth
                </button>
                <div className="divider-text" style={{ margin: '14px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  or link directly
                </div>
              </div>
            )}

            {/* Direct Handle Form */}
            <form onSubmit={handleDirectConnect}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Account Username / Handle *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={connectModalPlatform.id === 'instagram' ? 'e.g. @itsmrahmadasghar' : 'e.g. @myhandle'}
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Channel Display Name (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Muhammad Ahmad"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setConnectModalPlatform(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={connecting} style={{ gap: 6 }}>
                  {connecting ? 'Linking...' : `Save & Link ${connectModalPlatform.name}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
