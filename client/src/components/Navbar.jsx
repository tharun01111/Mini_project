import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Shield, PlusCircle, Calendar, LogOut, Sparkles, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    color: isActive(path) ? 'var(--primary)' : 'var(--text-muted)',
    fontWeight: isActive(path) ? 700 : 500,
    fontSize: '0.9rem',
    padding: '0.4rem 0',
    borderBottom: isActive(path) ? '2px solid var(--primary-solid)' : '2px solid transparent',
    transition: 'var(--transition-fast)',
  });

  return (
    <header style={{
      background: 'rgba(6, 8, 15, 0.8)',
      backdropFilter: 'blur(20px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary-solid) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            <Cpu size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#ffffff',
              letterSpacing: '-0.03em',
            }}>
              Sympo<span style={{ color: 'var(--accent-cyan)' }}>Hub</span>
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.62rem',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '-3px',
            }}>
              Symposium Platform
            </span>
          </div>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '4px',
          }}
          className="mobile-menu-btn"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.75rem',
        }} className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/" style={navLinkStyle('/')} onClick={() => setMenuOpen(false)}>
            Explore
          </Link>

          <Link to="/verify-certificate" style={navLinkStyle('/verify-certificate')} onClick={() => setMenuOpen(false)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={15} /> Verify
            </span>
          </Link>

          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }} onClick={() => setMenuOpen(false)}>
              <Shield size={14} color="var(--accent-amber)" /> Admin
            </Link>
          )}

          {user && user.role === 'ORGANIZER' && (
            <Link to="/organizer" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }} onClick={() => setMenuOpen(false)}>
              <PlusCircle size={14} color="var(--accent-emerald)" /> Studio
            </Link>
          )}

          {user && user.role === 'PARTICIPANT' && (
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }} onClick={() => setMenuOpen(false)}>
              <Calendar size={14} color="var(--primary)" /> Dashboard
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.85rem 0.35rem 0.5rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${
                    user.role === 'ADMIN' ? 'var(--accent-amber)' :
                    user.role === 'ORGANIZER' ? 'var(--accent-cyan)' :
                    'var(--primary-solid)'
                  }, ${
                    user.role === 'ADMIN' ? 'var(--accent-rose)' :
                    user.role === 'ORGANIZER' ? 'var(--accent-emerald)' :
                    'var(--accent-purple)'
                  })`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-bright)', display: 'block' }}>{user.name}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                title="Log Out"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                <Sparkles size={13} /> Register
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Responsive Styles (inline via style tag) */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .nav-links {
            display: none !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(6, 8, 15, 0.97);
            backdrop-filter: blur(20px);
            padding: 1.5rem;
            gap: 1rem !important;
            border-bottom: 1px solid var(--border-color);
            animation: slideDown 0.2s ease-out;
          }
          .nav-links.nav-open { display: flex !important; }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
    </header>
  );
}
