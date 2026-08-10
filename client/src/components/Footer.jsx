import React from 'react';
import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#060910',
      borderTop: '1px solid var(--border-color)',
      padding: '2.5rem 1.5rem',
      marginTop: 'auto',
      color: 'var(--text-muted)',
      fontSize: '0.875rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Cpu size={20} color="var(--primary)" />
          <span style={{ fontWeight: 700, color: '#ffffff' }}>Unified Symposium Management Platform</span>
        </div>

        <div>
          <span>© {new Date().getFullYear()} SympoHub. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
