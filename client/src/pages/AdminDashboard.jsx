import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  FileText,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Users,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 48,
    autoProcessed: 31,
    awaitingReview: 11,
    blocked: 4,
    approvedExceptions: 2
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/requests');
      if (res.data.success) {
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        // Filter out pending review requests for the priority triage queue
        const pending = res.data.data.filter((r) => r.status === 'pending_review');
        setPendingRequests(pending);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Recharts workflow distribution dataset
  const chartData = [
    { name: 'Auto Processed', count: stats.autoProcessed || 31, color: '#10b981' },
    { name: 'Review Required', count: stats.awaitingReview || 11, color: '#f59e0b' },
    { name: 'Blocked Policy', count: stats.blocked || 4, color: '#f43f5e' },
  ];

  const autoRate = stats.total > 0 ? Math.round((stats.autoProcessed / stats.total) * 100) : 65;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            <span>Institutional Operations</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Registrar Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-1">
            Good morning, Admin
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with college document workflows today.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/requests')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex-shrink-0"
        >
          <span>View Full Request Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/requests')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-400 transition-all cursor-pointer group"
          title="View all queue requests"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-mono uppercase group-hover:text-slate-900 transition-colors">
              Total Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-200">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-['Plus_Jakarta_Sans']">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>Cumulative intake</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/requests?status=approved')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-emerald-400 transition-all cursor-pointer group"
          title="View auto-processed requests"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-mono uppercase group-hover:text-emerald-700 transition-colors">
              Auto Processed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2 font-['Plus_Jakarta_Sans']">
            {stats.autoProcessed}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-mono font-medium flex items-center space-x-1">
            <span>{autoRate}% automation rate</span>
            <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/requests?status=pending_review')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-amber-400 transition-all cursor-pointer group"
          title="View requests awaiting department review"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-mono uppercase group-hover:text-amber-700 transition-colors">
              Awaiting Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-2 font-['Plus_Jakarta_Sans']">
            {stats.awaitingReview}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 flex items-center space-x-1">
            <span>Department exceptions</span>
            <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/requests?status=blocked')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-rose-400 transition-all cursor-pointer group"
          title="View blocked requests"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-mono uppercase group-hover:text-rose-700 transition-colors">
              Blocked
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-700 mt-2 font-['Plus_Jakarta_Sans']">
            {stats.blocked}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center space-x-1">
            <span>Policy violations</span>
            <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* Analytics Chart & Workflow Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Efficiency Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                Workflow Efficiency Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic rule outcomes vs manual exception reviews
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/requests')}
              className="text-xs font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold hover:bg-emerald-100 transition-colors"
            >
              {autoRate}% Routine Work Automated
            </button>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => navigate('/admin/requests?status=approved')}
              className="p-2 rounded-lg bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors cursor-pointer text-left"
            >
              <span className="text-[10px] text-slate-500 block">Auto Approved</span>
              <span className="text-sm font-bold text-emerald-700">{stats.autoProcessed} requests</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/requests?status=pending_review')}
              className="p-2 rounded-lg bg-amber-50/50 hover:bg-amber-100/70 transition-colors cursor-pointer text-left"
            >
              <span className="text-[10px] text-slate-500 block">Review Required</span>
              <span className="text-sm font-bold text-amber-700">{stats.awaitingReview} requests</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/requests?status=blocked')}
              className="p-2 rounded-lg bg-rose-50/50 hover:bg-rose-100/70 transition-colors cursor-pointer text-left"
            >
              <span className="text-[10px] text-slate-500 block">Blocked Policy</span>
              <span className="text-sm font-bold text-rose-700">{stats.blocked} requests</span>
            </button>
          </div>
        </div>

        {/* Operating Principle Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-sky-300 flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Architectural Principle
              </span>
              <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-white mt-1">
                Rules decide eligibility. AI understands and explains.
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              CampusFlow ensures the LLM never independently makes approval decisions. The deterministic institutional engine enforces attendance, fees, and enrollment criteria with complete mathematical certainty.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Human In The Loop</span>
            <span className="font-mono text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Exception Triage Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              High-Priority Exception Triage Queue
            </h3>
            <p className="text-xs text-slate-500">
              Requests flagged by the rule engine requiring officer decision
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/requests')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All ({stats.total})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No exceptions 🎉</h4>
            <p className="text-xs text-slate-500">
              All document requests are currently processed successfully.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-subtle hover:border-amber-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {req.id}
                    </span>
                    <Badge status="pending_review" />
                    <Badge status={req.route || 'ACCOUNTS'} variant="department" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {req.studentName} ({req.studentId}) — {req.documentType}
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-amber-800">Issue:</span>{' '}
                    {req.ruleEvaluation?.reasons?.join(', ') || 'Department clearance required'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Submitted: {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Purpose: {req.aiUnderstanding?.purpose || 'Internship'}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/admin/requests/${req.id}`)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center space-x-1.5 flex-shrink-0"
                >
                  <span>Review Decision</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
