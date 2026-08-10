import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SymposiumCard from '../components/SymposiumCard';
import { Search, Sparkles, Trophy, Calendar, Award, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSymposiums();
  }, []);

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
      {/* Hero Header Section */}
      <div className="glass-card" style={{
        padding: '3.5rem 2rem',
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span className="badge badge-primary" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
          <Sparkles size={14} /> Next-Gen Academic & Technical Event Platform
        </span>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15 }}>
          Unified Symposium <br /> Management Platform
        </h1>

        <p style={{ maxWidth: '680px', margin: '0 auto 2rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Discover upcoming college symposiums, paper presentations, hackathons, workshops, and competitions. Register seamlessly, access digital QR tickets, and claim verifiable certificates.
        </p>

        {/* Feature Highlights */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#ffffff'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={18} color="var(--accent-emerald)" /> Instant Registration
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={18} color="var(--accent-cyan)" /> Live Event Tracking
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trophy size={18} color="var(--accent-amber)" /> QR Ticket Check-In
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={18} color="var(--primary)" /> Verifiable Certificates
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Active Symposiums</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Browse published symposiums hosted across premier institutions</p>
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
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

      {/* Status Messages */}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        </div>
      ) : filteredSymposiums.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <Calendar size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
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
