import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import QRCodeDisplay from './QRCodeDisplay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Ticket, Building, Sparkles, Printer, Download } from 'lucide-react';

export default function DigitalTicket({ registration, onPay }) {
  if (!registration) return null;

  const { event, user, paymentStatus, ticketCode } = registration;
  const isPaid = paymentStatus === 'COMPLETED' || paymentStatus === 'EXEMPT';
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const eventDateStr = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA';

  useEffect(() => {
    if (ticketCode) {
      QRCode.toDataURL(ticketCode, {
        width: 300,
        margin: 1,
        color: { dark: '#090d16', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('Error generating QR data URL:', err));
    }
  }, [ticketCode]);

  const handleDownloadPdf = async () => {
    const ticketElement = document.getElementById('digital-ticket-print');
    if (!ticketElement) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#0d1224',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ticketWidthMm = 175;
      const ticketHeightMm = (canvas.height * ticketWidthMm) / canvas.width;
      const xOffset = (pdfWidth - ticketWidthMm) / 2;
      const yOffset = 18;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, ticketWidthMm, ticketHeightMm, undefined, 'FAST');
      pdf.save(`Ticket_${ticketCode}.pdf`);
    } catch (err) {
      console.error('Error generating ticket PDF:', err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    let qr = qrDataUrl;
    if (!qr && ticketCode) {
      try {
        qr = await QRCode.toDataURL(ticketCode, {
          width: 300,
          margin: 1,
          color: { dark: '#090d16', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });
      } catch (e) {
        console.error(e);
      }
    }

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Event Pass - ${ticketCode}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              display: flex;
              justify-content: center;
              padding-top: 15px;
            }
            .ticket-card {
              width: 100%;
              max-width: 620px;
              background: #0d1224;
              color: #ffffff;
              border-radius: 18px;
              border: 1px solid #3730a3;
              overflow: hidden;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
            }
            .accent-bar {
              height: 6px;
              width: 100%;
              background: ${isPaid ? 'linear-gradient(90deg, #10b981, #06b6d4, #6366f1)' : 'linear-gradient(90deg, #f59e0b, #ef4444)'};
            }
            .ticket-header {
              padding: 18px 24px 14px 24px;
              background: rgba(99, 102, 241, 0.08);
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .pill-symposium {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #818cf8;
              background: rgba(99, 102, 241, 0.18);
              border: 1px solid rgba(99, 102, 241, 0.35);
              padding: 3px 9px;
              border-radius: 12px;
              display: inline-block;
            }
            .pill-category {
              font-size: 10px;
              font-weight: 600;
              color: #94a3b8;
              background: rgba(255, 255, 255, 0.08);
              padding: 3px 8px;
              border-radius: 12px;
              display: inline-block;
              margin-left: 5px;
            }
            .event-title {
              font-size: 20px;
              font-weight: 800;
              color: #ffffff;
              margin: 4px 0 2px 0;
            }
            .college-title {
              font-size: 12px;
              color: #22d3ee;
              font-weight: 600;
            }
            .badge-status {
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              background: ${isPaid ? '#064e3b' : '#78350f'};
              color: ${isPaid ? '#34d399' : '#fbbf24'};
              border: 1px solid ${isPaid ? '#059669' : '#d97706'};
            }
            .ticket-body {
              padding: 18px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
            }
            .ticket-details {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .detail-row {
              display: flex;
              gap: 20px;
            }
            .detail-col {
              flex: 1;
            }
            .label-text {
              font-size: 9px;
              color: #94a3b8;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 0.05em;
              margin-bottom: 2px;
            }
            .value-text {
              font-size: 13px;
              color: #ffffff;
              font-weight: 700;
            }
            .participant-card {
              background: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 10px;
              padding: 10px 12px;
              margin-top: 4px;
            }
            .participant-name {
              font-size: 13px;
              font-weight: 700;
              color: #ffffff;
            }
            .participant-college {
              font-size: 11px;
              color: #94a3b8;
            }
            .qr-panel {
              background: #ffffff;
              border-radius: 12px;
              padding: 10px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
            }
            .qr-image {
              width: 125px;
              height: 125px;
              display: block;
            }
            .ticket-code-str {
              font-size: 11px;
              font-weight: 800;
              font-family: monospace;
              color: #0f172a;
              margin-top: 4px;
              letter-spacing: 0.05em;
            }
            .tear-line {
              height: 16px;
              display: flex;
              align-items: center;
              margin: 0 16px;
              border-top: 2px dashed rgba(255, 255, 255, 0.15);
            }
            .ticket-footer {
              padding: 12px 24px;
              background: rgba(0, 0, 0, 0.25);
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              color: #94a3b8;
            }
            .barcode-visual {
              display: flex;
              align-items: center;
              gap: 2.5px;
              opacity: 0.6;
            }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="accent-bar"></div>
            
            <div class="ticket-header">
              <div>
                <div>
                  <span class="pill-symposium">★ ${event?.symposium?.title || 'SYMPOSIUM PASS'}</span>
                  <span class="pill-category">${event?.category || 'Technical'}</span>
                </div>
                <div class="event-title">${event?.title || 'Event Name'}</div>
                <div class="college-title">🏫 ${event?.symposium?.college || 'Host Institution'}</div>
              </div>
              <div>
                <span class="badge-status">${isPaid ? 'PASS CONFIRMED' : 'PAYMENT PENDING'}</span>
              </div>
            </div>

            <div class="ticket-body">
              <div class="ticket-details">
                <div class="detail-row">
                  <div class="detail-col">
                    <div class="label-text">EVENT DATE</div>
                    <div class="value-text">📅 ${eventDateStr}</div>
                  </div>
                  <div class="detail-col">
                    <div class="label-text">SESSION TIMING</div>
                    <div class="value-text">⏰ ${event?.startTime || '10:00 AM'} — ${event?.endTime || '01:00 PM'}</div>
                  </div>
                </div>

                <div>
                  <div class="label-text">VENUE LOCATION</div>
                  <div class="value-text" style="font-weight: 600;">📍 ${event?.venue || 'Campus Auditorium'}</div>
                </div>

                <div class="participant-card">
                  <div class="participant-name">${user?.name || 'Attendee'}</div>
                  <div class="participant-college">${user?.college || 'Student Attendee'} • ${user?.email || ''}</div>
                </div>
              </div>

              <div class="qr-panel">
                ${qr ? `<img src="${qr}" class="qr-image" alt="QR Code" />` : ''}
                <div class="ticket-code-str">${ticketCode}</div>
                <div style="font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase;">Gate Check-In QR</div>
              </div>
            </div>

            <div class="tear-line"></div>

            <div class="ticket-footer">
              <div class="barcode-visual">
                ${[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3]
                  .map((w) => `<div style="width: ${w * 1.5}px; height: 18px; background: #ffffff; border-radius: 1px;"></div>`)
                  .join('')}
              </div>
              <div style="letter-spacing: 0.04em;">Official Digital Pass • Present QR at gate for check-in</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 250);
  };

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
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              {downloading ? (
                <div className="spinner" style={{ width: '13px', height: '13px', borderWidth: '2px' }}></div>
              ) : (
                <Download size={14} />
              )}
              {downloading ? 'Saving…' : 'Download PDF'}
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
