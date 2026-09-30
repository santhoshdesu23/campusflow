import React, { useState } from 'react';
import {
  X,
  Save,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Bell,
  ToggleLeft,
  ToggleRight,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [feeTolerance, setFeeTolerance] = useState(0);
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(true);
  const [accountsEmail, setAccountsEmail] = useState('accounts@campusflow.demo');
  const [academicEmail, setAcademicEmail] = useState('academic.dean@campusflow.demo');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!isAdmin) {
      addToast('Unauthorized: Only administrators have authority to modify institutional policy settings.', 'error');
      return;
    }
    addToast('Institutional policy settings updated successfully!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/80">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">Institutional Policy Settings</h3>
                {isAdmin ? (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    Admin Console
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-mono px-2 py-0.5 rounded-full border border-amber-200 font-semibold flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5 mr-0.5 inline" />
                    Student View-Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Configured institutional rules for deterministic evaluation</p>
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Authority Banner */}
          {!isAdmin ? (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="font-bold block">Institutional Policy (View-Only Access for Students)</span>
                <span className="text-[11px] text-amber-700/90 block mt-0.5 leading-relaxed">
                  Students do not have authority to alter attendance thresholds or automated processing rules. All institutional policies are strictly controlled by the Academic Registrar (admin@campusflow.com).
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="font-bold block">Administrator Policy Authority Granted</span>
                <span className="text-[11px] text-emerald-700/90 block mt-0.5 leading-relaxed">
                  Authenticated as System Administrator. You have full authority to modify attendance eligibility thresholds, routine automated processing, and department routing.
                </span>
              </div>
            </div>
          )}

          {/* Rule 1: Attendance Threshold */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 block text-xs">Minimum Attendance Threshold</span>
                  {!isAdmin && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      <Lock className="w-2.5 h-2.5 mr-0.5" />
                      Admin Authority Only
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {isAdmin
                    ? 'Adjust attendance requirement for automated certificate eligibility'
                    : 'Students cannot increase or decrease institutional attendance thresholds'}
                </span>
              </div>
              <span className="text-sm font-mono font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                {attendanceThreshold}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={attendanceThreshold}
              disabled={!isAdmin}
              onChange={isAdmin ? (e) => setAttendanceThreshold(Number(e.target.value)) : undefined}
              className={`w-full accent-indigo-600 ${
                isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
              }`}
              title={isAdmin ? 'Adjust attendance threshold' : 'Authority restricted to Administrators only'}
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>50% (Lenient)</span>
              <span>75% (Standard Policy)</span>
              <span>90% (Strict)</span>
            </div>

            {!isAdmin && (
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200/80 text-[11px] text-slate-600 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Authority restricted: Only administrators can increase or decrease this threshold.</span>
              </div>
            )}
          </div>

          {/* Rule 2: Automated Approval Policy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-0.5 max-w-sm">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 block text-xs">Automated Routine Processing</span>
                {!isAdmin && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                    Admin Authority Only
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 block leading-relaxed">
                {isAdmin
                  ? 'Immediately issue signed certificate & QR code when all 4 deterministic rules pass without staff intervention'
                  : 'Automatic routine processing toggle is locked. Policy control is restricted to administrators.'}
              </span>
            </div>
            <button
              type="button"
              disabled={!isAdmin}
              onClick={isAdmin ? () => setAutoApprovalEnabled(!autoApprovalEnabled) : undefined}
              className={`transition-opacity ${
                isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
              }`}
              title={isAdmin ? 'Toggle automated processing' : 'Authority restricted to Administrators only'}
            >
              {autoApprovalEnabled ? (
                <ToggleRight className="w-8 h-8 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-400" />
              )}
            </button>
          </div>

          {/* Rule 3: Department Routing Contacts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase font-mono tracking-wider block text-[11px]">
                Department Escalation Routing
              </span>
              {!isAdmin && (
                <span className="text-[10px] text-slate-400 font-mono">View Only</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  Accounts Clearance Officer
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    value={accountsEmail}
                    disabled={!isAdmin}
                    onChange={isAdmin ? (e) => setAccountsEmail(e.target.value) : undefined}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg text-xs ${
                      isAdmin
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  Academic Affairs Officer
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    value={academicEmail}
                    disabled={!isAdmin}
                    onChange={isAdmin ? (e) => setAcademicEmail(e.target.value) : undefined}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg text-xs ${
                      isAdmin
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[11px] text-slate-400 font-mono">
            Enforced server-side in ruleEngine.js
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isAdmin ? 'Cancel' : 'Close'}
            </button>
            {isAdmin ? (
              <button
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Policies</span>
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 text-xs font-medium text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed flex items-center space-x-1.5 border border-slate-200"
                title="Only administrators have authority to modify institutional policies"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Authority Required</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
