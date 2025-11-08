'use client';
// app/admin/devices/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Device {
  deviceId: string;
  hostname: string | null;
  firstSeen: string;
  lastSeen: string;
  _count: {
    licenses: number;
  };
}

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDevices();
  }, [search]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/devices?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setDevices(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>
            Devices
          </h1>
        </div>

        {/* Search */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          <input
            type="text"
            placeholder="Search by Device ID or Hostname..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>

        {/* Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading...
            </div>
          ) : devices.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              No devices found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Device ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Hostname</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>First Seen</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Last Seen</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Licenses</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.deviceId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', fontFamily: 'monospace' }}>
                      {device.deviceId}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff' }}>
                      {device.hostname || '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff' }}>
                      {new Date(device.firstSeen).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff' }}>
                      {new Date(device.lastSeen).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff' }}>
                      {device._count.licenses}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
