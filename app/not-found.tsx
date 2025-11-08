// app/not-found.tsx
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
        The page you're looking for doesn't exist.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
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
          Go Home
        </Link>
        <Link
          href="/login"
          style={{
            padding: '0.75rem 2rem',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: '600',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
            border: '2px solid white'
          }}
        >
          Admin Login
        </Link>
      </div>
    </div>
  );
}

