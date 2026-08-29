import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Search, Award, CheckCircle2, Building, Calendar, User, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';

export default function VerifyCertificate() {
  const { certificateCode: routeCode } = useParams();
  const [inputCode, setInputCode] = useState(routeCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searchedCode, setSearchedCode] = useState('');

  const fetchVerification = async (codeToVerify) => {
    if (!codeToVerify) return;
    setLoading(true);
    setResult(null);
    setSearchedCode(codeToVerify);

    try {
      const res = await axios.get(`http://localhost:5000/api/certificates/verify/${codeToVerify.trim()}`);
      setResult(res.data);
    } catch (err) {
      setResult({
        valid: false,
        message: err.response?.data?.message || 'Certificate verification failed or invalid Certificate ID.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeCode) {
      fetchVerification(routeCode);
    }
  }, [routeCode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCode) fetchVerification(inputCode);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '1rem auto 3rem auto' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      {/* Search Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--accent-cyan-surface)',
          color: 'var(--accent-cyan)',
          padding: '5px 14px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 700,
          fontSize: '0.75rem',
          marginBottom: '1rem',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          letterSpacing: '0.04em',
        }}>
          <ShieldCheck size={14} /> OFFICIAL PUBLIC CERTIFICATE VERIFICATION REGISTRY
        </div>

        <h1 style={{
          margin: '0 0 0.75rem 0',
          fontSize: 'clamp(1.75rem, 4vw, 2.3rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Verify Certificate Authenticity
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '580px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
          Enter a Certificate ID or scan the QR code printed on the physical certificate to instantly verify official issuance and attendance authenticity.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', maxWidth: '540px', margin: '0 auto', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search
              size={18}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Enter Certificate ID (e.g. CERT-A1B2C3D4)..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              style={{ paddingLeft: '2.5rem', height: '46px' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputCode}
            className="btn btn-primary"
            style={{ height: '46px', padding: '0 24px', flexShrink: 0 }}
          >
            {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div> : 'Verify Now'}
          </button>
        </form>
      </div>

      {/* Verification Result Section */}
      {result && (
        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
          {result.valid && result.certificateDetails ? (
            <div
              className="glass-card"
              style={{
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 12px 35px rgba(16, 185, 129, 0.15)',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              {/* Status Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  padding: '1.5rem 2rem',
                  borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--accent-emerald-surface)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)',
                  flexShrink: 0,
                }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--accent-emerald)', fontSize: '1.2rem', fontWeight: 800 }}>
                    Official Certificate Verified & Valid!
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Authentically registered in the platform tamper-proof registry.
                  </p>
                </div>
              </div>

              {/* Certificate Details Card */}
              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                    <User size={18} color="var(--primary)" />
                    <span>
                      <strong style={{ color: 'var(--text-dim)' }}>Participant:</strong>{' '}
                      <span style={{ fontSize: '1.05rem', color: 'var(--text-bright)', fontWeight: 700 }}>
                        {result.certificateDetails.participantName}
                      </span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                    <Building size={18} color="var(--accent-cyan)" />
                    <span>
                      <strong style={{ color: 'var(--text-dim)' }}>College / Institution:</strong>{' '}
                      <span style={{ color: 'var(--text-main)' }}>{result.certificateDetails.participantCollege}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                    <Award size={18} color="var(--accent-amber)" />
                    <span>
                      <strong style={{ color: 'var(--text-dim)' }}>Event:</strong>{' '}
                      <span style={{ color: 'var(--text-main)' }}>
                        {result.certificateDetails.eventName} ({result.certificateDetails.eventCategory})
                      </span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                    <Sparkles size={18} color="var(--accent-purple)" />
                    <span>
                      <strong style={{ color: 'var(--text-dim)' }}>Symposium:</strong>{' '}
                      <span style={{ color: 'var(--text-main)' }}>
                        {result.certificateDetails.symposiumName} — {result.certificateDetails.symposiumCollege}
                      </span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                    <Calendar size={18} color="var(--primary)" />
                    <span>
                      <strong style={{ color: 'var(--text-dim)' }}>Issue Date:</strong>{' '}
                      <span style={{ color: 'var(--text-main)' }}>
                        {new Date(result.certificateDetails.issueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                <div style={{
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                }}>
                  <QRCodeDisplay value={window.location.href} size={130} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', marginTop: '8px' }}>
                    <code>{searchedCode}</code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                border: '1px solid rgba(244, 63, 94, 0.4)',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 12px 35px rgba(244, 63, 94, 0.12)',
              }}
            >
              <ShieldAlert size={48} color="var(--accent-rose)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: 'var(--accent-rose)', margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 700 }}>
                Unverified or Invalid Certificate ID
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', fontSize: '0.92rem' }}>
                {result.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
