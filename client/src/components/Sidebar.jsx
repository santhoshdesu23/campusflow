import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';
import {
  LayoutDashboard,
  FileText,
  Award,
  QrCode,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  X,
  User,
  PlusCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, student, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAdmin
    ? [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
        { name: 'Requests', path: '/admin/requests', icon: FileText },
        { name: 'Certificates', path: '/admin/certificates', icon: Award },
        { name: 'Verification', path: '/verify/CERT-2026-00124', icon: QrCode },
        { name: 'Audit Logs', path: '/admin/audit', icon: ShieldCheck },
      ]
    : [
        { name: 'Profile Dashboard', path: '/student', icon: LayoutDashboard },
        { name: 'New Request', path: '/student/request', icon: PlusCircle, highlight: true },
        { name: 'My Requests', path: '/student/requests', icon: FileText },
        { name: 'Certificates', path: '/student/certificates', icon: Award },
        { name: 'Verification', path: '/verify/CERT-2026-00124', icon: QrCode },
      ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="cursor-pointer" onClick={() => navigate(isAdmin ? '/admin' : '/student')}>
          <Logo size="default" showTagline={false} />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Workflow Platform
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${item.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white shadow-sm' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    item.highlight
                      ? 'text-white'
                      : isActive
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.highlight && (
                <span className="flex items-center space-x-1 text-[10px] bg-white/20 text-white font-mono px-1.5 py-0.5 rounded">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI</span>
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          System & Help
        </div>
        <button
          onClick={() => {
            if (onClose) onClose();
            setIsSettingsOpen(true);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </div>
          {isAdmin ? (
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.5 rounded border border-indigo-200 font-semibold">
              Admin
            </span>
          ) : (
            <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded">
              Policy
            </span>
          )}
        </button>
        <button
          onClick={() => {
            if (onClose) onClose();
            setIsHelpOpen(true);
          }}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Documentation</span>
        </button>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs text-white flex-shrink-0 ${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'}`}>
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || 'Guest User'}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  {isAdmin ? 'ADMIN OFFICER' : student?.studentId || 'STUDENT'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}
