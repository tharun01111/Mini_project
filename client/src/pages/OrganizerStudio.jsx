import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AttendanceScanner from '../components/AttendanceScanner';
import {
  Plus,
  PlusCircle,
  Calendar,
  Eye,
  EyeOff,
  Trash2,
  Building,
  QrCode,
  Award,
  Users,
  CheckCircle,
  Clock,
  Save,
  X,
  Layers,
  Tag,
  IndianRupee,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function OrganizerStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('symposiums');
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceEventId, setAttendanceEventId] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isBulkPending, setIsBulkPending] = useState(false);
  const [manualMarkLoadingId, setManualMarkLoadingId] = useState(null);

  const [templateForm, setTemplateForm] = useState({
    title: 'Certificate of Participation',
    signatoryName: 'Dr. R. Arunkumar',
    signatoryTitle: 'Symposium Convener & HOD',
    contentTemplate: 'This is to certify that {{participantName}} has actively participated in {{eventName}}.',
  });
  const [templateMsg, setTemplateMsg] = useState('');

  const [showSymposiumModal, setShowSymposiumModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [activeSymposiumId, setActiveSymposiumId] = useState(null);

  const [symposiumForm, setSymposiumForm] = useState({
    title: '',
    description: '',
    college: user?.college || 'Bannari Amman Institute of Technology',
    venue: '',
    startDate: '',
    endDate: '',
    bannerUrl: '',
    isPublished: true,
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Technical',
    description: '',
    venue: '',
    eventDate: '',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    capacity: 100,
    fee: 100,
    eligibility: 'All Students',
    rules: '',
    registrationDeadline: '',
  });

  useEffect(() => { fetchMySymposiums(); }, []);

  const fetchMySymposiums = async () => {
    try {
      setLoading(true);
      const res = await api.get('/symposiums/organizer/my-symposiums');
      setSymposiums(res.data.symposiums || []);
      if (res.data.symposiums?.length > 0 && res.data.symposiums[0].events?.length > 0) {
        setSelectedEventId(res.data.symposiums[0].events[0].id);
      }
    } catch (err) {
      setError('Failed to load your symposiums.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventAttendance = async (eventId) => {
    if (!eventId) return;
    setAttendanceLoading(true);
    try {
      const res = await api.get(`/attendance/event/${eventId}`);
      setAttendanceData(res.data);
      setAttendanceEventId(eventId);
    } catch (err) {
      console.error('Error loading event attendance roster:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => { if (selectedEventId) fetchEventAttendance(selectedEventId); }, [selectedEventId]);

  const handleManualAttendance = async (registrationId) => {
    setManualMarkLoadingId(registrationId);
    try {
      await api.post('/attendance/manual', { registrationId });
      await fetchEventAttendance(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking manual attendance.');
    } finally {
      setManualMarkLoadingId(null);
    }
  };

  const handleBulkGenerateCertificates = async () => {
    if (!selectedEventId || isBulkPending) return;
    setError('');
    setSuccess('');
    setIsBulkPending(true);
    try {
      const res = await api.post(`/certificates/bulk-generate/${selectedEventId}`, {});
      setSuccess(res.data.message);
      fetchEventAttendance(selectedEventId);
    } catch (err) {
      setError(err.response?.data?.message || 'Error issuing batch certificates.');
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleCreateSymposium = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/symposiums', symposiumForm);
      setSuccess('Symposium created successfully!');
      setShowSymposiumModal(false);
      fetchMySymposiums();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating symposium.');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!activeSymposiumId) return;
    setError(''); setSuccess('');
    try {
      await api.post(`/events/symposium/${activeSymposiumId}`, eventForm);
      setSuccess('Event added to symposium successfully!');
      setShowEventModal(false);
      fetchMySymposiums();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding event.');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.patch(`/symposiums/${id}/publish`);
      setSuccess(res.data.message);
      fetchMySymposiums();
    } catch (err) {
      setError('Error toggling publish state.');
    }
  };

  const handleDeleteSymposium = async (id) => {
    if (!window.confirm('Are you sure you want to delete this symposium and all its events?')) return;
    try {
      await api.delete(`/symposiums/${id}`);
      setSuccess('Symposium deleted.');
      fetchMySymposiums();
    } catch (err) {
      setError('Error deleting symposium.');
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setTemplateMsg('');
    try {
      await api.post('/certificates/template', templateForm);
      setTemplateMsg('Certificate template saved successfully!');
    } catch (err) {
      alert('Error saving certificate template.');
    }
  };

  const allEventsList = symposiums.flatMap((s) =>
    (s.events || []).map((e) => ({ ...e, symposiumTitle: s.title }))
  );

  useEffect(() => {
    if (!selectedEventId && allEventsList.length > 0) {
      setSelectedEventId(allEventsList[0].id);
    }
  }, [allEventsList, selectedEventId]);

  const selectedEvent = allEventsList.find((e) => e.id === selectedEventId);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Organizer Studio</h1>
          <p className="section-subtitle">
            Manage symposiums, track registrations, scan QR attendance, and configure certificates.
          </p>
        </div>
        <button onClick={() => setShowSymposiumModal(true)} className="btn btn-primary">
          <Plus size={18} /> Create Symposium
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'symposiums' ? 'active' : ''}`} onClick={() => setActiveTab('symposiums')}>
          <Building size={16} /> Symposiums & Events
        </button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <QrCode size={16} /> Attendance & QR
        </button>
        <button className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          <Award size={16} /> Certificate Templates
        </button>
      </div>

      {/* ── TAB 1: Symposiums & Events ── */}
      {activeTab === 'symposiums' && (
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner spinner-lg"></div>
            </div>
          ) : symposiums.length === 0 ? (
            <div className="empty-state">
              <Building size={48} color="var(--text-dim)" />
              <h3>No Symposiums Created Yet</h3>
              <p>Click "Create Symposium" to launch your institution's technical or cultural festival.</p>
              <button onClick={() => setShowSymposiumModal(true)} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                <Plus size={18} /> Create Your First Symposium
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {symposiums.map((symposium) => (
                <div key={symposium.id} className="glass-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-bright)' }}>{symposium.title}</h3>
                        <span className={`badge ${symposium.isPublished ? 'badge-success' : 'badge-warning'}`}>
                          {symposium.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building size={13} /> {symposium.college}
                        </span>
                        <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} /> {symposium.venue}
                        </span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setActiveSymposiumId(symposium.id); setShowEventModal(true); }} className="btn btn-success btn-sm">
                        <PlusCircle size={14} /> Add Event
                      </button>
                      <button onClick={() => handleTogglePublish(symposium.id)} className="btn btn-secondary btn-sm">
                        {symposium.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        {symposium.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => handleDeleteSymposium(symposium.id)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inner Events */}
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={15} /> Events ({symposium.events?.length || 0})
                    </h4>

                    {symposium.events?.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        No events added to this symposium yet.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
                        {symposium.events.map((evt) => (
                          <div key={evt.id} style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            transition: 'var(--transition-fast)',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-bright)' }}>{evt.title}</span>
                              <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>
                                <Tag size={10} /> {evt.category}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <IndianRupee size={11} /> {evt.fee}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Users size={11} /> {evt.capacity}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={11} /> {evt.startTime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Attendance & QR Scanner ── */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Event Selector */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: '1 1 320px' }}>
                <label className="form-label" style={{ marginBottom: '0.45rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                  Select Event for Attendance Tracking & QR Scanning
                </label>
                <select
                  className="form-control"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  disabled={allEventsList.length === 0}
                >
                  {allEventsList.length === 0 && (
                    <option value="">No events available in your symposiums</option>
                  )}
                  {allEventsList.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.symposiumTitle} → {evt.title} ({evt.category})
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Symposium: <strong style={{ color: 'var(--text-bright)' }}>{selectedEvent.symposiumTitle}</strong>
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {selectedEvent.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Camera & Manual QR Scanner */}
          <AttendanceScanner
            eventId={selectedEventId}
            eventTitle={selectedEvent?.title}
            onAttendanceRecorded={() => fetchEventAttendance(selectedEventId)}
          />

          {/* Attendance Roster — DISPLAYED AT ALL TIMES */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                  Participant Roster {selectedEvent ? `— ${selectedEvent.title}` : ''}
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {attendanceData?.stats ? (
                    <>
                      Confirmed: <strong style={{ color: 'var(--text-bright)' }}>{attendanceData.stats.totalConfirmed}</strong>
                      <span style={{ margin: '0 0.4rem', opacity: 0.3 }}>•</span>
                      Attended: <strong style={{ color: 'var(--accent-emerald)' }}>{attendanceData.stats.totalAttended}</strong>
                      <span style={{ margin: '0 0.4rem', opacity: 0.3 }}>•</span>
                      Rate: <strong style={{ color: 'var(--primary)' }}>{attendanceData.stats.attendanceRate}</strong>
                    </>
                  ) : (
                    'Select an event to view verified attendees and live attendance counts.'
                  )}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {selectedEventId && (
                  <button
                    onClick={() => fetchEventAttendance(selectedEventId)}
                    className="btn btn-secondary btn-sm"
                    disabled={attendanceLoading}
                    title="Refresh roster"
                    style={{ gap: '5px' }}
                  >
                    <RefreshCw size={13} className={attendanceLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                )}

                {attendanceData?.stats?.totalAttended > 0 && (
                  <button
                    onClick={handleBulkGenerateCertificates}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px' }}
                    disabled={isBulkPending}
                  >
                    <Award size={14} /> {isBulkPending ? 'Issuing…' : `Issue Certificates (${attendanceData.stats.totalAttended})`}
                  </button>
                )}
              </div>
            </div>

            {/* Roster Content */}
            {!selectedEventId || allEventsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>No event selected or no events created yet.</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem' }}>Please create a symposium event in the first tab or select one above.</p>
              </div>
            ) : attendanceLoading && !attendanceData ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3.5rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <div className="spinner"></div>
                <span style={{ fontSize: '0.9rem' }}>Loading attendees for {selectedEvent?.title || 'event'}...</span>
              </div>
            ) : !attendanceData || attendanceData.registrations?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>No confirmed registrations found for "{selectedEvent?.title}".</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem' }}>Participants who register will automatically appear in this roster.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Contact & College</th>
                      <th>Ticket ID</th>
                      <th>Payment</th>
                      <th>Attendance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.registrations.map((reg) => {
                      const isAttended = Boolean(reg.attendance);
                      const isRowLoading = manualMarkLoadingId === reg.id;
                      return (
                        <tr key={reg.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{reg.user?.name}</td>
                          <td>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{reg.user?.email}</span>
                            <br />
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{reg.user?.college || 'N/A'}</span>
                          </td>
                          <td><code>{reg.ticketCode}</code></td>
                          <td>
                            <span className={`status-chip ${reg.paymentStatus === 'COMPLETED' || reg.paymentStatus === 'EXEMPT' ? 'success' : 'warning'}`}>
                              {reg.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`status-chip ${isAttended ? 'success' : 'danger'}`}>
                              {isAttended ? `✓ ${reg.attendance.method}` : 'ABSENT'}
                            </span>
                          </td>
                          <td>
                            {!isAttended ? (
                              <button
                                onClick={() => handleManualAttendance(reg.id)}
                                className="btn btn-secondary btn-sm"
                                disabled={isRowLoading}
                                style={{ fontSize: '0.78rem', gap: '4px' }}
                              >
                                {isRowLoading ? (
                                  <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div>
                                ) : (
                                  <CheckCircle size={12} />
                                )}
                                Mark
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                                Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Certificate Templates ── */}
      {activeTab === 'templates' && (
        <div className="glass-card" style={{ maxWidth: '650px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Configure Certificate Template</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Customize the title and official signatory designations rendered on generated participant certificates.
          </p>

          {templateMsg && <div className="alert alert-success">{templateMsg}</div>}

          <form onSubmit={handleSaveTemplate} style={{ display: 'grid', gap: '1.15rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Certificate Header Title</label>
              <input
                type="text"
                className="form-control"
                value={templateForm.title}
                onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Primary Signatory Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dr. R. Arunkumar"
                value={templateForm.signatoryName}
                onChange={(e) => setTemplateForm({ ...templateForm, signatoryName: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Primary Signatory Designation</label>
              <input
                type="text"
                className="form-control"
                placeholder="Event Convener & HOD"
                value={templateForm.signatoryTitle}
                onChange={(e) => setTemplateForm({ ...templateForm, signatoryTitle: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Save size={16} /> Save Template Settings
            </button>
          </form>
        </div>
      )}

      {/* ── Modal: Create Symposium ── */}
      {showSymposiumModal && (
        <div className="modal-overlay" onClick={() => setShowSymposiumModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Create New Symposium</h2>
              <button onClick={() => setShowSymposiumModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSymposium}>
              <div className="form-group">
                <label className="form-label">Symposium Title</label>
                <input type="text" className="form-control" placeholder="e.g. TechFest 2026" value={symposiumForm.title} onChange={(e) => setSymposiumForm({ ...symposiumForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">College / Institution</label>
                <input type="text" className="form-control" value={symposiumForm.college} onChange={(e) => setSymposiumForm({ ...symposiumForm, college: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" placeholder="Describe the symposium highlights..." value={symposiumForm.description} onChange={(e) => setSymposiumForm({ ...symposiumForm, description: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-control" value={symposiumForm.startDate} onChange={(e) => setSymposiumForm({ ...symposiumForm, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-control" value={symposiumForm.endDate} onChange={(e) => setSymposiumForm({ ...symposiumForm, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Venue Location</label>
                <input type="text" className="form-control" placeholder="e.g. Main Auditorium & CS Block" value={symposiumForm.venue} onChange={(e) => setSymposiumForm({ ...symposiumForm, venue: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowSymposiumModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Symposium</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add Event ── */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Add Event to Symposium</h2>
              <button onClick={() => setShowEventModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input type="text" className="form-control" placeholder="e.g. Paper Presentation / Hackathon" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}>
                    <option value="Technical">Technical</option>
                    <option value="Coding">Coding</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Non-Technical">Non-Technical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Fee (₹)</label>
                  <input type="number" className="form-control" value={eventForm.fee} onChange={(e) => setEventForm({ ...eventForm, fee: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Event Description</label>
                <textarea className="form-control" placeholder="Brief summary of event objectives..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input type="date" className="form-control" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-control" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="text" className="form-control" placeholder="10:00 AM" value={eventForm.startTime} onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="text" className="form-control" placeholder="01:00 PM" value={eventForm.endTime} onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <input type="text" className="form-control" placeholder="Lab 3 / Seminar Hall" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Deadline</label>
                <input type="date" className="form-control" value={eventForm.registrationDeadline} onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEventModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
