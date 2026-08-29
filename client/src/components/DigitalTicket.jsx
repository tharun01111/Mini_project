import React from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Download, Ticket, Building, User, Sparkles, Tag, ShieldCheck, Printer } from 'lucide-react';

export default function DigitalTicket({ registration, onPay }) {
  if (!registration) return null;

  const { event, user, status, paymentStatus, ticketCode, registeredAt } = registration;
  const isPaid = paymentStatus === 'COMPLETED' || paymentStatus === 'EXEMPT';

  const handlePrint = () => {
    window.print();
  };

  const eventDateStr = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA';

  return (
    <div className="digital-ticket-wrapper" style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* ── Outer Ticket Container ── */}
      <div
        id="digital-ticket-print"
        style={{
          background: 'linear-gradient(145deg, #0e1326 0%, #080b15 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Glow Accent Bar */}
        <div
          style={{
            height: '6px',
            width: '100%',
            background: isPaid
              ? 'linear-gradient(90deg, #10b981, #06b6d4, #6366f1)'
              : 'linear-gradient(90deg, #f59e0b, #ef4444)',
          }}
        />

        {/* ── Top Header Section ── */}
        <div
          style={{
            padding: '1.75rem 2rem 1.25rem 2rem',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: 'var(--primary-surface)',
                    color: 'var(--primary)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={11} /> {event?.symposium?.title || 'SYMPOSIUM PASS'}
                </span>

                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                  }}
                >
                  {event?.category || 'Technical'}
                </span>
              </div>

              <h2
                style={{
                  margin: '4px 0',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                {event?.title}
              </h2>

              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building size={13} /> {event?.symposium?.college || 'Host Institution'}
              </p>
            </div>

            {/* Status Chip */}
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  background: isPaid ? 'var(--accent-emerald-surface)' : 'var(--accent-amber-surface)',
                  color: isPaid ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                  border: isPaid ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  boxShadow: isPaid ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none',
                }}
              >
                {isPaid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {isPaid ? 'PASS CONFIRMED' : 'PAYMENT PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Ticket Content & QR ── */}
        <div
          style={{
            padding: '1.75rem 2rem',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1.75rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Event & Participant Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                  EVENT DATE
                </span>
                <span style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Calendar size={14} color="var(--primary)" /> {eventDateStr}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                  SESSION TIMING
                </span>
                <span style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Clock size={14} color="var(--accent-cyan)" /> {event?.startTime} — {event?.endTime}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                VENUE LOCATION
              </span>
              <span style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <MapPin size={14} color="var(--accent-amber)" /> {event?.venue || 'Campus Auditorium'}
              </span>
            </div>

            {/* Participant Metadata Block */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginTop: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-solid), var(--accent-cyan))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.college || 'Student Attendee'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res QR Ticket Code */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '14px',
            }}
          >
            <QRCodeDisplay value={ticketCode} size={130} />
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--accent-cyan)',
                marginTop: '8px',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.06em',
              }}
            >
              {ticketCode}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase' }}>
              Gate Check-In QR
            </div>
          </div>
        </div>

        {/* ── Perforated Tear Divider ── */}
        <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
          {/* Left Tear Notch */}
          <div
            style={{
              position: 'absolute',
              left: '-10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--bg-dark)',
              boxShadow: 'inset -2px 0 4px rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Dashed Line */}
          <div
            style={{
              width: '100%',
              height: '1px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.12)',
              margin: '0 16px',
            }}
          />

          {/* Right Tear Notch */}
          <div
            style={{
              position: 'absolute',
              right: '-10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--bg-dark)',
              boxShadow: 'inset 2px 0 4px rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>

        {/* ── Bottom Barcode & Actions ── */}
        <div
          style={{
            padding: '1.25rem 2rem',
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Simulated Barcode Lines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.5 }}>
            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3].map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w * 1.5}px`,
                  height: '24px',
                  background: '#ffffff',
                  borderRadius: '1px',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {event?.fee > 0 && !isPaid && (
              <button
                onClick={() => onPay && onPay(registration)}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Ticket size={14} /> Pay ₹{event.fee}
              </button>
            )}

            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Print Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #digital-ticket-print, #digital-ticket-print * {
            visibility: visible;
          }
          #digital-ticket-print {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 600px;
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          #digital-ticket-print h2, #digital-ticket-print span, #digital-ticket-print div {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
