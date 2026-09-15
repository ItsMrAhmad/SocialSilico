import React from 'react';

/**
 * Official SocialSilico Logo Component
 * Supports icon-only or full wordmark, with dark/light theme awareness
 */
export default function SocialSilicoLogo({
  variant = 'horizontal', // 'horizontal' | 'icon' | 'stacked'
  height = 36,
  className = '',
  style = {}
}) {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        height={height}
        width={height}
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silico_grad_icon" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>
        <line x1="52" y1="52" x2="20" y2="78" stroke="url(#silico_grad_icon)" strokeWidth="6" strokeLinecap="round" />
        <line x1="52" y1="52" x2="82" y2="22" stroke="url(#silico_grad_icon)" strokeWidth="6" strokeLinecap="round" />
        <line x1="52" y1="52" x2="22" y2="24" stroke="url(#silico_grad_icon)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="20" cy="78" r="7.5" fill="#4F46E5" />
        <circle cx="22" cy="24" r="6.5" fill="#6D28D9" />
        <circle cx="82" cy="22" r="9.5" fill="#9333EA" />
        <circle cx="52" cy="52" r="10.5" fill="#7C3AED" />
      </svg>
    );
  }

  // Full Horizontal Lockup
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: height * 0.28,
        textDecoration: 'none',
        userSelect: 'none',
        ...style
      }}
    >
      <svg
        viewBox="0 0 100 100"
        height={height}
        width={height}
        style={{ flexShrink: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silico_grad_h" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>
        <line x1="52" y1="52" x2="20" y2="78" stroke="url(#silico_grad_h)" strokeWidth="6" strokeLinecap="round" />
        <line x1="52" y1="52" x2="82" y2="22" stroke="url(#silico_grad_h)" strokeWidth="6" strokeLinecap="round" />
        <line x1="52" y1="52" x2="22" y2="24" stroke="url(#silico_grad_h)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="20" cy="78" r="7.5" fill="#4F46E5" />
        <circle cx="22" cy="24" r="6.5" fill="#6D28D9" />
        <circle cx="82" cy="22" r="9.5" fill="#9333EA" />
        <circle cx="52" cy="52" r="10.5" fill="#7C3AED" />
      </svg>
      <span
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          fontSize: height * 0.68,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)'
        }}
      >
        Social<span style={{ color: '#7C3AED' }}>Silico</span>
      </span>
    </div>
  );
}
