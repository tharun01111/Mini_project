import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, Shield, UserCheck, Calendar, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.user.role === 'ADMIN') navigate('/admin');
      else if (res.user.role === 'ORGANIZER') navigate('/organizer');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="glass-card" style={{ padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-solid) 0%, var(--accent-cyan) 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', boxShadow: '0 0 30px var(--primary-glow)',
          }}>
            <LogIn size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Sign in to manage or attend symposiums
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" className="form-control" placeholder="name@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: '0.75rem', textAlign: 'center',
          }}>
            ⚡ Quick Fill Demo Accounts
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillCredentials('admin@symposium.edu', 'Admin@123')} style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
              <Shield size={12} color="var(--accent-amber)" /> Admin
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillCredentials('organizer@symposium.edu', 'Organizer@123')} style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
              <UserCheck size={12} color="var(--accent-cyan)" /> Organizer
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillCredentials('participant@symposium.edu', 'Participant@123')} style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
              <Calendar size={12} color="var(--accent-emerald)" /> Student
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
