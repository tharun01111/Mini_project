import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Shield, Cpu, User, LogOut, PlusCircle, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', letterSpacing: '-0.03em' }}>
              Sympo<span style={{ color: 'var(--accent-cyan)' }}>Hub</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-4px' }}>
              Symposium Management
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.95rem' }}>
            Explore Symposiums
          </Link>

          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
              <Shield size={16} color="var(--accent-amber)" /> Admin Panel
            </Link>
          )}

          {user && user.role === 'ORGANIZER' && (
            <Link to="/organizer" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
              <PlusCircle size={16} color="var(--accent-emerald)" /> Organizer Studio
            </Link>
          )}

          {user && user.role === 'PARTICIPANT' && (
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
              <Calendar size={16} color="var(--primary)" /> My Registrations
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>{user.name}</span>
                <span className={`badge ${
                  user.role === 'ADMIN' ? 'badge-warning' : user.role === 'ORGANIZER' ? 'badge-info' : 'badge-primary'
                }`} style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-danger btn-sm" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <Sparkles size={14} /> Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
