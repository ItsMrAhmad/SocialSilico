import React, { useState } from 'react';
import {
  Link2, Unlink, RefreshCw, CheckCircle, AlertCircle,
  Plus, Settings, Shield, ExternalLink, Sparkles, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore, { api, API_BASE } from '../store/authStore';

const PLATFORMS = [
  {
    id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📷',
    description: 'Post images, carousels, and stories to Instagram Business / Creator',
    connectNote: 'Link via Instagram Handle or Facebook Business Manager',
    supportsDirectLink: true,
  },
  {
    id: 'twitter', name: 'Twitter / X', color: '#1DA1F2', icon: '𝕏',
    description: 'Post tweets, threads, and media to X',
    connectUrl: '/api/auth/twitter',
    supportsDirectLink: true,
  },
  {
    id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'f',
    description: 'Post to Facebook Pages & Groups',
    connectUrl: '/api/auth/facebook',
    supportsDirectLink: true,
  },
  {
    id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'in',
    description: 'Share professional updates and long-form articles',
    supportsDirectLink: true,
  },
];

export default function Accounts() {
  const { user, fetchMe } = useAuthStore();
  const [disconnecting, setDisconnecting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [modalPlatform, setModalPlatform] = useState(null);
  const [handleInput, setHandleInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connectedAccounts = user?.connectedAccounts || [];

  const getAccount = (platformId) => connectedAccounts.find(a => a.platform === platformId);

  const handleOpenConnect = (platform) => {
    setModalPlatform(platform);
    setHandleInput('');
    setNameInput('');
  };

  const handleOAuthConnect = (platform) => {
    if (platform.connectUrl) {
      window.location.href = `${API_BASE}${platform.connectUrl}`;
    }
  };

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
        platform: modalPlatform.id,
        platformUserId: cleanHandle,
        platformUsername: `@${cleanHandle}`,
        platformName: nameInput.trim() || cleanHandle,
        avatar: user?.avatar || '',
        accessToken: 'token_' + Date.now(),
      });

      await fetchMe();
      toast.success(`${modalPlatform.name} account @${cleanHandle} connected! 🎉`);
      setModalPlatform(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to connect account');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (accountId, platformName) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}?`)) return;
    setDisconnecting(accountId);
    try {
      await api.delete(`/accounts/${accountId}`);
      await fetchMe();
      toast.success(`${platformName} disconnected`);
    } catch (err) {
      toast.error('Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  };

  const handleToggle = async (accountId, currentState) => {
    setToggling(accountId);
    try {
      await api.patch(`/accounts/${accountId}/toggle`);
      await fetchMe();
      toast.success(currentState ? 'Account paused' : 'Account activated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Connected Social Channels</h1>
          <p className="page-subtitle">Manage, authenticate, and monitor channels linked to your SocialSilico workspace</p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => fetchMe()} title="Refresh status">
          <RefreshCw size={14} /> Refresh Channels
        </button>
      </div>

      {/* Platforms List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PLATFORMS.map(platform => {
          const account = getAccount(platform.id);
          const isConnected = !!account;
          const isActive = account?.isActive;

          return (
            <div
              key={platform.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderLeft: `4px solid ${platform.color}`,
                border: `1px solid ${isConnected ? 'var(--border)' : 'var(--border-subtle)'}`,
                borderRadius: 16,
                gap: 20,
                flexWrap: 'wrap'
              }}
            >
              {/* Left Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 260 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${platform.color}15`,
                  color: platform.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 800, flexShrink: 0
                }}>
                  {platform.icon}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                      {platform.name}
                    </h3>
                    {isConnected && (
                      <span className={`badge badge-${isActive ? 'success' : 'warning'}`}>
                        {isActive ? '● Active' : 'Paused'}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {isConnected ? (
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        Connected as: {account.platformUsername || account.platformName || 'Linked Channel'}
                      </span>
                    ) : (
                      platform.description
                    )}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isConnected ? (
                  <>
                    <button
                      className={`btn btn-sm ${isActive ? 'btn-ghost' : 'btn-secondary'}`}
                      onClick={() => handleToggle(account._id, isActive)}
                      disabled={toggling === account._id}
                    >
                      {isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDisconnect(account._id, platform.name)}
                      disabled={disconnecting === account._id}
                      style={{ gap: 6 }}
                    >
                      <Unlink size={14} /> Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenConnect(platform)}
                    style={{ gap: 6 }}
                  >
                    <Plus size={14} /> Connect {platform.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Account Modal */}
      {modalPlatform && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setModalPlatform(null)}>
          <div
            className="card"
            style={{ maxWidth: 460, width: '100%', borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem', color: modalPlatform.color }}>{modalPlatform.icon}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Link {modalPlatform.name} Channel
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalPlatform(null)}>
                <X size={16} />
              </button>
            </div>

            {/* OAuth Quick Connect if available */}
            {modalPlatform.connectUrl && (
              <div style={{ marginBottom: 18 }}>
                <button
                  className="oauth-btn"
                  onClick={() => handleOAuthConnect(modalPlatform)}
                  style={{ width: '100%', justifyContent: 'center', gap: 8, background: 'var(--bg-elevated)' }}
                >
                  <span style={{ color: modalPlatform.color }}>{modalPlatform.icon}</span> Connect via {modalPlatform.name} OAuth
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
                  placeholder={modalPlatform.id === 'instagram' ? 'e.g. @itsmrahmadasghar' : 'e.g. @myhandle'}
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
                  placeholder="e.g. Muhammad Ahmad - Official"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalPlatform(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={connecting} style={{ gap: 6 }}>
                  {connecting ? 'Linking...' : 'Save & Link Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
