import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Badge from '../components/Badge';
import CertificatePreviewModal from '../components/CertificatePreviewModal';
import {
  FileText,
  PlusCircle,
  Search,
  Eye,
  Award,
  Download,
  Filter,
  ArrowRight
} from 'lucide-react';

export default function StudentRequestsList() {
  const { user, student } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/student');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCert = async (certId) => {
    try {
      const res = await api.get(`/certificates/${certId}`);
      if (res.data.success) {
        setSelectedCert(res.data.data);
        setIsCertModalOpen(true);
      }
    } catch (err) {
      addToast('Could not load certificate preview', 'error');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter || r.decision === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.id.toLowerCase().includes(q) ||
      r.documentType.toLowerCase().includes(q) ||
      (r.aiUnderstanding?.purpose || '').toLowerCase().includes(q) ||
      (r.aiUnderstanding?.organization || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            My Records
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-2">
            My Document Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track status, review reasons, and download issued institutional credentials.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/request')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-indigo-600/20 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Document Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Request ID, document or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="all">All Statuses ({requests.length})</option>
            <option value="approved">Approved</option>
            <option value="pending_review">Pending Review</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Request Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-400">
          Loading requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No requests found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search query or filter.'
              : 'You have not submitted any document requests yet.'}
          </p>
          <button
            onClick={() => navigate('/student/request')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Request</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredRequests.map((req) => {
            const formattedDate = new Date(req.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {req.id}
                    </span>
                    <Badge status={req.status} />
                    {req.route && <Badge status={req.route} variant="department" />}
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {req.documentType}
                  </div>
                  <p className="text-xs text-slate-600">
                    Purpose: <span className="font-semibold text-slate-800">{req.aiUnderstanding?.purpose || 'General Verification'}</span>
                    {req.aiUnderstanding?.organization && ` • Organization: ${req.aiUnderstanding.organization}`}
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Submitted on {formattedDate}
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => navigate(`/student/requests/${req.id}`)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Status</span>
                  </button>

                  {req.certificateId && (
                    <button
                      onClick={() => handleOpenCert(req.certificateId)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center space-x-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      <CertificatePreviewModal
        certificate={selectedCert}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}
