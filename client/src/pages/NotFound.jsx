import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500">
          The requested workflow or document view does not exist.
        </p>
        <button
          onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/student')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
