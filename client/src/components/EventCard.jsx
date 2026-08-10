import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Tag, IndianRupee, ChevronRight } from 'lucide-react';

export default function EventCard({ event }) {
  const eventDateStr = new Date(event.eventDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="badge badge-primary">
          <Tag size={12} /> {event.category}
        </span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: event.fee === 0 ? 'var(--accent-emerald)' : '#ffffff' }}>
          {event.fee === 0 ? (
            'FREE ENTRY'
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <IndianRupee size={14} />{event.fee}
            </span>
          )}
        </span>
      </div>

      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
        {event.title}
      </h4>

      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1
      }}>
        {event.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} color="var(--primary)" /> {eventDateStr} ({event.startTime} - {event.endTime})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} color="var(--accent-amber)" /> {event.venue}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={14} color="var(--accent-cyan)" /> Capacity: {event.capacity} seats | Eligibility: {event.eligibility}
        </div>
      </div>

      <Link to={`/events/${event.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
        Event Details & Rules <ChevronRight size={16} />
      </Link>
    </div>
  );
}
