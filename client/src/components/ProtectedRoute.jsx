import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-slate-500">Checking institutional session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If student trying to access admin, redirect to student dashboard
    if (user?.role === 'student') {
      return <Navigate to="/student" replace />;
    }
    // If admin accessing student, redirect to admin
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}
