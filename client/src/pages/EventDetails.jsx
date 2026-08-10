import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Users, Tag, IndianRupee, ArrowLeft, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      setError('Event details could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterMock = () => {
    if (!user) {
      alert('Please sign in to register for this event.');
      navigate('/login');
      return;
    }
    setRegistered(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h2>Event Not Found</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const eventDateStr = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {event.symposium && (
        <Link to={`/symposiums/${event.symposium.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to {event.symposium.title}
        </Link>
      )}

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span className="badge badge-primary" style={{ padding: '0.4rem 0.85rem' }}>
            <Tag size={14} /> {event.category}
          </span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: event.fee === 0 ? 'var(--accent-emerald)' : '#ffffff' }}>
            {event.fee === 0 ? 'FREE ENTRY' : `₹${event.fee}`}
          </span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {event.title}
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
          {event.description}
        </p>

        {/* Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>EVENT DATE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontWeight: 600 }}>
              <Calendar size={16} color="var(--primary)" /> {eventDateStr}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>TIMINGS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontWeight: 600 }}>
              <Clock size={16} color="var(--accent-cyan)" /> {event.startTime} - {event.endTime}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>VENUE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontWeight: 600 }}>
              <MapPin size={16} color="var(--accent-amber)" /> {event.venue}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>SEAT CAPACITY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontWeight: 600 }}>
              <Users size={16} color="var(--accent-emerald)" /> {event.capacity} Max Participants
            </div>
          </div>
        </div>

        {/* Rules and Eligibility */}
        {event.eligibility && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Eligibility Criteria</h3>
            <p style={{ color: 'var(--text-muted)' }}>{event.eligibility}</p>
          </div>
        )}

        {event.rules && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Event Rules & Guidelines</h3>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              whiteSpace: 'pre-line',
              fontSize: '0.925rem'
            }}>
              {event.rules}
            </div>
          </div>
        )}

        {/* Action Button */}
        {registered ? (
          <div className="alert alert-success" style={{ justifyContent: 'center', fontWeight: 600 }}>
            <CheckCircle size={20} /> Registration Confirmed! Ticket code generation available in Part 4.
          </div>
        ) : (
          <button onClick={handleRegisterMock} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}>
            <Sparkles size={20} /> Proceed to Event Registration
          </button>
        )}
      </div>
    </div>
  );
}
