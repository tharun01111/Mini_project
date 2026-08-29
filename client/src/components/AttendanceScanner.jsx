import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, AlertTriangle, Search, UserCheck, Camera, X } from 'lucide-react';

export default function AttendanceScanner({ eventId, eventTitle }) {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  const processTicketScan = async (codeToVerify) => {
    let cleanCode = codeToVerify.trim();
    if (cleanCode.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanCode);
        cleanCode = parsed.ticketCode || cleanCode;
      } catch (e) {
        // use raw string
      }
    }

    setLoading(true);
    setScanResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/attendance/scan',
        {
          ticketCode: cleanCode,
          eventId: eventId || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setScanResult({
        success: true,
        message: res.data.message,
        participant: res.data.participant,
        event: res.data.event,
      });
      setManualCode('');
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Error processing ticket scan.',
        alreadyMarked: err.response?.data?.alreadyMarked || false,
        participant: err.response?.data?.participant || null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode) processTicketScan(manualCode);
  };

  useEffect(() => {
    if (cameraActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          processTicketScan(decodedText);
          scanner.clear();
          setCameraActive(false);
        },
        (error) => {}
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    }
  }, [cameraActive]);

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-bright)' }}>
            Live Attendance QR Scanner
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {eventTitle ? `Scanning active for: ${eventTitle}` : 'Scan participant ticket QR code'}
          </p>
        </div>

        <button
          onClick={() => setCameraActive(!cameraActive)}
          className={`btn btn-sm ${cameraActive ? 'btn-danger' : 'btn-primary'}`}
          style={{ gap: '6px' }}
        >
          {cameraActive ? <X size={15} /> : <Camera size={15} />}
          {cameraActive ? 'Stop Camera' : 'Launch Camera'}
        </button>
      </div>

      {/* Camera Container */}
      {cameraActive && (
        <div style={{
          marginBottom: '1.5rem',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
        }}>
          <div id="qr-reader" style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}></div>
        </div>
      )}

      {/* Manual Code Input */}
      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Enter or paste Ticket ID (e.g. TCK-A1B2C3D4)..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !manualCode}
          className="btn btn-secondary"
          style={{ gap: '6px' }}
        >
          {loading ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : <UserCheck size={16} />}
          Verify & Mark
        </button>
      </form>

      {/* Result Status Card */}
      {scanResult && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: scanResult.success ? 'var(--accent-emerald-surface)' : 'var(--accent-rose-surface)',
            border: `1px solid ${scanResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {scanResult.success ? (
            <CheckCircle2 size={24} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={24} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}

          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: '0 0 4px 0',
                color: scanResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              {scanResult.success ? 'Attendance Successfully Recorded!' : 'Attendance Verification Failed'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {scanResult.message}
            </p>

            {scanResult.participant && (
              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <span><strong>Name:</strong> {scanResult.participant.name}</span>
                <span><strong>College:</strong> {scanResult.participant.college || 'N/A'}</span>
                <span><strong>Email:</strong> {scanResult.participant.email}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
