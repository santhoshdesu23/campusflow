import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Badge from '../components/Badge';
import WorkflowTimeline from '../components/WorkflowTimeline';
import CertificatePreviewModal from '../components/CertificatePreviewModal';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Award,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building,
  ArrowLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function StudentRequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch request detail', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-slate-500">Retrieving student workflow state...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Request not found.</p>
        <button
          onClick={() => navigate('/student')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { aiUnderstanding, ruleEvaluation, decisionExplanation, certificate } = request;
  const isApproved = request.status === 'approved';
  const isPending = request.status === 'pending_review';
  const isBlocked = request.status === 'blocked';

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Back button & Header */}
      <div>
        <button
          onClick={() => navigate('/student')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-500">{request.id}</span>
              <Badge status={request.status} />
              {request.route && <Badge status={request.route} variant="department" />}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-1">
              {request.documentType}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted on {new Date(request.submittedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {isApproved && certificate && (
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => window.open(`${api.defaults.baseURL}/certificates/${certificate.certificateId}/download`, '_blank')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Progress Timeline */}
      <WorkflowTimeline
        currentStage={
          isApproved
            ? 'qr_verified'
            : isBlocked
            ? 'eligibility_evaluated'
            : 'eligibility_evaluated'
        }
        status={request.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Request & AI Understanding */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Request Information</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Purpose</span>
                <span className="font-bold text-slate-900 text-sm">
                  {aiUnderstanding?.purpose || 'Official Verification'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Organization</span>
                <span className="font-semibold text-slate-800">
                  {aiUnderstanding?.organization || 'Official Records'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Original Student Input</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1 italic leading-relaxed">
                  "{request.rawPrompt}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Institutional Eligibility Matrix & Decision Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligibility Matrix */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Institutional Eligibility Matrix
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Server-side deterministic checks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ruleEvaluation?.resultsList?.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                    item.passed
                      ? 'bg-emerald-50/50 border-emerald-200/70 text-emerald-950'
                      : 'bg-rose-50/50 border-rose-200/70 text-rose-950'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{item.rule}</span>
                      <span className="text-[11px] font-mono font-semibold">
                        {item.passed ? '✓ Passed' : '✕ Failed'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Outcome Card */}
          <div
            className={`p-6 rounded-2xl border ${
              isApproved
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : isPending
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="mt-1 flex-shrink-0">
                {isApproved ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : isPending ? (
                  <Clock className="w-6 h-6 text-amber-600" />
                ) : (
                  <Ban className="w-6 h-6 text-rose-600" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-base font-bold font-['Plus_Jakarta_Sans']">
                  {decisionExplanation?.title || (isApproved ? 'Eligible for automated processing' : 'Review Required')}
                </h4>
                <p className="text-xs leading-relaxed text-slate-700">
                  {decisionExplanation?.summary ||
                    'All configured institutional requirements have been evaluated against your official student record.'}
                </p>

                {isApproved && certificate && (
                  <div className="pt-3 flex items-center space-x-3">
                    <button
                      onClick={() => setIsCertModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Generated Certificate</span>
                    </button>
                    <button
                      onClick={() => window.open(`${api.defaults.baseURL}/certificates/${certificate.certificateId}/download`, '_blank')}
                      className="px-4 py-2 bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                )}

                {isPending && (
                  <div className="pt-2 text-xs font-semibold text-amber-800">
                    Currently being reviewed by the{' '}
                    <span className="underline uppercase">{request.route}</span> Department. You will receive an automated notification once cleared.
                  </div>
                )}

                {isBlocked && (
                  <div className="pt-2 text-xs font-semibold text-rose-800">
                    Automated issuance blocked due to inactive enrollment. Please contact the Registrar Office in person.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decision Explanation Collapsible */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-subtle">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
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
              <div className="p-5 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/50">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Deterministic Decision Logic Trace
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
                {decisionExplanation?.conclusion && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs font-semibold text-indigo-950">
                    <span className="text-indigo-600 font-mono">Conclusion: </span>
                    {decisionExplanation.conclusion}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-1 font-mono italic">
                  * Decision generated from configured institutional rules. AI only generates the human-readable explanation.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificatePreviewModal
        certificate={certificate}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}
