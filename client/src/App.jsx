import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Guards
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentRequestPage from './pages/StudentRequestPage';
import StudentRequestsList from './pages/StudentRequestsList';
import StudentRequestDetail from './pages/StudentRequestDetail';
import StudentCertificatesPage from './pages/StudentCertificatesPage';
import StudentCertificateView from './pages/StudentCertificateView';

import AdminDashboard from './pages/AdminDashboard';
import AdminRequestQueue from './pages/AdminRequestQueue';
import AdminRequestDetail from './pages/AdminRequestDetail';
import AdminCertificatesPage from './pages/AdminCertificatesPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

import VerifyCertificate from './pages/VerifyCertificate';
import NotFound from './pages/NotFound';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Login */}
            <Route path="/login" element={<Login />} />

            {/* Public Certificate QR Verification */}
            <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
            <Route path="/verify" element={<Navigate to="/verify/CERT-2026-00124" replace />} />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentDashboard />} />
              <Route path="request" element={<StudentRequestPage />} />
              <Route path="requests" element={<StudentRequestsList />} />
              <Route path="requests/:id" element={<StudentRequestDetail />} />
              <Route path="certificates" element={<StudentCertificatesPage />} />
              <Route path="certificate/:id" element={<StudentCertificateView />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="requests" element={<AdminRequestQueue />} />
              <Route path="requests/:id" element={<AdminRequestDetail />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="audit" element={<AdminAuditLogsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
