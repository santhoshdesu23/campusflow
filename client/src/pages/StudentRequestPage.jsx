import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import WorkflowTimeline from '../components/WorkflowTimeline';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
  Briefcase,
  FileCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function StudentRequestPage() {
  const { user, student } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState(
    'I need proof that I am currently studying here for my internship at ABC Technologies.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(null);
  const [createdRequest, setCreatedRequest] = useState(null);

  // Quick preset sample prompts for seamless demoing
  const demoPrompts = [
    {
      title: 'Internship Verification (ABC Tech)',
      text: 'I need proof that I am currently studying here for my internship at ABC Technologies.'
    },
    {
      title: 'Passport Application',
      text: 'I require a bonafide letter for my regional passport office appointment next week.'
    },
    {
      title: 'Bank Education Loan',
      text: 'Please provide bonafide certification for State Bank of India education loan application.'
    },
    {
      title: 'Incomplete Prompt (Missing info test)',
      text: 'I need a document for college.'
    }
  ];

  const handleAnalyze = async () => {
    if (!prompt.trim() || prompt.trim().length < 5) {
      addToast('Please enter a description of what you need', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAiData(null);

    try {
      const res = await api.post('/ai/parse-request', { prompt });
      if (res.data.success) {
        setAiData(res.data.data);
      }
    } catch (err) {
      addToast('AI analysis encountered an issue. Using fallback parser.', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    setActiveWorkflowStage('received');

    try {
      // Step-by-step interactive simulated intake timeline
      setTimeout(() => setActiveWorkflowStage('ai_understood'), 600);
      setTimeout(() => setActiveWorkflowStage('record_retrieved'), 1200);
      setTimeout(() => setActiveWorkflowStage('eligibility_evaluated'), 1800);

      const res = await api.post('/requests', {
        prompt,
        documentType: aiData?.documentType || 'Bonafide Certificate',
        purpose: aiData?.purpose || 'Internship',
        organization: aiData?.organization || 'ABC Technologies'
      });

      if (res.data.success) {
        const reqResult = res.data.data;
        setCreatedRequest(reqResult);

        if (reqResult.decision === 'AUTO_APPROVE') {
          setTimeout(() => setActiveWorkflowStage('certificate_generated'), 2400);
          setTimeout(() => setActiveWorkflowStage('qr_verified'), 3000);
          setTimeout(() => {
            addToast('Request Auto-Approved! Certificate generated.', 'success');
            navigate(`/student/requests/${reqResult.id}`);
          }, 3600);
        } else if (reqResult.decision === 'REVIEW') {
          setTimeout(() => {
            addToast(`Request submitted. Routed to ${reqResult.route} Department.`, 'info');
            navigate(`/student/requests/${reqResult.id}`);
          }, 2400);
        } else {
          setTimeout(() => {
            addToast('Request Blocked: Inactive enrollment status', 'error');
            navigate(`/student/requests/${reqResult.id}`);
          }, 2400);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      addToast(err.response?.data?.message || 'Failed to submit request', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
          Natural Language Intake
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-2">
          Create a document request
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Describe what you need in your own words. CampusFlow AI will parse your intent, verify institutional eligibility rules, and automate issuance.
        </p>
      </div>

      {/* Main Request Form or Animated Timeline */}
      {isSubmitting ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
            <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Processing Document Request
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluating institutional rules and generating cryptographic credential...
            </p>
          </div>

          <WorkflowTimeline
            currentStage={activeWorkflowStage}
            status={createdRequest?.status || 'processing'}
            isAnimating={true}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Preset Prompts */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase font-mono tracking-wider">
                Demo Quick Prompts
              </span>
              <span className="text-[11px] text-slate-400">Click to fill</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {demoPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(p.text);
                    setAiData(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 transition-colors shadow-subtle text-left"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                Tell CampusFlow what you need:
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (aiData) setAiData(null);
                }}
                placeholder="I need proof that I am currently studying here for my internship at ABC Technologies."
                className="w-full text-sm p-4 bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all resize-none font-sans"
              />
            </div>

            {/* Feature checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Document type</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Request purpose</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Target organization</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Missing information</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                {prompt.length} characters
              </span>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !prompt.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Understanding your request...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Understanding Card */}
          {aiData && (
            <div className="bg-white border-2 border-indigo-200/80 rounded-2xl p-6 shadow-md space-y-6 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-wide font-mono uppercase">
                      AI UNDERSTANDING
                    </h3>
                    <p className="text-xs text-slate-500">
                      Structured extraction from natural language
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 font-mono">
                  <span>Confidence:</span>
                  <span className="text-indigo-900 font-bold">{aiData.confidence || 'High'}</span>
                </div>
              </div>

              {/* Extraction Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Document
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {aiData.documentType || 'Bonafide Certificate'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Purpose
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {aiData.purpose || 'Official Verification'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Organization
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {aiData.organization || 'Official Records'}
                  </span>
                </div>
              </div>

              {/* Validation Feedback & Missing info check */}
              {aiData.requiredInfoDetected ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center space-x-2 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>✓ Required information detected. Ready for institutional policy validation.</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Additional information needed: Which certificate do you need?</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAiData({ ...aiData, requiredInfoDetected: true, documentType: 'Bonafide Certificate' })}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm"
                    >
                      Bonafide Certificate
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-lg text-xs font-medium cursor-not-allowed"
                    >
                      No-Dues (Coming soon)
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-lg text-xs font-medium cursor-not-allowed"
                    >
                      NOC (Coming soon)
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAiData(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Edit Input
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={!aiData.requiredInfoDetected}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>Submit Request & Run Rules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
