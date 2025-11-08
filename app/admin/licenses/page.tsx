'use client';
// app/admin/licenses/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  device?: {
    deviceId: string;
    hostname: string | null;
  };
}

export default function LicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [filters, setFilters] = useState({
    status: '',
    toolType: '',
    type: '',
    search: '', // Search by device ID, owner, or license key
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'all' | 'trial'>('all'); // 'all' or 'trial'

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get user role
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setUserRole(user.role || 'ADMIN');
      } catch (e) {
        // Ignore
      }
    }
    
    fetchLicenses();
  }, [page, filters, viewMode]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.status && { status: filters.status }),
        ...(filters.toolType && { toolType: filters.toolType }),
        ...(viewMode === 'trial' ? { type: 'TRIAL' } : filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search }), // General search
      });

      const res = await fetch(`/api/admin/licenses?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setLicenses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (licenseId: string) => {
    if (!confirm('Are you sure you want to revoke this license?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/license/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ licenseId }),
      });

      const data = await res.json();
      if (data.success) {
        fetchLicenses();
      } else {
        alert(data.error || 'Failed to revoke license');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const handleExtend = async (licenseId: string) => {
    const daysInput = prompt('Enter number of days to extend:');
    if (!daysInput) return;
    
    const days = parseInt(daysInput);
    if (isNaN(days) || days <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/license/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ licenseId, days }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || 'License extended successfully');
        fetchLicenses();
      } else {
        alert(data.error || 'Failed to extend license');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('License key copied to clipboard!');
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.toolType && { toolType: filters.toolType }),
        ...(viewMode === 'trial' ? { type: 'TRIAL' } : filters.type && { type: filters.type }),
      });

      const res = await fetch(`/api/admin/licenses/export?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) {
        alert('Failed to export licenses');
        return;
      }

      // Download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `licenses_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export licenses');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
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
              {viewMode === 'trial' ? 'Trial Licenses' : 'Licenses'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleExport}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => router.push('/admin/licenses/create')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Create License
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          <button
            onClick={() => {
              setViewMode('all');
              setPage(1);
            }}
            style={{
              padding: '0.5rem 1.5rem',
              background: viewMode === 'all' ? '#667eea' : 'transparent',
              color: viewMode === 'all' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All Licenses
          </button>
          <button
            onClick={() => {
              setViewMode('trial');
              setPage(1);
            }}
            style={{
              padding: '0.5rem 1.5rem',
              background: viewMode === 'trial' ? '#667eea' : 'transparent',
              color: viewMode === 'trial' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Trial Licenses
          </button>
        </div>

        {/* Filters */}
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
          {/* Search Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by Device ID, Owner, or License Key..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
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
          
          {/* Filter Dropdowns */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.9)',
              marginRight: '0.5rem'
            }}>
              Status:
            </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'rgba(255, 255, 255, 0.15)',
                minWidth: '140px',
                cursor: 'pointer',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
              }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>

          <label style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginLeft: '1rem',
            marginRight: '0.5rem'
          }}>
            Tool:
          </label>
          <select
            value={filters.toolType}
            onChange={(e) => setFilters({ ...filters, toolType: e.target.value })}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'rgba(255, 255, 255, 0.15)',
                minWidth: '140px',
                cursor: 'pointer',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
              }}
          >
            <option value="">All Tools</option>
            <option value="veo">Veo</option>
            <option value="voice">Voice</option>
          </select>

          {viewMode === 'all' && (
            <>
              <label style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginLeft: '1rem',
                marginRight: '0.5rem'
              }}>
                Type:
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'rgba(255, 255, 255, 0.15)',
                minWidth: '140px',
                cursor: 'pointer',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
              }}
              >
                <option value="">All Types</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="LIFETIME">Lifetime</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </>
          )}
          </div>
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
          ) : licenses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              No licenses found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Device ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Tool</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Owner</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Expires</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((license) => (
                  <tr 
                    key={license.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'background 0.2s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', transition: 'color 0.2s ease' }}>
                      {license.deviceId}
                      {license.device?.hostname && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>{license.device.hostname}</div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', transition: 'color 0.2s ease' }}>{license.toolType}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', transition: 'color 0.2s ease' }}>{license.type}</td>
                    <td style={{ padding: '1rem', transition: 'color 0.2s ease' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: license.status === 'ACTIVE' ? '#dcfce7' : license.status === 'EXPIRED' ? '#fef3c7' : '#fee2e2',
                        color: license.status === 'ACTIVE' ? '#166534' : license.status === 'EXPIRED' ? '#92400e' : '#991b1b'
                      }}>
                        {license.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', transition: 'color 0.2s ease' }}>{license.owner || '-'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', transition: 'color 0.2s ease' }}>
                      {new Date(license.expiresAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => router.push(`/admin/licenses/${license.id}`)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(102, 126, 234, 0.3)',
                            border: '1px solid rgba(102, 126, 234, 0.5)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: '#ffffff',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.5)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => copyLicenseKey(license.licenseKey)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: '#ffffff',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Copy
                        </button>
                        {license.status === 'ACTIVE' && (
                          <>
                            {/* Trial licenses cannot be extended */}
                            {license.type !== 'TRIAL' && userRole !== 'RESELLER' && (
                              <button
                                onClick={() => handleExtend(license.id)}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  background: 'rgba(59, 130, 246, 0.3)',
                                  border: '1px solid rgba(59, 130, 246, 0.5)',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  backdropFilter: 'blur(10px)',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.5)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                Extend
                              </button>
                            )}
                            <button
                              onClick={() => handleRevoke(license.id)}
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(239, 68, 68, 0.3)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                color: '#ffffff',
                                cursor: 'pointer',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                background: page === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
            >
              Previous
            </button>
            <span style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', color: '#ffffff' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.5rem 1rem',
                background: page === totalPages ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (page !== totalPages) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== totalPages) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

