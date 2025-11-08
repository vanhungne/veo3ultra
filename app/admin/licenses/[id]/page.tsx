'use client';
// app/admin/licenses/[id]/page.tsx
// License details page
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface License {
  id: string;
  licenseKey: string;
  deviceId: string;
  toolType: string;
  type: string;
  status: string;
  owner: string | null;
  expiresAt: string;
  issuedAt: string;
  lastUsed: string | null;
  revokedAt: string | null;
  device?: {
    deviceId: string;
    hostname: string | null;
    firstSeen: string;
    lastSeen: string;
  };
  metadata: string | null;
}

export default function LicenseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const licenseId = params.id as string;
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchLicense();
  }, [licenseId]);

  const fetchLicense = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/license/${licenseId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.status === 403) {
        alert('Access denied');
        router.push('/admin/licenses');
        return;
      }

      if (res.status === 404) {
        alert('License not found');
        router.push('/admin/licenses');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setLicense(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch license:', error);
      alert('Failed to load license details');
    } finally {
      setLoading(false);
    }
  };

  const copyLicenseKey = () => {
    if (license) {
      navigator.clipboard.writeText(license.licenseKey);
      alert('License key copied to clipboard!');
    }
  };

  const copyAll = () => {
    if (license) {
      const text = `License Key: ${license.licenseKey}\nDevice ID: ${license.deviceId}\nTool Type: ${license.toolType}\nType: ${license.type}\nStatus: ${license.status}\nOwner: ${license.owner || 'N/A'}\nExpires: ${new Date(license.expiresAt).toLocaleDateString()}`;
      navigator.clipboard.writeText(text);
      alert('License information copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading...</div>
      </div>
    );
  }

  if (!license) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px', padding: '2rem' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>License not found</p>
          <button
            onClick={() => router.push('/admin/licenses')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Licenses
          </button>
        </div>
      </div>
    );
  }

  // Parse metadata
  let metadata: any = null;
  if (license.metadata) {
    try {
      metadata = JSON.parse(license.metadata);
    } catch (e) {
      // Ignore
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.push('/admin/licenses')}
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
            ← Back to Licenses
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>
            License Details
          </h1>
        </div>

        {/* License Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', margin: 0, textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>
              License Information
            </h2>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '500',
              background: license.status === 'ACTIVE' ? '#dcfce7' : license.status === 'EXPIRED' ? '#fef3c7' : '#fee2e2',
              color: license.status === 'ACTIVE' ? '#166534' : license.status === 'EXPIRED' ? '#92400e' : '#991b1b'
            }}>
              {license.status}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* License Key */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                License Key
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <code style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)'
                }}>
                  {license.licenseKey}
                </code>
                <button
                  onClick={copyLicenseKey}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    color: '#ffffff',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  📋 Copy Key
                </button>
              </div>
            </div>

            {/* Device Info */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                Device ID
              </label>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
              }}>
                {license.deviceId}
              </div>
              {license.device?.hostname && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Hostname: {license.device.hostname}
                </div>
              )}
            </div>

            {/* Grid of details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                  Tool Type
                </label>
                <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>{license.toolType}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                  License Type
                </label>
                <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>{license.type}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                  Owner
                </label>
                <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>{license.owner || 'N/A'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                  Expires At
                </label>
                <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                  {new Date(license.expiresAt).toLocaleString()}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                  Issued At
                </label>
                <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                  {new Date(license.issuedAt).toLocaleString()}
                </div>
              </div>
              {license.lastUsed && (
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                    Last Used
                  </label>
                  <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                    {new Date(license.lastUsed).toLocaleString()}
                  </div>
                </div>
              )}
              {license.revokedAt && (
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                    Revoked At
                  </label>
                  <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                    {new Date(license.revokedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata (if reseller created) */}
            {metadata && metadata.resellerEmail && (
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                  Created by Reseller
                </label>
                <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>{metadata.resellerEmail}</div>
                {metadata.package && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Package: {metadata.package}
                  </div>
                )}
              </div>
            )}

            {/* Device Info */}
            {license.device && (
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>
                  Device Information
                </label>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>First Seen:</strong> {new Date(license.device.firstSeen).toLocaleString()}
                  </div>
                  <div>
                    <strong>Last Seen:</strong> {new Date(license.device.lastSeen).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={copyAll}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
              }}
            >
              📋 Copy All Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

