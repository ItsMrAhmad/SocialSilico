import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error(`Login failed: ${error.replace(/_/g, ' ')}`);
      navigate('/login');
      return;
    }

    if (token) {
      setToken(token);
      toast.success('Welcome to SocialBee! 🐝');
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 20
    }}>
      <div style={{ fontSize: '3rem' }}>🐝</div>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-secondary)' }}>Signing you in...</p>
    </div>
  );
}
