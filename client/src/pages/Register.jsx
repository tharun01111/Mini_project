import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, Building, Phone, Briefcase, Info, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARTICIPANT',
    college: '',
    phone: '',
    department: '',
    designation: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await register(formData);
      if (formData.role === 'ORGANIZER') {
        alert(res.message);
        navigate('/login');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary-solid) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 30px var(--primary-glow)',
          }}>
            <UserPlus size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Join the centralized symposium platform
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">Select Your Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${formData.role === 'PARTICIPANT' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData({ ...formData, role: 'PARTICIPANT' })}
                style={{ justifyContent: 'center', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                <GraduationCap size={16} /> Participant
              </button>
              <button
                type="button"
                className={`btn ${formData.role === 'ORGANIZER' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData({ ...formData, role: 'ORGANIZER' })}
                style={{ justifyContent: 'center', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                <Building size={16} /> Event Organizer
              </button>
            </div>
          </div>

          {formData.role === 'ORGANIZER' && (
            <div className="alert alert-info" style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              <Info size={16} style={{ flexShrink: 0 }} /> Organizer accounts are reviewed by Admin before full publishing rights are activated.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Dr. / Mr. / Ms. Full Name"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="name@college.edu"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College / Institution Name</label>
            <div style={{ position: 'relative' }}>
              <Building size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="college"
                className="form-control"
                placeholder="Bannari Amman Institute of Technology"
                value={formData.college}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {formData.role === 'ORGANIZER' && (
            <>
              <div className="form-group">
                <label className="form-label">Department</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    placeholder="Computer Science & Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role</label>
                <input
                  type="text"
                  name="designation"
                  className="form-control"
                  placeholder="Assistant Professor / Event Convener"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={submitting}>
            {submitting ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} /> Complete Registration as {formData.role}
              </span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
