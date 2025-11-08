'use client';
// app/reseller/license/create/page.tsx
// Trang tạo license cho reseller (chỉ với các gói cố định)
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Device {
  deviceId: string;
  hostname: string | null;
  firstSeen: string;
}

export default function ResellerCreateLicensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [formData, setFormData] = useState({
    deviceId: '',
    toolType: 'veo' as 'veo' | 'voice',
    owner: '',
    package: '1_MONTH' as '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR' | '2_YEARS',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Check if user is reseller
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        if (user.role !== 'RESELLER') {
          router.push('/admin/dashboard');
          return;
        }
      } catch (e) {
        router.push('/login');
        return;
      }
    }
    
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/devices', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDevices(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/reseller/license/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to create license');
        return;
      }

      setSuccess(data.message || 'License created successfully!');
      setFormData({
        deviceId: '',
        toolType: 'veo',
        owner: '',
        package: '1_MONTH',
      });

      setTimeout(() => {
        router.push('/admin/licenses');
      }, 1500);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const packageLabels = {
    '1_MONTH': '1 Tháng (30 ngày)',
    '3_MONTHS': '3 Tháng (90 ngày)',
    '6_MONTHS': '6 Tháng (180 ngày)',
    '1_YEAR': '1 Năm (365 ngày)',
    '2_YEARS': '2 Năm (730 ngày)',
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>
            Create License (Reseller)
          </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>
            Chọn gói license: 1 tháng, 3 tháng, 6 tháng, 1 năm, hoặc 2 năm
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          position: 'relative',
          overflow: 'visible'
        }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#991b1b'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#166534'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Device ID */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '0.5rem'
              }}>
                Device ID *
              </label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                required
                placeholder="Enter device ID"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {devices.length > 0 && (
                <select
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.5rem 2rem 0.5rem 0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    background: 'white',
                    color: '#111827',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23374151\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="">Or select from existing devices...</option>
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.deviceId} {d.hostname ? `(${d.hostname})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tool Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '0.5rem'
              }}>
                Tool Type *
              </label>
              <select
                value={formData.toolType}
                onChange={(e) => setFormData({ ...formData, toolType: e.target.value as 'veo' | 'voice' })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 2rem 0.75rem 0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23374151\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="veo">Veo</option>
                <option value="voice">Voice</option>
              </select>
            </div>

            {/* Package Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '0.5rem'
              }}>
                Package *
              </label>
              <select
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value as any })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 2rem 0.75rem 0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23374151\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="1_MONTH">{packageLabels['1_MONTH']}</option>
                <option value="3_MONTHS">{packageLabels['3_MONTHS']}</option>
                <option value="6_MONTHS">{packageLabels['6_MONTHS']}</option>
                <option value="1_YEAR">{packageLabels['1_YEAR']}</option>
                <option value="2_YEARS">{packageLabels['2_YEARS']}</option>
              </select>
            </div>

            {/* Owner */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '0.5rem'
              }}>
                Owner (Optional)
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Enter owner name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#5568d3';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#667eea';
                }
              }}
            >
              {loading ? 'Creating...' : 'Create License'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

