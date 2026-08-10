import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, PlusCircle, Calendar, Layers, Eye, EyeOff, Trash2, Edit3, CheckCircle, AlertCircle, Building } from 'lucide-react';

export default function OrganizerStudio() {
  const { user } = useAuth();
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals / Form toggles
  const [showSymposiumModal, setShowSymposiumModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [activeSymposiumId, setActiveSymposiumId] = useState(null);

  // Symposium Form State
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

  // Event Form State
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
  });

  useEffect(() => {
    fetchMySymposiums();
  }, []);

  const fetchMySymposiums = async () => {
    try {
      setLoading(true);
      const res = await api.get('/symposiums/organizer/my-symposiums');
      setSymposiums(res.data.symposiums);
    } catch (err) {
      setError('Failed to load your symposiums.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSymposium = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/symposiums', symposiumForm);
      setSuccess('Symposium created successfully!');
      setShowSymposiumModal(false);
      setSymposiumForm({
        title: '',
        description: '',
        college: user?.college || 'Bannari Amman Institute of Technology',
        venue: '',
        startDate: '',
        endDate: '',
        bannerUrl: '',
        isPublished: true,
      });
      fetchMySymposiums();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating symposium.');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!activeSymposiumId) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/events/symposium/${activeSymposiumId}`, eventForm);
      setSuccess('Event added to symposium successfully!');
      setShowEventModal(false);
      setEventForm({
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
      });
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

  return (
    <div>
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Organizer Studio</h1>
          <p className="section-subtitle">Manage your college symposiums, schedule technical events, set fees and capacities</p>
        </div>

        <button onClick={() => setShowSymposiumModal(true)} className="btn btn-primary">
          <Plus size={18} /> Create Symposium
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Symposium List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : symposiums.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <Building size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Symposiums Created Yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Click "Create Symposium" to launch your institution's technical or cultural festival.</p>
          <button onClick={() => setShowSymposiumModal(true)} className="btn btn-primary">
            <Plus size={18} /> Create Your First Symposium
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {symposiums.map((symposium) => (
            <div key={symposium.id} className="glass-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{symposium.title}</h3>
                    <span className={`badge ${symposium.isPublished ? 'badge-success' : 'badge-warning'}`}>
                      {symposium.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {symposium.college} | Venue: {symposium.venue}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setActiveSymposiumId(symposium.id);
                      setShowEventModal(true);
                    }}
                    className="btn btn-success btn-sm"
                  >
                    <PlusCircle size={14} /> Add Event
                  </button>

                  <button
                    onClick={() => handleTogglePublish(symposium.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    {symposium.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    {symposium.isPublished ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDeleteSymposium(symposium.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Inner Events Table */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                  Events Hosted ({symposium.events?.length || 0})
                </h4>

                {symposium.events?.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', italic: true }}>No events added to this symposium yet. Click "Add Event" to create presentation rounds or workshops.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    {symposium.events.map((evt) => (
                      <div key={evt.id} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{evt.title}</span>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{evt.category}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          Fee: ₹{evt.fee} | Cap: {evt.capacity} | {evt.startTime}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Create Symposium */}
      {showSymposiumModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Create New Symposium</h2>

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

              <div className="form-group">
                <label className="form-label">Banner Image URL (Optional)</label>
                <input type="url" className="form-control" placeholder="https://images.unsplash.com/..." value={symposiumForm.bannerUrl} onChange={(e) => setSymposiumForm({ ...symposiumForm, bannerUrl: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowSymposiumModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Symposium</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Event */}
      {showEventModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Add Event to Symposium</h2>

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
                  <label className="form-label">Capacity (Max Seats)</label>
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
                <label className="form-label">Rules & Guidelines</label>
                <textarea className="form-control" placeholder="1. Max 3 members. 2. Laptops required..." value={eventForm.rules} onChange={(e) => setEventForm({ ...eventForm, rules: e.target.value })} />
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
