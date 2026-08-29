import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Heart, Github, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(4, 6, 12, 0.9)',
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 2rem',
      marginTop: 'auto',
      color: 'var(--text-dim)',
      fontSize: '0.85rem',
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary-solid), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
          }}>
            <Cpu size={16} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            SympoHub — Unified Symposium Management Platform
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/verify-certificate" style={{ color: 'var(--text-dim)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={13} /> Verify Certificate
          </Link>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            © {new Date().getFullYear()} SympoHub
          </span>
        </div>
      </div>
    </footer>
  );
}
