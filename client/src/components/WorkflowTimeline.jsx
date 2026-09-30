import React from 'react';
import { CheckCircle2, Circle, Clock, Ban, Sparkles, FileText, UserCheck, ShieldAlert, Award, QrCode } from 'lucide-react';

export default function WorkflowTimeline({ currentStage, status = 'approved', isAnimating = false }) {
  // 6 standard stages
  const stages = [
    { id: 'received', title: 'Request received', desc: 'Natural language request submitted', icon: FileText },
    { id: 'ai_understood', title: 'AI understood request', desc: 'Entities & intent parsed with confidence', icon: Sparkles },
    { id: 'record_retrieved', title: 'Student record retrieved', desc: 'Institutional DB profile linked', icon: UserCheck },
    { id: 'eligibility_evaluated', title: 'Eligibility evaluated', desc: 'Deterministic policy rules checked', icon: ShieldAlert },
    { id: 'certificate_generated', title: 'Certificate generation', desc: 'Official signed document rendered', icon: Award },
    { id: 'qr_verified', title: 'QR verification', desc: 'Cryptographic token stamped & verified', icon: QrCode },
  ];

  // Map stage to index
  const stageMap = {
    received: 0,
    ai_understood: 1,
    record_retrieved: 2,
    eligibility_evaluated: 3,
    certificate_generated: 4,
    qr_verified: 5
  };

  const activeIdx = stageMap[currentStage] !== undefined ? stageMap[currentStage] : (status === 'approved' ? 5 : 3);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider font-mono">
            Workflow Execution Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated verification & rule evaluation checkpoints
          </p>
        </div>
        <div className="text-xs font-mono px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
          Step {Math.min(activeIdx + 1, stages.length)} of {stages.length}
        </div>
      </div>

      <div className="relative pl-6 space-y-7 before:absolute before:left-[17px] before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
        {stages.map((stage, idx) => {
          const isDone = idx < activeIdx || (idx === activeIdx && (status === 'approved' || activeIdx === 5));
          const isCurrent = idx === activeIdx && status !== 'approved' && status !== 'blocked';
          const isBlocked = status === 'blocked' && idx === activeIdx;
          const isReview = status === 'pending_review' && idx === 3;
          const isPending = idx > activeIdx;

          const IconComponent = stage.icon;

          return (
            <div key={stage.id} className="relative flex items-start group">
              {/* Checkpoint Marker */}
              <div
                className={`absolute -left-[35px] flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                  isBlocked
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : isReview && idx === 3
                    ? 'bg-amber-50 border-amber-300 text-amber-600 animate-pulse'
                    : isDone
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-indigo-600 border-indigo-700 text-white animate-workflow-pulse'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isBlocked ? (
                  <Ban className="w-4 h-4" />
                ) : isReview && idx === 3 ? (
                  <Clock className="w-4 h-4" />
                ) : isDone ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                ) : (
                  <Circle className="w-3.5 h-3.5 stroke-[1.5]" />
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 ml-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      isDone
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-indigo-600'
                        : isReview && idx === 3
                        ? 'text-amber-700'
                        : isBlocked
                        ? 'text-rose-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </span>

                  {isDone && (
                    <span className="text-[10px] font-mono font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                      Completed
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/50 animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isReview && idx === 3 && (
                    <span className="text-[10px] font-mono font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                      Routed to Review
                    </span>
                  )}
                  {isBlocked && (
                    <span className="text-[10px] font-mono font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/50">
                      Blocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
