'use client';
// app/admin/activities/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Activity {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: {
    email: string;
    name: string;
  } | null;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Check if user is reseller - resellers should use /admin/activities/own instead
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        if (user.role === 'RESELLER') {
          router.push('/admin/activities/own');
          return;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    fetchActivities();
  }, [page, filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filter && { action: filter }),
      });

      const res = await fetch(`/api/admin/activities?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setActivities(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseDetails = (details: string | null): any => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return parsed;
    } catch {
      return details;
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
            Activity Logs
          </h1>
        </div>

        {/* Filter */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Filter by Action:
          </label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.5rem 2rem 0.5rem 0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              background: 'rgba(255, 255, 255, 0.15)',
              minWidth: '180px',
              cursor: 'pointer',
              color: '#ffffff',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="CREATE_LICENSE">Create License (Admin)</option>
            <option value="SELLER_ADD">Seller Add License</option>
            <option value="CREATE_RESELLER">Create Reseller</option>
            <option value="REVOKE_LICENSE">Revoke License</option>
            <option value="EXTEND_LICENSE">Extend License</option>
          </select>
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
          ) : activities.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              No activities found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Time</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Action</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Admin</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>Details</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => {
                  const details = parseDetails(activity.details);
                  return (
                    <tr 
                      key={activity.id} 
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
                        {new Date(activity.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: 'rgba(102, 126, 234, 0.3)',
                          color: '#ffffff',
                          border: '1px solid rgba(102, 126, 234, 0.5)'
                        }}>
                          {activity.action}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', transition: 'color 0.2s ease' }}>
                        {activity.admin ? activity.admin.email : 'System'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', transition: 'color 0.2s ease' }}>
                        {details && typeof details === 'object' ? (
                          <div>
                            {details.description && (
                              <div style={{ marginBottom: '0.5rem', fontWeight: '500', color: '#ffffff' }}>
                                {details.description}
                              </div>
                            )}
                            <details>
                              <summary style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.8)' }}>View Full Details</summary>
                              <pre style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                overflow: 'auto',
                                color: '#ffffff'
                              }}>
                                {JSON.stringify(details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        ) : (
                          details || '-'
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#ffffff', fontFamily: 'monospace', transition: 'color 0.2s ease' }}>
                        {activity.ipAddress || '-'}
                      </td>
                    </tr>
                  );
                })}
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
                background: page === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
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
                background: page === totalPages ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
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
