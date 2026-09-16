import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import SocialSilicoLogo from '../components/common/SocialSilicoLogo';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMe, setToken } = useAuthStore();
  const [status, setStatus] = useState('Verifying your session...');

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error(`Login failed: ${error.replace(/_/g, ' ')}`);
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      setToken(token);
      setStatus('Loading your workspace...');
      fetchMe(token).then((success) => {
        if (success) {
          toast.success('Welcome to SocialSilico! 🚀');
          navigate('/dashboard', { replace: true });
        } else {
          toast.error('Could not verify credentials. Please try signing in again.');
          navigate('/login', { replace: true });
        }
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate, fetchMe, setToken]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 20,
      background: 'radial-gradient(ellipse 80% 80% at 50% -10%, rgba(124, 58, 237, 0.15) 0%, transparent 60%), var(--bg-base)'
    }}>
      <SocialSilicoLogo height={36} />
      <div className="spinner spinner-lg" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', borderTopColor: 'var(--silico-violet)' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{status}</p>
    </div>
  );
}
