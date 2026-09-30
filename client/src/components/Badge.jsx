import React from 'react';
import { CheckCircle2, Clock, Ban, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Badge({ status, variant = 'status', className = '', showIcon = true }) {
  if (variant === 'department') {
    const dept = (status || '').toUpperCase();
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (dept === 'ACCOUNTS') colorClass = 'bg-blue-50 text-blue-700 border-blue-200/80';
    if (dept === 'ACADEMIC') colorClass = 'bg-purple-50 text-purple-700 border-purple-200/80';
    if (dept === 'REGISTRAR') colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';

    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${colorClass} ${className}`}>
        <span>{dept || 'General'}</span>
      </span>
    );
  }

  // Status variant
  const s = (status || '').toLowerCase();
  
  if (s === 'approved' || s === 'auto_approve' || s === 'valid') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 ${className}`}>
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
        <span>{s === 'auto_approve' ? 'Auto Approved' : 'Approved'}</span>
      </span>
    );
  }

  if (s === 'pending_review' || s === 'review') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/70 ${className}`}>
        {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
        <span>Review Required</span>
      </span>
    );
  }

  if (s === 'blocked') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/70 ${className}`}>
        {showIcon && <Ban className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />}
        <span>Blocked</span>
      </span>
    );
  }

  if (s === 'rejected') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
        <span>Rejected</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70 ${className}`}>
      {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>}
      <span>{status || 'Processing'}</span>
    </span>
  );
}
