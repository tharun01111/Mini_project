import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { Calendar, MapPin, Building, User, Mail, Phone, Layers, ArrowLeft, AlertCircle } from 'lucide-react';

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
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (error || !symposium) {
    return (
      <div className="empty-state" style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <AlertCircle size={48} color="var(--text-dim)" />
        <h3>Symposium Not Found</h3>
        <p>{error}</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1.25rem' }}>
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

  const categories = ['ALL', ...new Set(symposium.events?.map((e) => e.category) || [])];

  const filteredEvents =
    selectedCategory === 'ALL'
      ? (symposium.events || [])
      : (symposium.events || []).filter((e) => e.category === selectedCategory);

  return (
    <div>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
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
          backgroundColor: '#0f172a',
          position: 'relative',
        }}>
          {!symposium.bannerUrl && (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
            }}>
              <Building size={64} color="rgba(255, 255, 255, 0.12)" />
            </div>
          )}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(6, 8, 15, 0.4) 100%)',
          }} />
        </div>

        <div style={{ padding: '2rem 2.25rem', marginTop: '-60px', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            fontSize: '0.88rem',
            marginBottom: '0.5rem',
          }}>
            <Building size={16} /> {symposium.college}
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            color: 'var(--text-bright)',
            lineHeight: 1.2,
          }}>
            {symposium.title}
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '850px',
            marginBottom: '1.75rem',
            lineHeight: 1.7,
          }}>
            {symposium.description}
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.88rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--primary-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                <Calendar size={18} />
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>DATE</span>
                <strong style={{ color: 'var(--text-bright)' }}>{startDateStr}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--accent-amber-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-amber)',
              }}>
                <MapPin size={18} />
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>VENUE</span>
                <strong style={{ color: 'var(--text-bright)' }}>{symposium.venue}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--accent-emerald-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
              }}>
                <User size={18} />
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>ORGANIZER</span>
                <strong style={{ color: 'var(--text-bright)' }}>{symposium.organizer?.name}</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>({symposium.organizer?.college})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Symposium Events ({symposium.events?.length || 0})
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Choose from technical events, coding contests, workshops, and quizzes
          </p>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <Layers size={40} color="var(--text-dim)" />
          <h3>No Events in this Category</h3>
          <p>Try selecting a different category from above.</p>
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
