import React, { useState, useEffect } from 'react';
import { Link2, Unlink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore, { api } from '../store/authStore';

const PLATFORMS = [
  {
    id: 'twitter', name: 'Twitter / X', color: '#1DA1F2', icon: '𝕏',
    description: 'Post tweets and threads',
    connectUrl: '/api/auth/twitter',
  },
  {
    id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'f',
    description: 'Post to Facebook Pages',
    connectUrl: '/api/auth/facebook',
  },
  {
    id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📷',
    description: 'Post images to Instagram Business',
    connectNote: 'Requires Facebook Business account',
  },
  {
    id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'in',
    description: 'Share professional updates',
    connectNote: 'Connect via LinkedIn OAuth',
  },
];

export default function Accounts() {
  const { user, fetchMe } = useAuthStore();
  const [disconnecting, setDisconnecting] = useState(null);
  const [toggling, setToggling] = useState(null);

  const connectedAccounts = user?.connectedAccounts || [];

  const getAccount = (platformId) => connectedAccounts.find(a => a.platform === platformId);

  const handleConnect = (platform) => {
    if (platform.connectUrl) {
      window.location.href = platform.connectUrl;
    } else {
      toast('Coming soon! Add your credentials in Account Settings.', { icon: '🔧' });
    }
  };

  const handleDisconnect = async (accountId, platformName) => {
    if (!confirm(`Disconnect ${platformName}?`)) return;
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
      toast.error('Failed to update');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Connected Accounts 🔗</h1>
        <p className="page-subtitle">Manage your social media accounts for posting</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PLATFORMS.map(platform => {
          const account = getAccount(platform.id);
          const isConnected = !!account;

          return (
            <div key={platform.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              borderColor: isConnected ? `${platform.color}40` : 'var(--border)',
            }}>
              {/* Platform Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${platform.color}20`,
                border: `2px solid ${platform.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', color: platform.color, flexShrink: 0
              }}>
                {platform.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{platform.name}</h3>
                  {isConnected && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700,
                      background: account.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                      color: account.isActive ? 'var(--success)' : 'var(--warning)',
                    }}>
                      {account.isActive ? '● Active' : '⏸ Paused'}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isConnected ? (
                    <span>@{account.platformUsername || account.platformName || account.platformUserId}</span>
                  ) : (
                    platform.description
                  )}
                </p>
                {!isConnected && platform.connectNote && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    ℹ️ {platform.connectNote}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {isConnected ? (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggle(account._id, account.isActive)}
                      disabled={toggling === account._id}
                    >
                      {toggling === account._id ? <div className="spinner" /> : account.isActive ? '⏸ Pause' : '▶ Activate'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDisconnect(account._id, platform.name)}
                      disabled={disconnecting === account._id}
                    >
                      {disconnecting === account._id ? <div className="spinner" /> : <><Unlink size={14} /> Disconnect</>}
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => handleConnect(platform)}>
                    <Link2 size={14} /> Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div style={{
        marginTop: 32, padding: '16px 20px', borderRadius: 12,
        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
        display: 'flex', gap: 12, alignItems: 'flex-start'
      }}>
        <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 4, color: 'var(--success)' }}>
            Your passwords are never stored
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            SocialSilico uses OAuth 2.0 for all connections. We only receive access tokens with 
            the specific permissions you grant. You can revoke access at any time from each platform's settings.
          </p>
        </div>
      </div>
    </div>
  );
}
