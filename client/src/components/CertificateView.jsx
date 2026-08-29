import React from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import { Award, Download, ShieldCheck, Printer, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

export default function CertificateView({ certificateData }) {
  if (!certificateData) return null;

  const {
    certificateCode,
    issueDate,
    participantName,
    participantCollege,
    eventName,
    symposiumName,
    symposiumCollege,
    template,
  } = certificateData;

  const verifyUrl = `${window.location.origin}/verify-certificate/${certificateCode}`;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="certificate-wrapper" style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* ── Certificate Document Frame ── */}
      <div
        id="certificate-print-area"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '14px solid #0f172a',
          outline: '3px solid #d97706',
          outlineOffset: '-7px',
          padding: '3.5rem 3rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 50px rgba(217, 119, 6, 0.15)',
          position: 'relative',
          textAlign: 'center',
          color: '#0f172a',
          backgroundImage: 'radial-gradient(circle at center, #ffffff 60%, #fcfbf7 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Background Subtle Watermark */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.04,
            pointerEvents: 'none',
            fontSize: '18rem',
            fontWeight: 900,
            fontFamily: 'serif',
            color: '#0f172a',
            userSelect: 'none',
          }}
        >
          ★
        </div>

        {/* Institution Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              color: '#64748b',
              fontSize: '0.85rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {symposiumCollege || 'Bannari Amman Institute of Technology'}
          </div>
          <div
            style={{
              color: '#2563eb',
              fontSize: '1.15rem',
              fontWeight: 800,
              marginTop: '4px',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {symposiumName || 'National Technical Symposium'}
          </div>
        </div>

        {/* Gold Emblem Crest */}
        <div style={{ margin: '0.75rem 0', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 70%, #92400e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
              border: '3px solid #fef3c7',
            }}
          >
            <Award size={38} color="#ffffff" />
          </div>
        </div>

        {/* Certificate Title */}
        <h1
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0.5rem 0 1.25rem 0',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {template?.title || 'Certificate of Participation'}
        </h1>

        {/* Presentation Subtext */}
        <p
          style={{
            fontSize: '1rem',
            color: '#64748b',
            margin: '0 0 0.5rem 0',
            fontStyle: 'italic',
            fontFamily: "'Georgia', serif",
          }}
        >
          This is proudly and officially presented to
        </p>

        {/* Participant Name */}
        <h2
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)',
            fontWeight: 800,
            color: '#1e3a8a',
            borderBottom: '2px solid #bfdbfe',
            display: 'inline-block',
            paddingBottom: '4px',
            margin: '0.25rem 0 1rem 0',
            letterSpacing: '0.01em',
          }}
        >
          {participantName}
        </h2>

        {/* Participation Body */}
        <p
          style={{
            fontSize: '1.05rem',
            color: '#334155',
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          from <strong style={{ color: '#0f172a' }}>{participantCollege || 'Engineering College'}</strong> for successful participation and active attendance in the event{' '}
          <strong style={{ color: '#1e40af', fontSize: '1.1rem' }}>"{eventName}"</strong> conducted during {symposiumName} on {formattedDate}.
        </p>

        {/* ── Signatures & Verification QR ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'end',
            gap: '2rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {/* Signatory 1 */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Calligraphy', cursive, serif",
                fontSize: '1.8rem',
                color: '#1e3a8a',
                height: '42px',
                lineHeight: 1,
              }}
            >
              {template?.signatoryName || 'Dr. R. Arunkumar'}
            </div>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', marginTop: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                {template?.signatoryName || 'Dr. R. Arunkumar'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {template?.signatoryTitle || 'Event Convener & HOD'}
              </div>
            </div>
          </div>

          {/* Verification QR Badge */}
          <div style={{ textAlign: 'center' }}>
            <QRCodeDisplay value={verifyUrl} size={105} showFrame={false} />
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#16a34a',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                justifyContent: 'center',
                letterSpacing: '0.04em',
              }}
            >
              <ShieldCheck size={13} /> VERIFIED REGISTRY
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>
              ID: {certificateCode}
            </div>
          </div>

          {/* Signatory 2 */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Calligraphy', cursive, serif",
                fontSize: '1.8rem',
                color: '#1e3a8a',
                height: '42px',
                lineHeight: 1,
              }}
            >
              Principal / Dean
            </div>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', marginTop: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Patron / Principal</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{symposiumCollege || 'BIT Campus'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Outer Actions Toolbar ── */}
      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button onClick={handlePrint} className="btn btn-primary" style={{ gap: '8px' }}>
          <Printer size={16} /> Print / Save Certificate PDF
        </button>

        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ gap: '8px' }}
        >
          <ShieldCheck size={16} color="var(--accent-emerald)" /> Open Public Verification Link <ExternalLink size={13} />
        </a>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            box-shadow: none !important;
            border: 10px solid #0f172a !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
