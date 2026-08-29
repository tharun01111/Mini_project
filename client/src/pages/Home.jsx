import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SymposiumCard from '../components/SymposiumCard';
import { Search, Sparkles, Trophy, Calendar, Award, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchSymposiums(); }, []);

  const fetchSymposiums = async () => {
    try {
      setLoading(true);
      const res = await api.get('/symposiums?publishedOnly=true');
      setSymposiums(res.data.symposiums);
    } catch (err) {
      setError('Failed to load symposiums. Make sure backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSymposiums = symposiums.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.college.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <div style={{
        padding: '4rem 2.5rem',
        marginBottom: '3rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(168, 85, 247, 0.06) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.12)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glow orbs */}
        <div style={{
          position: 'absolute', top: '-60px', left: '-60px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', right: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12), transparent 70%)',
          filter: 'blur(30px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-primary" style={{ marginBottom: '1.25rem', padding: '0.4rem 1.1rem', fontSize: '0.72rem' }}>
            <Zap size={12} /> Next-Gen Academic & Technical Event Platform
          </span>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            lineHeight: 1.12,
            background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 70%, var(--accent-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Unified Symposium<br />Management Platform
          </h1>

          <p style={{
            maxWidth: '680px', margin: '0 auto 2.25rem', fontSize: '1.05rem',
            color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            Discover college symposiums, hackathons, workshops, and competitions.
            Register seamlessly, access digital QR tickets, and claim verifiable certificates.
          </p>

          {/* Feature Pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '0.75rem', fontSize: '0.85rem',
          }}>
            {[
              { icon: <CheckCircle2 size={15} />, label: 'Instant Registration', color: 'var(--accent-emerald)' },
              { icon: <Calendar size={15} />, label: 'Live Tracking', color: 'var(--accent-cyan)' },
              { icon: <Trophy size={15} />, label: 'QR Check-In', color: 'var(--accent-amber)' },
              { icon: <Award size={15} />, label: 'Verified Certificates', color: 'var(--primary)' },
            ].map((feat, i) => (
              <span key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)',
                color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 500,
              }}>
                <span style={{ color: feat.color }}>{feat.icon}</span> {feat.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Active Symposiums</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Browse published symposiums hosted across premier institutions
          </p>
        </div>

        <div style={{ position: 'relative', minWidth: '280px', maxWidth: '380px', flex: '1' }}>
          <Search size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, college, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* ─── Content ─── */}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div className="spinner spinner-lg"></div>
        </div>
      ) : filteredSymposiums.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="var(--text-dim)" />
          <h3>No Symposiums Found</h3>
          <p>No published symposiums match your search criteria.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredSymposiums.map((symposium) => (
            <SymposiumCard key={symposium.id} symposium={symposium} />
          ))}
        </div>
      )}
    </div>
  );
}
