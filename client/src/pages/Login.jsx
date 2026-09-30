import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import {
  Sparkles,
  GitBranch,
  QrCode,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  Mail,
  Loader2,
  GraduationCap,
  ShieldAlert,
  Zap
} from 'lucide-react';

const USER1_ACCOUNT = {
  key: 'user1',
  role: 'student',
  buttonLabel: 'User 1 (Student)',
  name: 'Aarav Sharma',
  email: 'NIAT2026AI001@gmail.com',
  password: 'Campus@123',
  id: 'NIAT2026AI001',
  badge: 'Clean Record (Auto-Approve)'
};

const USER2_ACCOUNTS = {
  tanmay: {
    key: 'user2',
    role: 'student',
    buttonLabel: 'User 2 (Student)',
    name: 'Tanmay Trivedi',
    email: 'NIAT2026AI031@gmail.com',
    password: 'Campus@123',
    id: 'NIAT2026AI031',
    badge: 'Fee Exception (Review)'
  },
  aditi: {
    key: 'user2',
    role: 'student',
    buttonLabel: 'User 2 (Student)',
    name: 'Aditi Verma',
    email: 'NIAT2026AI002@gmail.com',
    password: 'Campus@123',
    id: 'NIAT2026AI002',
    badge: 'Active Student (Yr 2)'
  }
};

const ADMIN_ACCOUNT = {
  key: 'admin',
  role: 'admin',
  buttonLabel: 'Admin Portal',
  name: 'CampusFlow Admin',
  email: 'admin@campusflow.com',
  password: 'Admin@123',
  id: 'ADMIN',
  badge: 'Registrar (Full Access)'
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null); // 'user1' | 'user2' | 'admin' | null
  const [useAltUser2, setUseAltUser2] = useState(false); // toggle between Tanmay & Aditi

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const activeUser2 = useAltUser2 ? USER2_ACCOUNTS.aditi : USER2_ACCOUNTS.tanmay;

  const handleQuickInspectionLogin = async (account) => {
    if (loading || quickLoading) return;
    setQuickLoading(account.key);
    setEmail(account.email);
    setPassword(account.password);

    try {
      const user = await login(account.email, account.password);
      addToast(`Direct Inspection Access: Signed in as ${user.name} (${user.role.toUpperCase()})`, 'success');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      addToast(err.message || `Failed to log in as ${account.name}`, 'error');
    } finally {
      setQuickLoading(null);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Left Column: Value Proposition & Brand */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-[2.2]">
                <path d="M7 3h7l5 5v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                <polyline points="14 3 14 8 19 8" />
                <path d="M9 14.5l2 2 4.5-4.5" className="stroke-sky-300" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                CampusFlow <span className="text-sky-400">AI</span>
              </span>
              <p className="text-xs text-slate-400 font-mono tracking-wider">
                ENTERPRISE WORKFLOW AUTOMATION
              </p>
            </div>
          </div>

          {/* Master Tagline */}
          <div className="space-y-4 max-w-lg">
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] font-['Plus_Jakarta_Sans']">
              Automate the routine.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-indigo-200">
                Explain the exception.
              </span>{' '}
              Keep humans in control.
            </h1>
            <p className="text-slate-300 text-sm lg:text-base leading-relaxed pt-2">
              CampusFlow AI transforms manual university credential issuance into a deterministic,
              transparent, and verifiable workflow engine.
            </p>
          </div>
        </div>

        {/* 3 Feature Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 my-10 lg:my-0">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white tracking-wide">
              AI Request Understanding
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Extracts intent, purpose & organizations from natural language.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5">
              <GitBranch className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white tracking-wide">
              Intelligent Routing
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Routes fee, attendance, or policy exceptions to right officers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
              <QrCode className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white tracking-wide">
              Verifiable Certificates
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Cryptographically signed PDFs with public QR verification.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>CampusFlow AI Platform v1.0</span>
          <span className="font-mono">Rules decide. AI explains.</span>
        </div>
      </div>

      {/* Right Column: Clean Institutional Sign-In Form */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-12 flex items-center justify-center bg-white lg:bg-[#F8FAFC]">
        <div className="max-w-lg w-full">
          <div className="bg-white lg:border lg:border-slate-200/80 rounded-2xl p-6 sm:p-8 lg:shadow-subtle space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Institutional Access Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Sign in with your verified institutional credentials or use the 1-click inspection logins below.
              </p>
            </div>

            {/* Direct Inspection 1-Click Access Panel (Two Users & Admin) */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Inspection 1-Click Login</span>
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  No Gmail / Password Needed
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Directly authenticate into the application dashboard for inspection with a single click:
              </p>

              {/* The 3 Direct Login Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* 1. User 1 Button (Student - Aarav Sharma) */}
                <button
                  type="button"
                  id="btn-inspect-user1"
                  onClick={() => handleQuickInspectionLogin(USER1_ACCOUNT)}
                  disabled={Boolean(quickLoading) || loading}
                  className={`group relative text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-indigo-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98] ${
                    quickLoading === 'user1' ? 'ring-2 ring-indigo-400 bg-white/25' : ''
                  }`}
                  title="Direct login as User 1 (Aarav Sharma - Student)"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/50">
                      {quickLoading === 'user1' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-sky-200" />
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/30 text-sky-300 border border-indigo-400/40">
                      User 1
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white group-hover:text-sky-300 truncate">
                    {USER1_ACCOUNT.name}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate mt-0.5 font-mono">
                    {USER1_ACCOUNT.id}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-semibold text-sky-300 group-hover:text-white">
                    <span>{quickLoading === 'user1' ? 'Entering...' : 'Student Access'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 2. User 2 Button (Student - Tanmay Trivedi / Aditi Verma) */}
                <button
                  type="button"
                  id="btn-inspect-user2"
                  onClick={() => handleQuickInspectionLogin(activeUser2)}
                  disabled={Boolean(quickLoading) || loading}
                  className={`group relative text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-emerald-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.98] ${
                    quickLoading === 'user2' ? 'ring-2 ring-emerald-400 bg-white/25' : ''
                  }`}
                  title={`Direct login as User 2 (${activeUser2.name} - Student)`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/50">
                      {quickLoading === 'user2' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-200" />
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                      User 2
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white group-hover:text-emerald-300 truncate">
                    {activeUser2.name}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate mt-0.5 font-mono">
                    {activeUser2.id}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-semibold text-emerald-300 group-hover:text-white">
                    <span>{quickLoading === 'user2' ? 'Entering...' : 'Student Access'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 3. Admin Button (CampusFlow Administrator) */}
                <button
                  type="button"
                  id="btn-inspect-admin"
                  onClick={() => handleQuickInspectionLogin(ADMIN_ACCOUNT)}
                  disabled={Boolean(quickLoading) || loading}
                  className={`group relative text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-purple-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-purple-500/20 hover:-translate-y-0.5 active:scale-[0.98] ${
                    quickLoading === 'admin' ? 'ring-2 ring-purple-400 bg-white/25' : ''
                  }`}
                  title="Direct login as Admin (System Administrator)"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-600/50">
                      {quickLoading === 'admin' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-purple-200" />
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400/40">
                      Admin
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white group-hover:text-purple-300 truncate">
                    {ADMIN_ACCOUNT.name}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate mt-0.5 font-mono">
                    Registrar Console
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-semibold text-purple-300 group-hover:text-white">
                    <span>{quickLoading === 'admin' ? 'Entering...' : 'Admin Portal'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>

              {/* User 2 Persona Switcher */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-white/10">
                <span className="truncate">
                  Selected User 2: <span className="text-white font-medium">{activeUser2.name}</span> ({activeUser2.badge})
                </span>
                <button
                  type="button"
                  onClick={() => setUseAltUser2(!useAltUser2)}
                  className="text-sky-300 hover:text-white font-semibold underline underline-offset-2 ml-2 shrink-0 cursor-pointer"
                >
                  Switch to {useAltUser2 ? 'Tanmay (Fee Exception)' : 'Aditi (Yr 2)'}
                </button>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                or sign in with credentials
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Email / ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="NIAT2026AI001@gmail.com or admin@campusflow.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all shadow-subtle placeholder:text-slate-400 text-slate-900"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => addToast('Please contact the institution registrar to reset credentials.', 'info')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all shadow-subtle placeholder:text-slate-400 text-slate-900"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">TLS 1.3 • 256-bit</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-70 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deterministic Rule Engine</span>
              </div>
              <span>Audit Trail Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
