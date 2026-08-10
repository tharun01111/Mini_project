import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { Calendar, MapPin, Building, User, Mail, Phone, Layers, ArrowLeft } from 'lucide-react';

export default function SymposiumDetails() {
  const { id } = useParams();
  const [symposium, setSymposium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchSymposium();
  }, [id]);

  const fetchSymposium = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/symposiums/${id}`);
      setSymposium(res.data.symposium);
    } catch (err) {
      setError('Symposium not found or error loading details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (error || !symposium) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h2>Symposium Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const startDateStr = new Date(symposium.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const categories = ['ALL', ...new Set(symposium.events.map((e) => e.category))];

  const filteredEvents =
    selectedCategory === 'ALL'
      ? symposium.events
      : symposium.events.filter((e) => e.category === selectedCategory);

  return (
    <div>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Symposium Directory
      </Link>

      {/* Hero Header Banner */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{
          height: '240px',
          width: '100%',
          backgroundImage: symposium.bannerUrl ? `url(${symposium.bannerUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1e293b',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(9, 13, 22, 0.95) 0%, rgba(9, 13, 22, 0.3) 100%)'
          }} />
        </div>

        <div style={{ padding: '2rem', marginTop: '-80px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Building size={16} /> {symposium.college}
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
            {symposium.title}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '850px', marginBottom: '1.75rem' }}>
            {symposium.description}
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" />
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>DATE</span>
                <strong style={{ color: '#ffffff' }}>{startDateStr}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--accent-amber)" />
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>VENUE</span>
                <strong style={{ color: '#ffffff' }}>{symposium.venue}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--accent-emerald)" />
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>ORGANIZER</span>
                <strong style={{ color: '#ffffff' }}>{symposium.organizer?.name}</strong> ({symposium.organizer?.college})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            Symposium Events ({symposium.events.length})
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Choose from paper presentations, hackathons, coding contests, workshops and quizzes</p>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <Layers size={40} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
          <h3>No Events in this Category</h3>
        </div>
      ) : (
        <div className="grid-3">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
}
