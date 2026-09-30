import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ShieldCheck,
  Search,
  History,
  Filter,
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.requestId.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      (l.details || '').toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Compliance & Integrity
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-2">
            Institutional Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological record of student intakes, rule engine evaluations, and administrative overrides.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Request ID, action, actor, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="all">All Actions ({logs.length})</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            Loading institutional audit trail...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">No audit records found</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or action filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-4 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="font-mono text-slate-400 text-[11px] sm:w-44 flex-shrink-0 pt-0.5">
                    {dateStr} • {timeStr}
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 hidden sm:block"></div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-xs">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400">by</span>
                      <span className="font-semibold text-indigo-700 text-xs">
                        {log.actor}
                      </span>
                      {log.requestId && (
                        <button
                          onClick={() => navigate(`/admin/requests/${log.requestId}`)}
                          className="font-mono text-[11px] text-slate-500 hover:text-indigo-600 underline flex items-center space-x-0.5 ml-auto"
                        >
                          <span>{log.requestId}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
