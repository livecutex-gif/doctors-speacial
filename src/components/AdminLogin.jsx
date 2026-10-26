import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, AlertCircle, Plus } from 'lucide-react';
import { adminLogin } from '../lib/supabase';

export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your staff email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminLogin(email, password);
      onLoginSuccess(result?.session || result?.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Top Bar with Back Button */}
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
        <button
          onClick={onBackToSite}
          className="btn-pill btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Clinic Site</span>
        </button>
      </div>

      {/* Centered Login Card */}
      <div 
        className="prime-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.25rem 1.75rem',
          borderRadius: '24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.08)'
        }}
      >
        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Plus size={30} strokeWidth={3} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            Staff & Doctor Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Access to OPD queue, appointments & settings
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div 
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '14px',
              padding: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              color: '#991B1B',
              fontSize: '0.82rem'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Clinic Staff Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="prime-input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="prime-input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="current-password"
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill btn-primary"
            style={{
              padding: '0.875rem',
              fontSize: '0.95rem',
              width: '100%',
              marginTop: '0.5rem',
              opacity: isLoading ? 0.75 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In to OPD Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}
