// app/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', color: 'white', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</h1>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          License Management System
        </h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Secure license management with auto-trial and admin dashboard
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>🎯 Features</h3>
            <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>✅ Auto 1-day trial per device</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Device fingerprinting</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ RSA-2048 license signing</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Admin dashboard</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Activity logging</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ SQL Server backend</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                padding: '0.75rem 2rem',
                background: 'white',
                color: '#764ba2',
                fontWeight: '600',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Admin Login
            </Link>
            <a
              href="/api/health"
              style={{
                padding: '0.75rem 2rem',
                background: '#764ba2',
                color: 'white',
                fontWeight: '600',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              API Health
            </a>
          </div>
        </div>

        <div style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.75 }}>
          <p>📖 <a href="/README.md" style={{ color: 'white', textDecoration: 'underline' }}>Documentation</a></p>
        </div>
      </div>
    </div>
  );
}

