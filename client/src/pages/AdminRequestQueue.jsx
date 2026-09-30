import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  ExternalLink,
  Award,
  RefreshCw,
  FileText,
  User,
  CheckCircle2,
  Clock,
  Ban
} from 'lucide-react';

export default function AdminRequestQueue() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('department') || 'all');

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, departmentFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/requests', { params });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Registrar Operations
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-2">
            Institutional Request Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor, filter, and audit automated decisions and department exceptions.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-subtle space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Request ID, student name, ID or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending_review">Pending Review</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Department Filter */}
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="all">All Routes</option>
              <option value="accounts">Accounts</option>
              <option value="academic">Academic</option>
              <option value="administration">Administration</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Requests Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            Loading queue records...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">No requests match current filter</p>
            <p className="text-xs text-slate-500">Try changing status or clearing search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Document</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">AI Decision</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((r) => {
                  const dateStr = new Date(r.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/requests/${r.id}`)}
                    >
                      {/* Request ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {r.id}
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.studentId}</div>
                      </td>

                      {/* Document */}
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {r.documentType}
                      </td>

                      {/* Purpose */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                        {r.aiUnderstanding?.purpose || 'Verification'}
                      </td>

                      {/* AI Decision */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            r.decision === 'AUTO_APPROVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.decision === 'REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.decision === 'AUTO_APPROVE'
                            ? 'Auto Process'
                            : r.decision === 'REVIEW'
                            ? 'Review Required'
                            : 'Blocked'}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4">
                        {r.route ? (
                          <Badge status={r.route} variant="department" />
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={r.status} />
                      </td>

                      {/* Submitted */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/requests/${r.id}`)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 font-semibold text-slate-700 bg-white transition-colors"
                        >
                          Open Review
                        </button>
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
  );
}
