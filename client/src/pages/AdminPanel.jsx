import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Users, Building, Calendar, CheckCircle2, XCircle, Clock, Award, Activity, TrendingUp } from 'lucide-react';

export default function AdminPanel() {
  const [organizers, setOrganizers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetchData(); }, []);

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
    setMessage(''); setError('');
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
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, sub: 'Registered accounts', icon: <Users size={20} />, color: 'var(--primary)', glow: 'rgba(99, 102, 241, 0.2)' },
    { label: 'Organizers', value: stats.totalOrganizers, sub: `${stats.pendingOrganizers} Pending Approval`, icon: <Building size={20} />, color: 'var(--accent-cyan)', glow: 'rgba(6, 182, 212, 0.2)' },
    { label: 'Symposiums', value: stats.totalSymposiums, sub: `${stats.totalEvents} Total Events`, icon: <Calendar size={20} />, color: 'var(--accent-emerald)', glow: 'rgba(16, 185, 129, 0.2)' },
    { label: 'Registrations', value: stats.totalRegistrations, sub: 'Event registrations', icon: <TrendingUp size={20} />, color: 'var(--accent-purple)', glow: 'rgba(168, 85, 247, 0.2)' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform control center — organizer approvals, security, and symposium monitoring</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Stat Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          {statCards.map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: stat.color }}>{stat.label}</span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                  background: `${stat.glow}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.15rem', color: 'var(--text-bright)' }}>{stat.value}</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{stat.sub}</span>
            </div>
          ))}
        </div>
      )}

      {/* Organizer Approval Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--accent-amber)" /> Organizer Review & Approvals
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
                      <td style={{ color: 'var(--text-muted)' }}>
                        {org.phone || org.organizerProfile?.phone || 'N/A'}
                      </td>
                      <td>
                        <span className={`status-chip ${status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'danger' : 'warning'}`}>
                          {status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleApproveStatus(org.id, 'APPROVED')}
                            className="btn btn-success btn-sm"
                            disabled={status === 'APPROVED'}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleApproveStatus(org.id, 'REJECTED')}
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
    </div>
  );
}
