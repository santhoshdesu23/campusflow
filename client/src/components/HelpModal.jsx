import React from 'react';
import { X, HelpCircle, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, UserCheck, FileText, QrCode } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/80">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">CampusFlow AI — System Documentation & Guide</h3>
              <p className="text-xs text-slate-500">Automate routine cases. Explain exceptions. Keep humans in control.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Core Mantra */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-2">
            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
              Fundamental Architecture
            </span>
            <h4 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              Rules decide eligibility. AI understands and explains.
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              CampusFlow ensures the LLM never independently makes approval decisions. The deterministic institutional engine enforces attendance, fees, and enrollment criteria with mathematical certainty. AI extracts parameters and drafts transparent explanations.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              The 6-Stage End-to-End Workflow
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">1. Student Intake</span>
                <span className="text-slate-500 text-[11px]">Natural language request entered in plain English.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">2. AI Understanding</span>
                <span className="text-slate-500 text-[11px]">Extracts document, purpose, organization & detects missing fields.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">3. Record Retrieval</span>
                <span className="text-slate-500 text-[11px]">Pulls official student standing (fees, attendance, holds).</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">4. Deterministic Rules</span>
                <span className="text-slate-500 text-[11px]">Enforces active enrollment, ₹0 fees, attendance ≥ 75%, and no holds.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">5. Automated Issuance or Routing</span>
                <span className="text-slate-500 text-[11px]">Auto-generates signed PDF or routes exceptions to department officers.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">6. QR Cryptographic Verification</span>
                <span className="text-slate-500 text-[11px]">Public trust registry for third parties to verify certificate validity.</span>
              </div>
            </div>
          </div>

          {/* Test Scenarios Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              Rule Engine Verification Matrix
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Aarav Sharma (NIAT2026AI001)</span>
                  <p className="text-[11px] text-emerald-800">Fees: ₹0 • Attendance: 88% • Active</p>
                </div>
                <span className="font-mono text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  AUTO APPROVED
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Tanmay Trivedi (NIAT2026AI031)</span>
                  <p className="text-[11px] text-amber-800">Fees: ₹8,500 due • Attendance: 84%</p>
                </div>
                <span className="font-mono text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  ROUTE: ACCOUNTS
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Vivaan Nanda (NIAT2026AI039)</span>
                  <p className="text-[11px] text-amber-800">Fees: ₹0 • Attendance: 68% (&lt; 75%)</p>
                </div>
                <span className="font-mono text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  ROUTE: ACADEMIC
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Gayathri S. (NIAT2026AI045)</span>
                  <p className="text-[11px] text-purple-800">Administrative Hold: Flagged</p>
                </div>
                <span className="font-mono text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                  ROUTE: REGISTRAR
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Madhavan N. (NIAT2026AI050)</span>
                  <p className="text-[11px] text-rose-800">Enrollment: Inactive</p>
                </div>
                <span className="font-mono text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                  BLOCKED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
