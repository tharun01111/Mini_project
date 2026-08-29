import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SymposiumDetails from './pages/SymposiumDetails';
import EventDetails from './pages/EventDetails';
import OrganizerStudio from './pages/OrganizerStudio';
import AdminPanel from './pages/AdminPanel';
import ParticipantDashboard from './pages/ParticipantDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import './styles/theme.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/symposiums/:id" element={<SymposiumDetails />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/verify-certificate" element={<VerifyCertificate />} />
            <Route path="/verify-certificate/:certificateCode" element={<VerifyCertificate />} />
            <Route path="/verify/:certificateCode" element={<VerifyCertificate />} />


            {/* Protected Routes */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                  <OrganizerStudio />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PARTICIPANT', 'ORGANIZER', 'ADMIN']}>
                  <ParticipantDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
