import React from 'react';

export default function Logo({ size = 'default', showTagline = false }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconSize = isSmall ? 'w-7 h-7' : isLarge ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center space-x-2.5 select-none">
      {/* Abstract icon: Document + Checkmark + Workflow Nodes */}
      <div className={`${iconSize} relative rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white flex-shrink-0 border border-indigo-400/20`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          {/* Document outline */}
          <path d="M7 3h7l5 5v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <polyline points="14 3 14 8 19 8" />
          {/* Embedded verification checkmark */}
          <path d="M9 14.5l2 2 4.5-4.5" className="stroke-sky-300" strokeWidth="2.5" />
        </svg>
        {/* Subtle workflow node pulse */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 border border-white"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5 leading-none">
          <span className={`font-bold tracking-tight text-slate-900 ${titleSize} font-['Plus_Jakarta_Sans']`}>
            CampusFlow
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-md uppercase">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
            Intelligent Document Workflows
          </span>
        )}
      </div>
    </div>
  );
}
