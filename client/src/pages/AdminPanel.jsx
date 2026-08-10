import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Users, Building, Calendar, CheckCircle2, XCircle, Clock, Award, Activity } from 'lucide-react';

export default function AdminPanel() {
  const [organizers, setOrganizers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgRes, statRes] = await Promise.all([
        api.get('/admin/organizers'),
        api.get('/admin/stats'),
      ]);
      setOrganizers(orgRes.data.organizers);
      setStats(statRes.data.stats);
    } catch (err) {
      setError('Error loading administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStatus = async (userId, status) => {
    setMessage('');
    setError('');
    try {
      const res = await api.patch(`/admin/organizers/${userId}/approve`, { status });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating approval status.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Shield size={32} color="var(--accent-amber)" />
          <h1 className="section-title">System Administrator Dashboard</h1>
        </div>
        <p className="section-subtitle">Platform control center for organizer approvals, security, and symposium monitoring</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Analytics Metric Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL USERS</span>
              <Users size={20} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats.totalUsers}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered accounts</span>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-cyan)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>ORGANIZERS</span>
              <Building size={20} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats.totalOrganizers}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats.pendingOrganizers} Pending Approval</span>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>SYMPOSIUMS</span>
              <Calendar size={20} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats.totalSymposiums}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats.totalEvents} Total Events</span>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-purple)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVITY</span>
              <Activity size={20} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats.totalRegistrations}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Event Registrations</span>
          </div>
        </div>
      )}

      {/* Organizer Approval Review List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--accent-amber)" /> Event Organizer Review & Approvals
        </h3>

        {organizers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No organizer accounts found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Organizer Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>College / Dept</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((org) => {
                  const status = org.organizerProfile?.status || 'PENDING';
                  return (
                    <tr key={org.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#ffffff' }}>
                        {org.name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{org.email}</div>
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                        {org.organizerProfile?.college || org.college}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{org.organizerProfile?.department}</div>
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                        {org.phone || org.organizerProfile?.phone || 'N/A'}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${
                          status === 'APPROVED' ? 'badge-success' : status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleApproveStatus(org.id, 'APPROVED')}
                            className="btn btn-success btn-sm"
                            disabled={status === 'APPROVED'}
                            title="Approve Organizer"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>

                          <button
                            onClick={() => handleApproveStatus(org.id, 'REJECTED')}
                            className="btn btn-danger btn-sm"
                            disabled={status === 'REJECTED'}
                            title="Reject Request"
                          >
                            <XCircle size={14} /> Reject
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
    </div>
  );
}
