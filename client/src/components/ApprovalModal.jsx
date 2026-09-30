import React, { useState } from 'react';
import { CheckCircle2, Award, QrCode, ShieldCheck, X, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function ApprovalModal({ isOpen, onClose, onConfirm, requestId, studentName }) {
  const [step, setStep] = useState('confirm'); // 'confirm' | 'animating' | 'done'
  const [animationStep, setAnimationStep] = useState(0);
  const [note, setNote] = useState('');
  const [generatedCert, setGeneratedCert] = useState(null);

  if (!isOpen) return null;

  const handleStartApproval = async () => {
    setStep('animating');
    setAnimationStep(1); // Generating certificate

    // Animated progression
    setTimeout(() => setAnimationStep(2), 700); // Generating QR
    setTimeout(() => setAnimationStep(3), 1400); // Creating verification record

    try {
      const res = await onConfirm(note);
      setTimeout(() => {
        setGeneratedCert(res?.certificate);
        setStep('done');
        // Trigger celebratory confetti for smooth micro-interaction
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }, 2000);
    } catch (err) {
      alert('Approval action failed: ' + err.message);
      setStep('confirm');
    }
  };

  const resetAndClose = () => {
    setStep('confirm');
    setAnimationStep(0);
    setNote('');
    setGeneratedCert(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {step === 'done' ? 'Certificate Issued' : 'Approve Request Exception'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Request #{requestId}
              </p>
            </div>
          </div>
          {step !== 'animating' && (
            <button
              onClick={resetAndClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body content based on step */}
        <div className="p-6">
          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                You are about to authorize an official exception approval for{' '}
                <span className="font-semibold text-slate-900">{studentName}</span>.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
                  This administrative action will:
                </div>
                <div className="space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Mark request status as Approved</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Generate authentic Bonafide PDF certificate</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Create cryptographic QR verification token</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Log institutional audit trail record</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Review Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Fee clearance receipt #8812 verified manually"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartApproval}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Approval</span>
                </button>
              </div>
            </div>
          )}

          {step === 'animating' && (
            <div className="py-8 space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 relative">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-3 max-w-xs mx-auto text-left">
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-800">Approved ✓</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs font-semibold transition-opacity duration-300 ${animationStep >= 1 ? 'opacity-100 text-slate-800' : 'opacity-30 text-slate-400'}`}>
                  {animationStep >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Award className="w-4 h-4 text-indigo-600 animate-pulse" />
                  )}
                  <span>Generating certificate...</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs font-semibold transition-opacity duration-300 ${animationStep >= 2 ? 'opacity-100 text-slate-800' : 'opacity-30 text-slate-400'}`}>
                  {animationStep >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <QrCode className="w-4 h-4 text-indigo-600 animate-pulse" />
                  )}
                  <span>Generating QR cryptographic seal...</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs font-semibold transition-opacity duration-300 ${animationStep >= 3 ? 'opacity-100 text-slate-800' : 'opacity-30 text-slate-400'}`}>
                  <ShieldCheck className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>Creating verification record...</span>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-4 space-y-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Certificate Generated Successfully
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  The document is digitally signed, stored in the public registry, and ready for verification.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const certId = generatedCert?.certificateId || `CERT-2026-${requestId.replace('CF-2026-', '')}`;
                    window.open(`${api.defaults.baseURL}/certificates/${certId}/download`, '_blank');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Close & View Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
