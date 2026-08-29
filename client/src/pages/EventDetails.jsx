import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DigitalTicket from '../components/DigitalTicket';
import PaymentModal from '../components/PaymentModal';
import { Calendar, Clock, MapPin, Users, Tag, ArrowLeft, CheckCircle, Sparkles, AlertCircle, IndianRupee, FileText } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [registration, setRegistration] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => { fetchEvent(); }, [id]);

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

  const handleRegister = async () => {
    if (!user) {
      alert('Please log in or create an account to register for events.');
      navigate('/login');
      return;
    }
    setRegLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/registrations/register',
        { eventId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegistration(res.data.registration);
      if (res.data.isPaidEvent) {
        setShowPaymentModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--text-dim)" />
        <h3>Event Not Found</h3>
        <p>{error}</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const eventDateStr = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const infoItems = [
    { label: 'Event Date', value: eventDateStr, icon: <Calendar size={16} />, color: 'var(--primary)' },
    { label: 'Timings', value: `${event.startTime} — ${event.endTime}`, icon: <Clock size={16} />, color: 'var(--accent-cyan)' },
    { label: 'Venue', value: event.venue, icon: <MapPin size={16} />, color: 'var(--accent-amber)' },
    { label: 'Capacity', value: `${event.capacity} Seats`, icon: <Users size={16} />, color: 'var(--accent-emerald)' },
  ];

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Back Link */}
      {event.symposium && (
        <Link
          to={`/symposiums/${event.symposium.id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} /> Back to {event.symposium.title}
        </Link>
      )}

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        {/* Category & Price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span className="badge badge-primary" style={{ padding: '0.4rem 0.85rem' }}>
            <Tag size={13} /> {event.category}
          </span>
          <span style={{
            fontSize: '1.4rem', fontWeight: 800,
            color: event.fee === 0 ? 'var(--accent-emerald)' : 'var(--text-bright)',
            display: 'flex', alignItems: 'center', gap: '2px',
          }}>
            {event.fee === 0 ? 'FREE ENTRY' : (<><IndianRupee size={18} />{event.fee}</>)}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-bright)' }}>
          {event.title}
        </h1>

        {/* Description */}
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
          {event.description}
        </p>

        {/* Info Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem', padding: '1.25rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)',
          marginBottom: '2rem',
        }}>
          {infoItems.map((item, i) => (
            <div key={i}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                {item.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.92rem' }}>
                <span style={{ color: item.color }}>{item.icon}</span> {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Eligibility */}
        {event.eligibility && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
              Eligibility Criteria
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.92rem' }}>{event.eligibility}</p>
          </div>
        )}

        {/* Rules */}
        {event.rules && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> Event Rules & Guidelines
            </h3>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)',
              padding: '1.25rem', borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)', whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: 1.7,
            }}>
              {event.rules}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Action */}
        {!registration && (
          <button
            onClick={handleRegister}
            disabled={regLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', justifyContent: 'center', fontWeight: 800 }}
          >
            <Sparkles size={18} /> {regLoading ? 'Processing…' : 'Register for Event Now'}
          </button>
        )}
      </div>

      {registration && (
        <div style={{ marginTop: '2rem', animation: 'slideUp 0.3s ease-out' }}>
          <div className="alert alert-success" style={{ fontWeight: 700, marginBottom: '1.5rem', justifyContent: 'center' }}>
            <CheckCircle size={18} /> Registration Confirmed! Your official event entry pass is ready.
          </div>
          <DigitalTicket registration={registration} onPay={() => setShowPaymentModal(true)} />
        </div>
      )}

      {showPaymentModal && registration && (
        <PaymentModal
          registration={registration}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updatedReg) => setRegistration(updatedReg)}
        />
      )}
    </div>
  );
}
