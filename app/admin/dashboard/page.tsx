'use client';
// app/admin/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  totalDevices: number;
  recentActivities: any[];
}

interface ResellerStats {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
  packageCounts: Record<string, number>;
  toolCounts: Record<string, number>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [resellerStats, setResellerStats] = useState<ResellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

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

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Get user role first
      const adminUser = localStorage.getItem('adminUser');
      let role = 'ADMIN';
      if (adminUser) {
        try {
          const user = JSON.parse(adminUser);
          role = user.role || 'ADMIN';
        } catch (e) {
          // Ignore
        }
      }

      // Fetch appropriate stats
      if (role === 'RESELLER') {
        const res = await fetch('/api/admin/stats/reseller', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (data.success) {
          setResellerStats(data.data);
        }
      } else {
        const res = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f3f4f6'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e0e7ff',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>
            License Management Dashboard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {userRole === 'RESELLER' ? (
            <>
              <StatCard
                title="Total Licenses"
                value={resellerStats?.totalLicenses || 0}
                icon="📄"
                color="#3b82f6"
              />
              <StatCard
                title="Active Licenses"
                value={resellerStats?.activeLicenses || 0}
                icon="✅"
                color="#10b981"
              />
              <StatCard
                title="Expired Licenses"
                value={resellerStats?.expiredLicenses || 0}
                icon="⏰"
                color="#f59e0b"
              />
              <StatCard
                title="Revoked Licenses"
                value={resellerStats?.revokedLicenses || 0}
                icon="🚫"
                color="#ef4444"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total Licenses"
                value={stats?.totalLicenses || 0}
                icon="📄"
                color="#3b82f6"
              />
              <StatCard
                title="Active Licenses"
                value={stats?.activeLicenses || 0}
                icon="✅"
                color="#10b981"
              />
              <StatCard
                title="Expired Licenses"
                value={stats?.expiredLicenses || 0}
                icon="⏰"
                color="#f59e0b"
              />
              <StatCard
                title="Total Devices"
                value={stats?.totalDevices || 0}
                icon="💻"
                color="#8b5cf6"
              />
            </>
          )}
        </div>

        {/* Reseller Package Stats */}
        {userRole === 'RESELLER' && resellerStats && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '1rem',
              textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
            }}>
              Licenses by Package
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {Object.entries(resellerStats.packageCounts).map(([pkg, count]) => (
                <div key={pkg} style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>
                    {pkg.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reseller Tool Stats */}
        {userRole === 'RESELLER' && resellerStats && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '1rem',
              textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
            }}>
              Licenses by Tool Type
            </h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {Object.entries(resellerStats.toolCounts).map(([tool, count]) => (
                <div key={tool} style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  flex: 1,
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>
                    {tool}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '1rem',
            textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <button
              onClick={() => router.push(userRole === 'RESELLER' ? '/reseller/license/create' : '/admin/licenses/create')}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              ➕ {userRole === 'RESELLER' ? 'Create License (Reseller)' : 'Create License'}
            </button>
            <button
              onClick={() => router.push('/admin/licenses')}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(75, 85, 99, 0.6)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(75, 85, 99, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(75, 85, 99, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📋 View All Licenses
            </button>
            <button
              onClick={() => router.push('/admin/devices')}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(75, 85, 99, 0.6)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(75, 85, 99, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(75, 85, 99, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💻 View Devices
            </button>
            {userRole !== 'RESELLER' && (
              <>
                <button
                  onClick={() => router.push('/admin/resellers/create')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  👤 Create Reseller
                </button>
                <button
                  onClick={() => router.push('/admin/resellers')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#4b5563',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  👥 View Resellers
                </button>
              </>
            )}
            {userRole === 'RESELLER' ? (
              <button
                onClick={() => router.push('/admin/activities/own')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                📊 My Activities
              </button>
            ) : (
              <button
                onClick={() => router.push('/admin/activities')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                📊 Activity Log
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity - Only visible to Admin */}
        {userRole !== 'RESELLER' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}>
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
              }}>
                Recent Activity
              </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity: any, index: number) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: index < stats.recentActivities.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                  }}>
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#ffffff',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {activity.action}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: 0
                      }}>
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {activity.admin?.email || 'System'}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      padding: '1.5rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(102, 126, 234, 0.5)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
    }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 0.5rem 0'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
          }}>
            {value}
          </p>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: `0 0 20px ${color}80`,
          transition: 'all 0.3s ease'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

