import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Award, QrCode, CheckCircle2, Building, Sparkles } from 'lucide-react';

export default function ParticipantDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <User size={32} color="var(--primary)" />
          <h1 className="section-title">Participant Dashboard</h1>
        </div>
        <p className="section-subtitle">Track your registered symposium events, QR tickets, attendance, and certificates</p>
      </div>

      {/* User Info Overview Card */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              <Building size={14} /> {user?.college || 'Bannari Amman Institute of Technology'}
            </div>
          </div>

          <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            <CheckCircle2 size={16} /> Verified Participant Account
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>UPCOMING EVENTS</span>
            <Calendar size={20} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>1</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TechFest 2026</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-amber)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>QR TICKETS</span>
            <QrCode size={20} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>Ready</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket QR check-in ready for Part 5</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>CERTIFICATES</span>
            <Award size={20} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>0</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Issued upon attendance confirmation</span>
        </div>
      </div>
    </div>
  );
}
