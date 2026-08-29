import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Tag, IndianRupee, ChevronRight } from 'lucide-react';

export default function EventCard({ event }) {
  const eventDateStr = new Date(event.eventDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span className="badge badge-primary">
          <Tag size={11} /> {event.category}
        </span>
        <span style={{
          fontSize: '0.95rem', fontWeight: 700,
          color: event.fee === 0 ? 'var(--accent-emerald)' : 'var(--text-bright)',
        }}>
          {event.fee === 0 ? (
            'FREE'
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
              <IndianRupee size={13} />{event.fee}
            </span>
          )}
        </span>
      </div>

      {/* Title */}
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
        {event.title}
      </h4>

      {/* Description */}
      <p style={{
        fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.15rem',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', flex: 1,
      }}>
        {event.description}
      </p>

      {/* Info Rows */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.4rem',
        fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem',
        padding: '0.85rem', borderRadius: 'var(--radius-sm)',
        background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={13} color="var(--primary)" /> {eventDateStr} ({event.startTime} — {event.endTime})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={13} color="var(--accent-amber)" /> {event.venue}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={13} color="var(--accent-cyan)" /> {event.capacity} seats • {event.eligibility}
        </div>
      </div>

      {/* CTA */}
      <Link to={`/events/${event.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
        Event Details & Rules <ChevronRight size={15} />
      </Link>
    </div>
  );
}
