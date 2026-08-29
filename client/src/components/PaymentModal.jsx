import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, Smartphone, Building, CheckCircle2, X, Lock, Shield, IndianRupee, Sparkles } from 'lucide-react';

export default function PaymentModal({ registration, onClose, onSuccess }) {
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedPayment, setCompletedPayment] = useState(null);

  if (!registration) return null;
  const { event, id: registrationId } = registration;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/payments/process',
        {
          registrationId,
          paymentMethod: method,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCompletedPayment(res.data.payment);
      if (onSuccess) onSuccess(res.data.registration);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '480px', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-cyan-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}>
              <Lock size={16} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              Secure Payment Gateway
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem' }}>
          {completedPayment ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--accent-emerald-surface)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
                marginBottom: '1rem',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-bright)', fontSize: '1.3rem' }}>
                Payment Confirmed!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Your payment of <strong style={{ color: 'var(--accent-emerald)' }}>₹{event?.fee}</strong> for "{event?.title}" has been successfully processed.
              </p>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Transaction ID:</span>{' '}
                  <code>{completedPayment.transactionId}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Payment Date:</span>{' '}
                  <span style={{ color: 'var(--text-main)' }}>{new Date(completedPayment.paymentDate).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Status:</span>{' '}
                  <span className="status-chip success" style={{ marginLeft: '4px' }}>COMPLETED</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                View Confirmed Digital Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay}>
              {/* Fee Summary */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                  Registration Fee
                </div>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: 'var(--text-bright)',
                  margin: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                }}>
                  <IndianRupee size={24} />{event?.fee?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>{event?.title}</div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <label className="form-label" style={{ marginBottom: '0.6rem' }}>
                Select Payment Method
              </label>

              {/* Payment Methods */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '1.25rem' }}>
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: <Smartphone size={18} /> },
                  { id: 'CARD', label: 'Card', icon: <CreditCard size={18} /> },
                  { id: 'NETBANKING', label: 'NetBanking', icon: <Building size={18} /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: method === item.id ? '1px solid var(--primary-solid)' : '1px solid var(--border-color)',
                      background: method === item.id ? 'var(--primary-surface)' : 'rgba(255, 255, 255, 0.02)',
                      color: method === item.id ? 'var(--primary)' : 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      transition: 'var(--transition-fast)',
                      boxShadow: method === item.id ? '0 0 15px var(--primary-glow)' : 'none',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{
                fontSize: '0.78rem',
                color: 'var(--text-dim)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
              }}>
                <Shield size={13} color="var(--accent-emerald)" /> Simulated sandbox instant settlement.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  justifyContent: 'center',
                }}
              >
                {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div> : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} /> Pay ₹{event?.fee} Now
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
