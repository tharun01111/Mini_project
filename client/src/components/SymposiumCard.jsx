import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Building, ArrowRight, Layers } from 'lucide-react';

export default function SymposiumCard({ symposium }) {
  const startDateStr = new Date(symposium.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endDateStr = new Date(symposium.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const eventCount = symposium.events?.length || 0;

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Banner / Poster */}
      <div style={{
        height: '160px',
        width: '100%',
        position: 'relative',
        backgroundColor: '#1e293b',
        backgroundImage: symposium.bannerUrl ? `url(${symposium.bannerUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!symposium.bannerUrl && (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #312e81 0%, #0e7490 100%)'
          }}>
            <Building size={48} color="rgba(255, 255, 255, 0.4)" />
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px'
        }}>
          <span className="badge badge-info" style={{ backdropFilter: 'blur(8px)' }}>
            <Layers size={12} /> {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          <Building size={14} /> {symposium.college}
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff', lineHeight: 1.3 }}>
          {symposium.title}
        </h3>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {symposium.description}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="var(--primary)" /> {startDateStr}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="var(--accent-amber)" /> {symposium.venue}
            </span>
          </div>

          <Link to={`/symposiums/${symposium.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            View Symposium Events <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
