import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Building, ArrowRight, Layers } from 'lucide-react';

export default function SymposiumCard({ symposium }) {
  const startDateStr = new Date(symposium.startDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const eventCount = symposium.events?.length || 0;

  return (
    <div className="glass-card" style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      padding: 0, overflow: 'hidden',
    }}>
      {/* Banner */}
      <div style={{
        height: '155px', width: '100%', position: 'relative',
        backgroundImage: symposium.bannerUrl ? `url(${symposium.bannerUrl})` : 'none',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        {!symposium.bannerUrl && (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          }}>
            <Building size={44} color="rgba(255, 255, 255, 0.15)" />
          </div>
        )}
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          display: 'flex', gap: '6px',
        }}>
          <span className="badge badge-info" style={{ backdropFilter: 'blur(8px)', background: 'rgba(6, 182, 212, 0.15)' }}>
            <Layers size={11} /> {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem',
        }}>
          <Building size={13} /> {symposium.college}
        </div>

        <h3 style={{
          fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem',
          color: 'var(--text-bright)', lineHeight: 1.3,
        }}>
          {symposium.title}
        </h3>

        <p style={{
          fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          flex: 1,
        }}>
          {symposium.description}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={13} color="var(--primary)" /> {startDateStr}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin size={13} color="var(--accent-amber)" /> {symposium.venue}
            </span>
          </div>

          <Link to={`/symposiums/${symposium.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            View Events <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
