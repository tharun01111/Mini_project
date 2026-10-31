import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import QRCodeDisplay from './QRCodeDisplay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Award, ShieldCheck, Printer, ExternalLink, Download } from 'lucide-react';

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
  const [qrUrl, setQrUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (verifyUrl) {
      QRCode.toDataURL(verifyUrl, {
        width: 250,
        margin: 1,
        color: { dark: '#090d16', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      })
        .then(setQrUrl)
        .catch((err) => console.error('Error generating cert QR:', err));
    }
  }, [verifyUrl]);

  const handleDownloadPdf = async () => {
    const certElement = document.getElementById('certificate-print-area');
    if (!certElement) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(certElement, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const cleanName = (participantName || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Certificate_${cleanName}_${certificateCode}.pdf`);
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    let qr = qrUrl;
    if (!qr && verifyUrl) {
      try {
        qr = await QRCode.toDataURL(verifyUrl, { width: 250, margin: 1 });
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
          <title>Certificate - ${certificateCode}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm;
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
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 0;
            }
            .cert-card {
              width: 100%;
              max-width: 1050px;
              background: #ffffff;
              border-radius: 14px;
              border: 12px solid #0f172a;
              outline: 3px solid #d97706;
              outline-offset: -6px;
              padding: 30px 45px 25px 45px;
              text-align: center;
              position: relative;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .inst-header {
              color: #64748b;
              font-size: 13px;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              font-weight: 800;
              margin-bottom: 2px;
            }
            .symp-header {
              color: #2563eb;
              font-size: 18px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .crest-wrapper {
              margin: 8px 0;
              display: flex;
              justify-content: center;
            }
            .crest-circle {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              background: linear-gradient(135deg, #fbbf24 0%, #d97706 70%, #92400e 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 26px;
              border: 2px solid #fef3c7;
            }
            .cert-title {
              font-family: 'Georgia', 'Times New Roman', serif;
              font-size: 32px;
              font-weight: 800;
              color: #0f172a;
              margin: 4px 0 8px 0;
              letter-spacing: 0.04em;
              text-transform: uppercase;
            }
            .presented-text {
              font-size: 14px;
              color: #64748b;
              font-style: italic;
              font-family: 'Georgia', serif;
              margin-bottom: 4px;
            }
            .participant-title {
              font-family: 'Georgia', 'Times New Roman', serif;
              font-size: 28px;
              font-weight: 800;
              color: #1e3a8a;
              border-bottom: 2px solid #bfdbfe;
              display: inline-block;
              padding-bottom: 2px;
              margin: 2px 0 12px 0;
            }
            .body-text {
              font-size: 15px;
              color: #334155;
              max-width: 800px;
              margin: 0 auto 16px auto;
              line-height: 1.6;
            }
            .sign-grid {
              display: grid;
              grid-template-columns: 1fr auto 1fr;
              align-items: end;
              gap: 30px;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
            }
            .sig-name-script {
              font-family: 'Brush Script MT', 'Lucida Calligraphy', cursive, serif;
              font-size: 24px;
              color: #1e3a8a;
              height: 32px;
              line-height: 1;
            }
            .sig-box {
              border-top: 1px solid #94a3b8;
              padding-top: 4px;
              margin-top: 4px;
            }
            .sig-title {
              font-size: 11px;
              color: #64748b;
            }
            .qr-verify-box {
              text-align: center;
            }
            .qr-img {
              width: 85px;
              height: 85px;
              display: block;
              margin: 0 auto;
            }
            .verify-label {
              font-size: 9px;
              font-weight: 800;
              color: #16a34a;
              margin-top: 4px;
              letter-spacing: 0.04em;
            }
            .cert-code-label {
              font-size: 9px;
              color: #64748b;
              font-family: monospace;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="cert-card">
            <div class="inst-header">${symposiumCollege || 'Bannari Amman Institute of Technology'}</div>
            <div class="symp-header">${symposiumName || 'National Technical Symposium'}</div>

            <div class="crest-wrapper">
              <div class="crest-circle">★</div>
            </div>

            <div class="cert-title">${template?.title || 'Certificate of Participation'}</div>
            <div class="presented-text">This is proudly and officially presented to</div>
            <div class="participant-title">${participantName}</div>

            <div class="body-text">
              from <strong style="color: #0f172a;">${participantCollege || 'Engineering College'}</strong> for successful participation and active attendance in the event
              <strong style="color: #1e40af;">"${eventName}"</strong> conducted during ${symposiumName} on ${formattedDate}.
            </div>

            <div class="sign-grid">
              <div>
                <div class="sig-name-script">${template?.signatoryName || 'Dr. R. Arunkumar'}</div>
                <div class="sig-box">
                  <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${template?.signatoryName || 'Dr. R. Arunkumar'}</div>
                  <div class="sig-title">${template?.signatoryTitle || 'Event Convener & HOD'}</div>
                </div>
              </div>

              <div class="qr-verify-box">
                ${qr ? `<img src="${qr}" class="qr-img" alt="QR" />` : ''}
                <div class="verify-label">🛡️ VERIFIED REGISTRY</div>
                <div class="cert-code-label">ID: ${certificateCode}</div>
              </div>

              <div>
                <div class="sig-name-script">Principal / Dean</div>
                <div class="sig-box">
                  <div style="font-weight: 700; font-size: 13px; color: #0f172a;">Patron / Principal</div>
                  <div class="sig-title">${symposiumCollege || 'BIT Campus'}</div>
                </div>
              </div>
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
    <div className="certificate-wrapper" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* ── Top Actions Bar (OUTSIDE the Certificate) ── */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--accent-amber)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-bright)' }}>
            Official Certificate
          </span>
          <code style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
            {certificateCode}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="btn btn-primary"
            style={{
              gap: '8px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            {downloading ? (
              <div className="spinner" style={{ width: '15px', height: '15px', borderWidth: '2px' }}></div>
            ) : (
              <Download size={16} />
            )}
            {downloading ? 'Preparing PDF…' : 'Download Certificate PDF'}
          </button>

          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

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
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          {downloading ? (
            <div className="spinner" style={{ width: '15px', height: '15px', borderWidth: '2px' }}></div>
          ) : (
            <Download size={16} />
          )}
          {downloading ? 'Preparing PDF…' : 'Download Certificate PDF'}
        </button>

        <button onClick={handlePrint} className="btn btn-secondary" style={{ gap: '8px' }}>
          <Printer size={16} /> Print / Save
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
    </div>
  );
}
