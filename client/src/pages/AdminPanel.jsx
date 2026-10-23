import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Shield,
  Users,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Activity,
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  FileCheck,
  Tag,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [organizers, setOrganizers] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // User filter & search state
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [orgRes, statRes, sympRes, userRes] = await Promise.all([
        api.get('/admin/organizers'),
        api.get('/admin/stats'),
        api.get('/admin/symposiums'),
        api.get('/admin/users'),
      ]);
      setOrganizers(orgRes.data.organizers || []);
      setStats(statRes.data.stats || null);
      setSymposiums(sympRes.data.symposiums || []);
      setUsers(userRes.data.users || []);
    } catch (err) {
      setError('Error loading administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganizer = async (userId, status) => {
    setMessage('');
    setError('');
    try {
      const res = await api.patch(`/admin/organizers/${userId}/approve`, { status });
      setMessage(res.data.message);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating organizer approval status.');
    }
  };

  const handleApproveSymposium = async (id, isApproved) => {
    setMessage('');
    setError('');
    try {
      const res = await api.patch(`/admin/symposiums/${id}/approve`, { isApproved });
      setMessage(res.data.message);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating symposium approval status.');
    }
  };

  const handleApproveEvent = async (id, isApproved) => {
    setMessage('');
    setError('');
    try {
      const res = await api.patch(`/admin/events/${id}/approve`, { isApproved });
      setMessage(res.data.message);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating event approval status.');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    setMessage('');
    setError('');
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      setMessage(res.data.message);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user status.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          label: 'Total Users',
          value: stats.totalUsers,
          sub: 'Registered platform users',
          icon: <Users size={20} />,
          color: 'var(--primary)',
          glow: 'rgba(99, 102, 241, 0.2)',
        },
        {
          label: 'Organizers',
          value: stats.totalOrganizers,
          sub: `${stats.pendingOrganizers} Pending Approval`,
          icon: <Building size={20} />,
          color: 'var(--accent-cyan)',
          glow: 'rgba(6, 182, 212, 0.2)',
        },
        {
          label: 'Symposiums',
          value: stats.totalSymposiums,
          sub: `${stats.pendingSymposiums || 0} Pending Approvals`,
          icon: <Calendar size={20} />,
          color: 'var(--accent-emerald)',
          glow: 'rgba(16, 185, 129, 0.2)',
        },
        {
          label: 'Registrations',
          value: stats.totalRegistrations,
          sub: `${stats.totalEvents} Total Events`,
          icon: <TrendingUp size={20} />,
          color: 'var(--accent-purple)',
          glow: 'rgba(168, 85, 247, 0.2)',
        },
      ]
    : [];

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.college && u.college.toLowerCase().includes(userSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">
          Platform control center — approvals, symposium governance, user access management, and security oversight
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Stat Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          {statCards.map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: stat.color }}>
                  {stat.label}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: `${stat.glow}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.15rem', color: 'var(--text-bright)' }}>{stat.value}</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{stat.sub}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-nav" style={{ marginBottom: '2rem' }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <Shield size={16} /> Organizer Approvals ({organizers.filter((o) => o.organizerProfile?.status === 'PENDING').length} Pending)
        </button>
        <button className={`tab-btn ${activeTab === 'symposiums' ? 'active' : ''}`} onClick={() => setActiveTab('symposiums')}>
          <Calendar size={16} /> Symposium & Event Approvals ({symposiums.filter((s) => !s.isApproved).length} Pending)
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={16} /> All Platform Users ({users.length})
        </button>
      </div>

      {/* ── TAB 1: Organizer Review & Approvals ── */}
      {activeTab === 'overview' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--accent-amber)" /> Organizer Verification & Review
          </h3>

          {organizers.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No organizer accounts found.</p>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organizer</th>
                    <th>College / Dept</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizers.map((org) => {
                    const status = org.organizerProfile?.status || 'PENDING';
                    return (
                      <tr key={org.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-bright)', display: 'block' }}>{org.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{org.email}</span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)' }}>{org.organizerProfile?.college || org.college}</span>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{org.organizerProfile?.department}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{org.phone || org.organizerProfile?.phone || 'N/A'}</td>
                        <td>
                          <span className={`status-chip ${status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'danger' : 'warning'}`}>
                            {status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleApproveOrganizer(org.id, 'APPROVED')}
                              className="btn btn-success btn-sm"
                              disabled={status === 'APPROVED'}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleApproveOrganizer(org.id, 'REJECTED')}
                              className="btn btn-danger btn-sm"
                              disabled={status === 'REJECTED'}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Symposium & Event Review / Approval ── */}
      {activeTab === 'symposiums' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={18} color="var(--primary)" /> Symposium & Event Moderation
          </h3>

          {symposiums.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No symposiums submitted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {symposiums.map((symp) => (
                <div
                  key={symp.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-bright)' }}>{symp.title}</h4>
                        <span className={`status-chip ${symp.isApproved ? 'success' : 'warning'}`}>
                          {symp.isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
                        </span>
                        <span className={`badge ${symp.isPublished ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                          {symp.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        <strong>{symp.college}</strong> | Organizer: {symp.organizer?.name} ({symp.organizer?.email})
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {symp.isApproved ? (
                        <button onClick={() => handleApproveSymposium(symp.id, false)} className="btn btn-danger btn-sm">
                          <X size={14} /> Reject / Revoke
                        </button>
                      ) : (
                        <button onClick={() => handleApproveSymposium(symp.id, true)} className="btn btn-success btn-sm">
                          <Check size={14} /> Approve Symposium
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nested Events Under Symposium */}
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                      Associated Events ({symp.events?.length || 0})
                    </h5>

                    {symp.events?.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No events added to this symposium.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {symp.events.map((evt) => (
                          <div
                            key={evt.id}
                            style={{
                              background: 'rgba(0, 0, 0, 0.25)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bright)' }}>{evt.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {evt.category} | Fee: ₹{evt.fee} | Cap: {evt.capacity}
                              </div>
                              <span className={`status-chip ${evt.isApproved ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                                {evt.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </div>

                            <button
                              onClick={() => handleApproveEvent(evt.id, !evt.isApproved)}
                              className={`btn btn-sm ${evt.isApproved ? 'btn-danger' : 'btn-success'}`}
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              {evt.isApproved ? 'Reject' : 'Approve'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: User & Participant Management ── */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Users size={18} color="var(--accent-purple)" /> Registered User Accounts
            </h3>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, college..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.82rem', width: '220px' }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-input"
                style={{ height: '36px', fontSize: '0.82rem', width: '140px' }}
              >
                <option value="ALL">All Roles</option>
                <option value="PARTICIPANT">Participants</option>
                <option value="ORGANIZER">Organizers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Institution / College</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Account Access</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-bright)', display: 'block' }}>{u.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{u.email}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'ADMIN'
                              ? 'badge-primary'
                              : u.role === 'ORGANIZER'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.college || 'N/A'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {u.role === 'PARTICIPANT'
                          ? `${u._count?.registrations || 0} Registrations`
                          : `${u._count?.symposiums || 0} Symposiums`}
                      </td>
                      <td>
                        <span className={`status-chip ${u.isApproved ? 'success' : 'danger'}`}>
                          {u.isApproved ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`btn btn-sm ${u.isApproved ? 'btn-danger' : 'btn-success'}`}
                            style={{ gap: '4px' }}
                          >
                            {u.isApproved ? (
                              <>
                                <UserX size={13} /> Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} /> Activate
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
