'use client';
// app/login/page.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save token
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
      }

      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '0.5rem'
          }}>
            🔐
          </div>
                <h1 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '0 0 20px rgba(102, 126, 234, 0.8)'
                }}>
                  License Management
                </h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginTop: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Sign in to your account
                </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: error.includes('Database') ? '#fef3c7' : '#fef2f2',
            border: `1px solid ${error.includes('Database') ? '#fde68a' : '#fecaca'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: error.includes('Database') ? '#92400e' : '#991b1b',
            fontSize: '0.875rem'
          }}>
            {error}
            {error.includes('Database') && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
                Vui lòng kiểm tra SQL Server đang chạy và DATABASE_URL trong file .env
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem'
                  }}>
                    Email
                  </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              disabled={loading}
              style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      background: loading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.5)';
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem'
                  }}>
                    Password
                  </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
              style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      background: loading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.5)';
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4), 0 0 20px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6), 0 0 30px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4), 0 0 20px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          License Management System
        </div>
      </div>
    </div>
  );
}
