import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Menu,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Navbar({ onMenuClick, title, breadcrumbs = [] }) {
  const { user, student, isAdmin, isStudent } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 'notif_1',
      title: 'Certificate Issued',
      desc: 'Bonafide Certificate CF-2026-00124 has been cryptographically signed.',
      time: '10m ago',
      type: 'success',
      link: isAdmin ? '/admin/requests/CF-2026-00124' : '/student/requests/CF-2026-00124'
    },
    {
      id: 'notif_2',
      title: 'Fee Exception Flagged',
      desc: 'Tanmay Trivedi request CF-2026-00125 requires Accounts verification.',
      time: '25m ago',
      type: 'warning',
      link: isAdmin ? '/admin/requests/CF-2026-00125' : '/student/requests/CF-2026-00125'
    },
    {
      id: 'notif_3',
      title: 'Academic Review Pending',
      desc: 'Vivaan Nanda request CF-2026-00126 attendance check below 75%.',
      time: '1h ago',
      type: 'warning',
      link: isAdmin ? '/admin/requests/CF-2026-00126' : '/student/requests/CF-2026-00126'
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Left side: Hamburger + Clickable Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <nav className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
            <span
              onClick={() => navigate(isAdmin ? '/admin' : '/student')}
              className="cursor-pointer hover:text-indigo-600 transition-colors"
            >
              CampusFlow
            </span>
            {breadcrumbs.map((crumb, idx) => {
              const label = typeof crumb === 'string' ? crumb : crumb.label;
              const path = typeof crumb === 'object' ? crumb.path : null;
              const isLast = idx === breadcrumbs.length - 1;

              return (
                <React.Fragment key={idx}>
                  <span>/</span>
                  {path && !isLast ? (
                    <button
                      type="button"
                      onClick={() => navigate(path)}
                      className="text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                    >
                      {label}
                    </button>
                  ) : (
                    <span className={isLast ? 'text-slate-800 font-semibold' : 'text-slate-500'}>
                      {label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
          {title && <h1 className="text-base font-bold text-slate-900 leading-tight mt-0.5">{title}</h1>}
        </div>
      </div>

      {/* Right side: Notifications + User Status Indicator */}
      <div className="flex items-center space-x-3">
        {/* Interactive Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Workflow Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                  Workflow Updates
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-semibold">
                  3 Updates
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(n.link);
                    }}
                    className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        {n.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(isAdmin ? '/admin/requests' : '/student/requests');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center space-x-1 mx-auto"
                >
                  <span>View All Workflow Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar indicator */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'}`}>
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isAdmin ? 'ADMIN' : student?.studentId || 'STUDENT'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
