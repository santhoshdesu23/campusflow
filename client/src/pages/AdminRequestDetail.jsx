import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Badge from '../components/Badge';
import ApprovalModal from '../components/ApprovalModal';
import CertificatePreviewModal from '../components/CertificatePreviewModal';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  Download,
  Eye,
  Send,
  Mail,
  FileText,
  User,
  GitBranch,
  ChevronDown,
  ChevronUp,
  History,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function AdminRequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showDraft, setShowDraft] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [routingDept, setRoutingDept] = useState('');
  const [routingReason, setRoutingReason] = useState('');
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data);
        setRoutingDept(res.data.data.route || 'ACCOUNTS');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load request detail', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveConfirm = async (note) => {
    const res = await api.post(`/admin/requests/${id}/approve`, { note });
    if (res.data.success) {
      setRequest((prev) => ({
        ...prev,
        status: 'approved',
        certificate: res.data.data.certificate,
        certificateId: res.data.data.certificate?.certificateId,
        auditLogs: res.data.data.auditLogs
      }));
      addToast('Request exception approved & certificate generated!', 'success');
      return res.data.data;
    }
    throw new Error(res.data.message || 'Approval failed');
  };

  const handleReject = async () => {
    const reason = window.prompt('Enter institutional rejection reason:');
    if (!reason) return;

    try {
      const res = await api.post(`/admin/requests/${id}/reject`, { reason });
      if (res.data.success) {
        setRequest((prev) => ({
          ...prev,
          status: 'rejected',
          auditLogs: res.data.data.auditLogs
        }));
        addToast('Request has been marked as rejected', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to reject request', 'error');
    }
  };

  const handleRequestInfo = async () => {
    const message = window.prompt(
      'Enter information/documentation required from student:',
      'Please submit fee clearance receipt from Accounts department.'
    );
    if (!message) return;

    try {
      const res = await api.post(`/admin/requests/${id}/request-info`, { message });
      if (res.data.success) {
        setRequest((prev) => ({
          ...prev,
          auditLogs: res.data.auditLogs
        }));
        addToast('Information request dispatched to student portal', 'success');
      }
    } catch (err) {
      addToast('Failed to dispatch request', 'error');
    }
  };

  const handleRouteDepartment = async () => {
    if (!routingDept) return;
    setIsRouting(true);
    try {
      const res = await api.post(`/admin/requests/${id}/route`, {
        department: routingDept,
        reason: routingReason || `Routed by ${user.name}`
      });
      if (res.data.success) {
        setRequest((prev) => ({
          ...prev,
          route: routingDept.toUpperCase()
        }));
        addToast(`Successfully routed to ${routingDept.toUpperCase()} Department!`, 'success');
        fetchDetail();
      }
    } catch (err) {
      addToast('Failed to route exception', 'error');
    } finally {
      setIsRouting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-slate-500">Retrieving request & institutional data...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Request not found.</p>
        <button
          onClick={() => navigate('/admin/requests')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  const { student, aiUnderstanding, ruleEvaluation, decisionExplanation, certificate, auditLogs, adminDraft } = request;
  const isApproved = request.status === 'approved';
  const isPending = request.status === 'pending_review';
  const isBlocked = request.status === 'blocked';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/requests')}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-500">{request.id}</span>
              <Badge status={request.status} />
              {request.route && <Badge status={request.route} variant="department" />}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-0.5">
              {request.studentName} — {request.documentType}
            </h1>
          </div>
        </div>

        {/* Top actions if approved */}
        {isApproved && certificate && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Certificate</span>
            </button>
            <button
              onClick={() => window.open(`/api/certificates/${certificate.certificateId}/download`, '_blank')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* 3-COLUMN ENTERPRISE SaaS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= COLUMN 1: Student Record & Raw Request (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                {student?.name?.[0] || 'S'}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{student?.name}</h3>
                <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                  {student?.studentId}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Academic Program</span>
                <span className="font-semibold text-slate-800">{student?.program}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-mono">Year</span>
                  <span className="font-semibold text-slate-800">{student?.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Semester</span>
                  <span className="font-semibold text-slate-800">{student?.semester}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-mono">CGPA</span>
                  <span className="font-bold text-slate-900">{student?.cgpa} / 10.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Contact</span>
                  <span className="font-semibold text-slate-700">{student?.phone}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Institutional Email</span>
                <span className="font-mono text-[11px] text-slate-700 truncate block">
                  {student?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Raw Prompt Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Student Input
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Verbatim</span>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 italic leading-relaxed">
              "{request.rawPrompt}"
            </p>
          </div>
        </div>

        {/* ================= COLUMN 2: AI Understanding + Eligibility Matrix (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Understanding Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  AI UNDERSTANDING
                </h3>
              </div>
              <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Confidence: {aiUnderstanding?.confidence || 'High'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono block">Document</span>
                <span className="font-bold text-slate-900">{aiUnderstanding?.documentType}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono block">Purpose</span>
                <span className="font-bold text-slate-900">{aiUnderstanding?.purpose}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono block">Organization</span>
                <span className="font-bold text-slate-900">{aiUnderstanding?.organization || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Eligibility Matrix */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Deterministic Eligibility Evaluation
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Server-Enforced
              </span>
            </div>

            <div className="space-y-2.5">
              {ruleEvaluation?.resultsList?.map((check, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    check.passed
                      ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950'
                      : 'bg-rose-50/50 border-rose-200/80 text-rose-950'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">{check.rule}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Record: {check.value} (Required: {check.required})
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      check.passed
                        ? 'bg-emerald-100/70 text-emerald-800'
                        : 'bg-rose-100/70 text-rose-800'
                    }`}
                  >
                    {check.passed ? '✓ Passed' : '✕ Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Explanation Trace */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-subtle">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Why did CampusFlow make this decision?
                </span>
              </div>
              {showExplanation ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showExplanation && (
              <div className="p-5 pt-0 border-t border-slate-100 space-y-3 bg-slate-50/50">
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider pt-3">
                  Decision Logic Breakdown
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  {decisionExplanation?.points?.map((pt, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="font-mono text-slate-400 font-bold flex-shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 mt-2 text-xs font-semibold text-slate-900">
                  <span className="text-indigo-600 font-mono">Therefore: </span>
                  {decisionExplanation?.conclusion}
                </div>

                <div className="text-[10px] text-slate-400 font-mono italic">
                  * Decision generated from configured institutional rules. AI only generates the human-readable explanation.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: Decision & Action Console (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Decision Status Box */}
          <div
            className={`p-6 rounded-2xl border ${
              isApproved
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : isPending
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                {isApproved ? 'AUTO APPROVED' : isPending ? 'REVIEW REQUIRED' : 'BLOCKED'}
              </span>
              <span className="text-xs font-mono font-semibold">
                Priority: {ruleEvaluation?.priority || 'Medium'}
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div>
                <span className="text-slate-500 block font-mono text-[10px] uppercase">
                  Issue Detected
                </span>
                <p className="font-bold text-sm mt-0.5">
                  {ruleEvaluation?.reasons?.join(', ') || 'No institutional flags'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block font-mono text-[10px] uppercase">
                  Recommended Department
                </span>
                <div className="mt-1">
                  <Badge status={request.route || 'ACCOUNTS'} variant="department" />
                </div>
              </div>

              <div>
                <span className="text-slate-500 block font-mono text-[10px] uppercase">
                  Recommended Action
                </span>
                <p className="text-slate-700 leading-relaxed mt-0.5">
                  {ruleEvaluation?.recommendedAction ||
                    'Verify student clearance before authorizing certificate generation.'}
                </p>
              </div>
            </div>

            {/* Action Buttons for Admin */}
            <div className="mt-6 pt-4 border-t border-black/5 space-y-2.5">
              {isPending && (
                <>
                  <button
                    onClick={() => setIsApproveModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Exception</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleReject}
                      className="py-2 px-3 border border-rose-300 text-rose-700 hover:bg-rose-100/50 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={handleRequestInfo}
                      className="py-2 px-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Request Info
                    </button>
                  </div>
                </>
              )}

              {isApproved && (
                <div className="space-y-2">
                  <button
                    onClick={() => setIsCertModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Official Certificate</span>
                  </button>
                  <button
                    onClick={() =>
                      window.open(`/api/certificates/${certificate?.certificateId || request.certificateId}/download`, '_blank')
                    }
                    className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Certificate</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Exception Routing Panel */}
          {isPending && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <GitBranch className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Exception Routing
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">
                    Route To Department:
                  </label>
                  <select
                    value={routingDept}
                    onChange={(e) => setRoutingDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="ACCOUNTS">Accounts Department</option>
                    <option value="ACADEMIC">Academic Affairs</option>
                    <option value="REGISTRAR">Registrar Office</option>
                    <option value="ADMINISTRATION">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">
                    Internal Routing Note (Optional):
                  </label>
                  <input
                    type="text"
                    value={routingReason}
                    onChange={(e) => setRoutingReason(e.target.value)}
                    placeholder="e.g. Verify fee receipt from student portal"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRouteDepartment}
                  disabled={isRouting}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to {routingDept}</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Admin Draft Message */}
          {adminDraft && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    AI Administrative Draft
                  </span>
                </div>
                <button
                  onClick={() => setShowDraft(!showDraft)}
                  className="text-xs text-indigo-600 font-semibold"
                >
                  {showDraft ? 'Hide' : 'View'}
                </button>
              </div>

              {showDraft && (
                <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-mono text-[10px]">
                    To: {adminDraft.recipient}
                  </div>
                  <div className="font-semibold text-slate-900">
                    Subject: {adminDraft.subject}
                  </div>
                  <pre className="text-slate-700 whitespace-pre-wrap font-sans text-xs bg-white p-2.5 rounded-lg border border-slate-200 mt-2 leading-relaxed">
                    {adminDraft.body}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(adminDraft.body);
                      addToast('Draft copied to clipboard!', 'info');
                    }}
                    className="mt-2 text-indigo-600 text-[11px] font-semibold flex items-center space-x-1 hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Draft to Clipboard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= FULL AUDIT LOG TIMELINE (Bottom Section) ================= */}
      <div id="audit" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              Cryptographic Institutional Audit Trail
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Immutable Chronological Log
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {auditLogs?.map((log, idx) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            const dateStr = new Date(log.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={idx} className="flex items-start space-x-4 text-xs">
                <div className="font-mono text-slate-400 text-[11px] w-28 flex-shrink-0 pt-0.5">
                  {dateStr} {timeStr}
                </div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">by</span>
                    <span className="font-semibold text-indigo-700 text-[11px]">
                      {log.actor}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{log.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <ApprovalModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        requestId={request.id}
        studentName={request.studentName}
      />

      <CertificatePreviewModal
        certificate={certificate}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}
