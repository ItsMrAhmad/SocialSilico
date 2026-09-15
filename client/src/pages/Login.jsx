import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';
import SocialSilicoLogo from '../components/common/SocialSilicoLogo';

// OAuth provider configs
const providers = [
  {
    id: 'google',
    label: 'Continue with Google',
    color: '#fff',
    bg: '#4285F4',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
        <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
        <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
        <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    color: '#fff',
    bg: '#24292E',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'twitter',
    label: 'Continue with X (Twitter)',
    color: '#fff',
    bg: '#000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Continue with Facebook',
    color: '#fff',
    bg: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

export default function Login() {
  const [params] = useSearchParams();
  const error = params.get('error');

  const handleOAuth = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 80% at 50% -10%, rgba(124, 58, 237, 0.15) 0%, transparent 60%), var(--bg-base)',
      padding: 20,
      position: 'relative'
    }}>
      {/* Top Controls */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 24,
        right: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Home
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SocialSilicoLogo height={44} style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in to manage your social media
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, marginBottom: 24, color: 'var(--error)', fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            Login failed: {error.replace(/_/g, ' ')}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="card" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', marginBottom: 8, textAlign: 'center' }}>
            Choose how to sign in
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 16 }}>
            🔒 We never see or store your passwords
          </p>

          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => handleOAuth(provider.id)}
              className="oauth-btn"
              style={{
                background: provider.bg,
                color: provider.color,
                border: `1px solid ${provider.bg}`,
              }}
            >
              <span style={{ width: 20, height: 20, flexShrink: 0 }}>{provider.icon}</span>
              {provider.label}
            </button>
          ))}

          <div className="divider-text" style={{ margin: '8px 0' }}>
            <span>more providers</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            LinkedIn posting available after sign-in via Account Settings
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Built by{' '}
          <a
            href="https://techsistlabs.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--silico-violet)', fontWeight: 600, textDecoration: 'none' }}
          >
            TechsistLabs
          </a>
        </p>
      </div>
    </div>
  );
}
