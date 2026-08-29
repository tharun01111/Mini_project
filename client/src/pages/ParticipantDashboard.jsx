import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DigitalTicket from '../components/DigitalTicket';
import PaymentModal from '../components/PaymentModal';
import CertificateView from '../components/CertificateView';
import {
  User,
  Ticket,
  CreditCard,
  Award,
  Settings,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Sparkles,
  Lock,
  Download,
  X,
  MapPin,
  IndianRupee,
  Mail,
  Phone,
  Key,
} from 'lucide-react';

export default function ParticipantDashboard() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [paymentRegistration, setPaymentRegistration] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileCollege, setProfileCollege] = useState(user?.college || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const token = localStorage.getItem('token');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [regRes, payRes, certRes] = await Promise.all([
        axios.get('http://localhost:5000/api/registrations/my-registrations', { headers }),
        axios.get('http://localhost:5000/api/payments/my-payments', { headers }),
        axios.get('http://localhost:5000/api/certificates/my-certificates', { headers }),
      ]);
      setRegistrations(regRes.data.registrations || []);
      setPayments(payRes.data.payments || []);
      setCertificates(certRes.data.certificates || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/profile',
        { name: profileName, college: profileCollege, phone: profilePhone, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileMsg('Profile updated successfully!');
      setUser(res.data.user);
      setCurrentPassword(''); setNewPassword('');
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleGenerateCertificate = async (registrationId) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/certificates/generate',
        { registrationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
      const certCode = res.data.certificate.certificateCode;
      const verifyRes = await axios.get(`http://localhost:5000/api/certificates/verify/${certCode}`);
      setSelectedCertificate(verifyRes.data.certificateDetails);
    } catch (err) {
      alert(err.response?.data?.message || 'Certificate generation failed.');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">My Dashboard</h1>
        <p className="section-subtitle">
          Manage your registrations, QR tickets, payments, and verified certificates.
        </p>
      </div>

      {/* User Card */}
      <div className="user-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-solid), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 0 20px var(--primary-glow)',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-bright)' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0' }}>{user?.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>
                <Building size={13} /> {user?.college || 'Institution'}
              </div>
            </div>
          </div>

          <span className="status-chip success" style={{ fontSize: '0.78rem', padding: '5px 14px' }}>
            <CheckCircle2 size={14} /> Verified
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
          <Ticket size={16} /> Tickets ({registrations.length})
        </button>
        <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
          <CreditCard size={16} /> Payments ({payments.length})
        </button>
        <button className={`tab-btn ${activeTab === 'certificates' ? 'active' : ''}`} onClick={() => setActiveTab('certificates')}>
          <Award size={16} /> Certificates ({certificates.length})
        </button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <Settings size={16} /> Profile
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }}></div>
          <p style={{ color: 'var(--text-dim)', marginTop: '1rem', fontSize: '0.9rem' }}>Loading dashboard…</p>
        </div>
      ) : (
        <div>
          {/* ── TAB 1: TICKETS ── */}
          {activeTab === 'tickets' && (
            <div>
              {registrations.length === 0 ? (
                <div className="empty-state">
                  <Ticket size={48} color="var(--text-dim)" />
                  <h3>No Registered Events Yet</h3>
                  <p>Browse published symposiums and register for events to get digital QR tickets.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {registrations.map((reg) => {
                    const isPaid = reg.paymentStatus === 'COMPLETED' || reg.paymentStatus === 'EXEMPT';
                    return (
                      <div key={reg.id} className="reg-card">
                        <div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {reg.event?.symposium?.title}
                          </span>
                          <h3 style={{ margin: '4px 0 6px', fontSize: '1.1rem', color: 'var(--text-bright)' }}>{reg.event?.title}</h3>
                          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={12} /> {reg.event?.venue}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <IndianRupee size={12} /> {reg.event?.fee}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Ticket size={12} /> <code style={{ fontSize: '0.78rem' }}>{reg.ticketCode}</code>
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`status-chip ${isPaid ? 'success' : 'warning'}`}>
                            {isPaid ? 'CONFIRMED' : 'PENDING'}
                          </span>

                          {!isPaid && (
                            <button onClick={() => setPaymentRegistration(reg)} className="btn btn-primary btn-sm">
                              Pay ₹{reg.event?.fee}
                            </button>
                          )}

                          <button onClick={() => setSelectedTicket(reg)} className="btn btn-secondary btn-sm">
                            View Ticket
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: PAYMENTS ── */}
          {activeTab === 'payments' && (
            <div>
              {payments.length === 0 ? (
                <div className="empty-state">
                  <CreditCard size={48} color="var(--text-dim)" />
                  <h3>No Payment Records</h3>
                  <p>Completed event registration payments will appear here.</p>
                </div>
              ) : (
                <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Event</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td><code>{p.transactionId}</code></td>
                          <td style={{ fontWeight: 600 }}>{p.registration?.event?.title}</td>
                          <td style={{ fontWeight: 700, color: 'var(--text-bright)' }}>₹{p.amount}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(p.paymentDate).toLocaleString()}</td>
                          <td><span className="status-chip success">{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: CERTIFICATES ── */}
          {activeTab === 'certificates' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Event Certificates</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Certificates unlock after attending events and completing payments.
                </p>
              </div>

              {registrations.length === 0 ? (
                <div className="empty-state">
                  <Award size={48} color="var(--text-dim)" />
                  <h3>No Certificates Earned Yet</h3>
                  <p>Register and attend events to earn verifiable certificates.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {registrations.map((reg) => {
                    const hasAttended = Boolean(reg.attendance);
                    const isPaid = reg.paymentStatus === 'COMPLETED' || reg.paymentStatus === 'EXEMPT';
                    const isEligible = hasAttended && isPaid && reg.status === 'CONFIRMED';
                    const hasCert = Boolean(reg.certificate);

                    return (
                      <div key={reg.id} className="reg-card">
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-bright)' }}>{reg.event?.title}</h4>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span>{reg.event?.symposium?.title}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              Status: <span className={`status-chip ${hasAttended ? 'success' : 'danger'}`} style={{ marginLeft: '4px' }}>
                                {hasAttended ? 'ATTENDED' : 'NOT ATTENDED'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div>
                          {hasCert ? (
                            <button
                              onClick={async () => {
                                const verifyRes = await axios.get(`http://localhost:5000/api/certificates/verify/${reg.certificate.certificateCode}`);
                                setSelectedCertificate(verifyRes.data.certificateDetails);
                              }}
                              className="btn btn-success btn-sm"
                            >
                              <Award size={14} /> View Certificate
                            </button>
                          ) : isEligible ? (
                            <button onClick={() => handleGenerateCertificate(reg.id)} className="btn btn-primary btn-sm">
                              <Sparkles size={14} /> Generate Certificate
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Lock size={13} /> {!hasAttended ? 'Requires Attendance' : 'Payment Pending'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="glass-card" style={{ maxWidth: '600px' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem' }}>Update Profile</h3>

              {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
              {profileErr && <div className="alert alert-error">{profileErr}</div>}

              <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">College / University</label>
                  <input type="text" className="form-control" value={profileCollege} onChange={(e) => setProfileCollege(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-control" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Key size={16} color="var(--accent-amber)" /> Change Password
                  </h4>
                  <div style={{ display: 'grid', gap: '0.85rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Current Password</label>
                      <input type="password" className="form-control" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Leave blank if not changing" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">New Password</label>
                      <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new secure password" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Modal: Ticket ── */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedTicket(null)}
              className="btn btn-secondary btn-sm"
              style={{
                position: 'absolute', top: '-46px', right: 0,
                gap: '6px',
                zIndex: 20,
              }}
            >
              <X size={16} /> Close Ticket
            </button>
            <DigitalTicket
              registration={selectedTicket}
              onPay={(reg) => { setSelectedTicket(null); setPaymentRegistration(reg); }}
            />
          </div>
        </div>
      )}

      {/* ── Modal: Payment ── */}
      {paymentRegistration && (
        <PaymentModal
          registration={paymentRegistration}
          onClose={() => setPaymentRegistration(null)}
          onSuccess={() => fetchDashboardData()}
        />
      )}

      {/* ── Modal: Certificate ── */}
      {selectedCertificate && (
        <div className="modal-overlay" onClick={() => setSelectedCertificate(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedCertificate(null)}
              className="btn btn-secondary btn-sm"
              style={{
                position: 'absolute', top: '14px', right: '14px', zIndex: 30,
                gap: '6px',
              }}
            >
              <X size={16} /> Close
            </button>
            <CertificateView certificateData={selectedCertificate} />
          </div>
        </div>
      )}
    </div>
  );
}
