import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, BarChart3, Clock, ArrowRight, Check } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const features = [
  { icon: Zap, title: 'One-Click Publishing', desc: 'Post to all your social media accounts simultaneously with a single click.' },
  { icon: Clock, title: 'Smart Scheduling', desc: 'Schedule posts to go live at the perfect time for maximum engagement.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track performance, engagement, and growth across all platforms.' },
  { icon: Shield, title: 'Secure OAuth Login', desc: 'We never store your social media passwords. Pure OAuth 2.0.' },
];

const platforms = [
  { name: 'Twitter / X', color: '#1DA1F2', icon: '𝕏' },
  { name: 'Facebook', color: '#1877F2', icon: 'f' },
  { name: 'Instagram', color: '#E1306C', icon: '📷' },
  { name: 'LinkedIn', color: '#0A66C2', icon: 'in' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>🐝</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.4rem',
            background: 'linear-gradient(135deg, #F5C518, #F97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>SocialBee</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost">Log In</Link>
          <Link to="/login" className="btn btn-primary">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '100px 40px 80px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(245,197,24,0.12) 0%, transparent 70%)',
      }}>
        <h1 className="display-xl" style={{ marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
          Manage All Your<br />
          <span style={{
            background: 'linear-gradient(135deg, #F5C518, #F97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Social Media</span> in One Place
        </h1>

        <p style={{
          fontSize: '1.2rem', color: 'var(--text-secondary)',
          maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7
        }}>
          Connect your Twitter, Facebook, Instagram, and LinkedIn accounts. 
          Create once, post everywhere — with zero password sharing.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary btn-lg">
            Start for Free <ArrowRight size={18} />
          </Link>
          <a href="#features" className="btn btn-secondary btn-lg">See Features</a>
        </div>

        {/* Platform icons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap' }}>
          {platforms.map(p => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontSize: '0.9rem', fontWeight: 600,
            }}>
              <span style={{ color: p.color, fontSize: '1.1rem' }}>{p.icon}</span>
              {p.name}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: '2.2rem', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>
            Everything you need to grow
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Powerful tools built for creators, agencies, and brands.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <f.icon size={24} color="var(--bee-yellow)" />
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 40px', textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 80% at 50% 100%, rgba(245,197,24,0.08) 0%, transparent 70%)',
      }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.2rem', marginBottom: 16 }}>
          Ready to become a Social Bee? 🐝
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.1rem' }}>
          Join creators who manage their entire social media presence from one dashboard.
        </p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Get Started — It's Free <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '32px 40px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'
      }}>
        © 2026 SocialBee. Built with ❤️ for creators.
      </footer>
    </div>
  );
}
