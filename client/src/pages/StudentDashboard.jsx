import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import CertificatePreviewModal from '../components/CertificatePreviewModal';
import {
  GraduationCap,
  Calendar,
  CreditCard,
  UserCheck,
  Award,
  PlusCircle,
  ArrowRight,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Mail,
  User,
  Sparkles,
  QrCode,
  ExternalLink,
  RefreshCw,
  Phone,
  BookOpen
} from 'lucide-react';

/**
 * Professional Student Profile Dashboard
 * Powered directly by real-time MongoDB data from /api/students/me, /api/requests/my, /api/certificates/my
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCert, setSelectedCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, requestsRes, certsRes] = await Promise.allSettled([
        api.get('/students/me'),
        api.get('/requests/my'),
        api.get('/certificates/my')
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.data.success) {
        setStudent(profileRes.value.data.data);
      } else {
        throw new Error(
          profileRes.status === 'rejected'
            ? profileRes.reason?.response?.data?.message || 'Failed to fetch student profile'
            : 'Could not retrieve student profile'
        );
      }

      if (requestsRes.status === 'fulfilled' && requestsRes.value.data.success) {
        setRequests(requestsRes.value.data.data || []);
      }

      if (certsRes.status === 'fulfilled' && certsRes.value.data.success) {
        setCertificates(certsRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      setError(err.message || 'Failed to load institutional profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCert = async (certId) => {
    try {
      const res = await api.get(`/certificates/${certId}`);
      if (res.data.success) {
        setSelectedCert(res.data.data);
        setIsCertModalOpen(true);
      }
    } catch (err) {
      addToast('Could not load certificate preview', 'error');
    }
  };

  const formatDob = (dobStr) => {
    if (!dobStr) return 'Not on record';
    try {
      const d = new Date(dobStr);
      if (isNaN(d.getTime())) return dobStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dobStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200/80 rounded-2xl w-full"></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/70 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200/70 rounded-2xl"></div>
          <div className="h-72 bg-slate-200/70 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !student) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-2xl text-center space-y-4 shadow-subtle max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Institutional Profile Unavailable</h3>
          <p className="text-xs text-slate-500 mt-1">{error || 'Unable to connect to university records system.'}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Synchronization</span>
        </button>
      </div>
    );
  }

  // Deterministic metrics calculation
  const attendance = Number(student.attendancePercentage || 0);
  const attendanceDiff = attendance - 75;
  const isAttendanceEligible = attendance >= 75;

  const feesDue = Number(student.feesDue || 0);
  const isFeesCleared = feesDue === 0;

  const hasHold = Boolean(student.administrativeHold);
  const isEnrollmentActive = student.enrollmentStatus === 'active';

  const eligibility = student.eligibility || {};
  const eligibilityDecision = eligibility.decision || (isEnrollmentActive && isFeesCleared && isAttendanceEligible && !hasHold ? 'AUTO_APPROVE' : 'REVIEW');
  const checks = eligibility.checks || {
    activeEnrollment: isEnrollmentActive,
    feesCleared: isFeesCleared,
    attendanceSufficient: isAttendanceEligible,
    noAdministrativeHold: !hasHold
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* 1. Student Profile Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-subtle relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-50/70 via-sky-50/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
            {/* Profile Avatar Using Initials */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-600 text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl flex-shrink-0 shadow-md shadow-indigo-600/20 ring-4 ring-white">
              {getInitials(student.name)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                  {student.name}
                </h1>
                {/* Roll Number / Student ID */}
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg">
                  {student.studentId}
                </span>
                {/* Profile Status Badge */}
                <span
                  className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isEnrollmentActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isEnrollmentActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
                  />
                  <span className="uppercase">{student.enrollmentStatus}</span>
                </span>
              </div>

              {/* Email */}
              <p className="text-xs sm:text-sm text-slate-500 font-mono">
                {student.email}
              </p>

              {/* Course / Program & Year */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 pt-0.5">
                <span className="font-medium text-slate-800">{student.course || student.program}</span>
                <span>•</span>
                <span className="text-slate-600">{student.year}</span>
                {student.semester && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500">{student.semester}</span>
                  </>
                )}
                {student.department && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400 hidden sm:inline">{student.department}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* New Request Button */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => navigate('/student/request')}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-indigo-600/25 flex-shrink-0 group"
            >
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Create New Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dashboard Summary Cards (Top 5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Attendance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">Attendance</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isAttendanceEligible ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
              {attendance}%
            </div>
            <div
              className={`text-[11px] font-semibold mt-1 flex items-center space-x-1 ${
                isAttendanceEligible ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              <span>{isAttendanceEligible ? `+${attendanceDiff}% vs min 75%` : `${attendanceDiff}% below min`}</span>
            </div>
          </div>
        </div>

        {/* Card 2: CGPA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">CGPA</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
              {student.cgpa ? Number(student.cgpa).toFixed(1) : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Scale: 10.0 • Academic Standing</div>
          </div>
        </div>

        {/* Card 3: Fees Due */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">Fees Due</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isFeesCleared ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] ${
                isFeesCleared ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              ₹{feesDue.toLocaleString('en-IN')}
            </div>
            <div className={`text-[11px] font-semibold mt-1 ${isFeesCleared ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isFeesCleared ? 'No outstanding fees' : 'Outstanding dues'}
            </div>
          </div>
        </div>

        {/* Card 4: Enrollment */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">Enrollment</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isEnrollmentActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-xl sm:text-2xl font-extrabold uppercase font-['Plus_Jakarta_Sans'] ${
                isEnrollmentActive ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {student.enrollmentStatus}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {hasHold ? '⚠ Hold Active' : 'No Admin Hold'}
            </div>
          </div>
        </div>

        {/* Card 5: Certificates */}
        <div
          onClick={() => navigate('/student/certificates')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 group-hover:text-indigo-600 transition-colors">
              Certificates
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-indigo-600 font-['Plus_Jakarta_Sans'] transition-colors">
              {certificates.length}
            </div>
            <div className="text-[11px] text-indigo-600 mt-1 flex items-center space-x-1">
              <span>Verifiable credentials</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 4 & 5. Main Dashboard Grids: Academic Overview & Personal Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Academic Overview & Attendance Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Attendance & Academic Overview */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Academic Overview & Attendance
                  </h3>
                  <p className="text-xs text-slate-500">Real-time attendance record from student information system</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isAttendanceEligible
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isAttendanceEligible ? '✓ Eligible' : '⚠ Attendance requirement not met'}
              </span>
            </div>

            {/* Attendance Deep Dive */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Current Attendance</span>
                  <div className="text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                    {attendance}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Required Minimum</span>
                  <div className="text-base font-bold text-slate-700">75%</div>
                </div>
              </div>

              {/* Attendance Progress Bar with Threshold Marker */}
              <div className="relative pt-1">
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAttendanceEligible
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, attendance))}%` }}
                  />
                </div>
                {/* 75% Threshold Marker Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80 pointer-events-none"
                  style={{ left: '75%' }}
                  title="Institutional Requirement Threshold (75%)"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-medium">
                <span
                  className={
                    isAttendanceEligible ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'
                  }
                >
                  {attendanceDiff >= 0
                    ? `+${attendanceDiff}% above requirement`
                    : `${attendanceDiff}% below requirement`}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">Threshold: 75%</span>
              </div>
            </div>

            {/* Academic Standing Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Cumulative GPA</span>
                <span className="text-base font-bold text-slate-900">
                  {student.cgpa ? Number(student.cgpa).toFixed(1) : 'N/A'}{' '}
                  <span className="text-xs font-normal text-slate-400">/ 10</span>
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Current Year</span>
                <span className="text-base font-bold text-slate-900">{student.year}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Semester</span>
                <span className="text-base font-bold text-slate-900">{student.semester || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 4 & 5. Financial & Administrative Status */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Financial & Administrative Status
                </h3>
                <p className="text-xs text-slate-500">Institutional clearance indicators from university bursar & registrar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Fees Status */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-medium">Fees Status</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFeesCleared
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isFeesCleared ? 'CLEARED' : 'PENDING'}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-extrabold mt-1.5 font-['Plus_Jakarta_Sans'] ${
                      isFeesCleared ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    ₹{feesDue.toLocaleString('en-IN')}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {isFeesCleared
                    ? 'No outstanding fees. Cleared for credential issuance.'
                    : 'Outstanding balance pending clearance from Accounts.'}
                </p>
              </div>

              {/* Administrative Hold */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-medium">Administrative Hold</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        !hasHold
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {!hasHold ? 'NONE' : 'HOLD ACTIVE'}
                    </span>
                  </div>
                  <div
                    className={`text-xl font-extrabold mt-1.5 font-['Plus_Jakarta_Sans'] ${
                      !hasHold ? 'text-slate-900' : 'text-rose-600'
                    }`}
                  >
                    {!hasHold ? '✓ NONE' : '⚠ ACTIVE'}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {!hasHold
                    ? 'Clean disciplinary record. No holds present.'
                    : 'Administrative hold present on student record.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Information & Institutional Eligibility (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 2. Personal Information Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500">Verified identity data stored in MongoDB</p>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Full Name</dt>
                <dd className="font-bold text-slate-900 text-right">{student.name}</dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Roll Number / Student ID</dt>
                <dd className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-right">
                  {student.studentId}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Date of Birth</dt>
                <dd className="font-semibold text-slate-800 text-right">{formatDob(student.dob)}</dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Email Address</dt>
                <dd className="font-mono text-slate-700 text-right truncate max-w-[200px]" title={student.email}>
                  {student.email}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Course</dt>
                <dd className="font-semibold text-slate-800 text-right">{student.course || student.program}</dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Program</dt>
                <dd className="font-semibold text-slate-800 text-right">{student.program || student.course}</dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Current Year</dt>
                <dd className="font-semibold text-slate-800 text-right">{student.year}</dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-slate-500 font-medium">CGPA</dt>
                <dd className="font-bold text-indigo-600 text-right">
                  {student.cgpa ? Number(student.cgpa).toFixed(1) : 'N/A'}
                </dd>
              </div>
              {student.phone && (
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-slate-500 font-medium">Phone</dt>
                  <dd className="font-mono text-slate-700 text-right">{student.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* 6. Institutional Eligibility Snapshot */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Institutional Eligibility
                  </h3>
                  <p className="text-[11px] text-slate-500">Deterministic rule-engine validation</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  eligibilityDecision === 'AUTO_APPROVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : eligibilityDecision === 'REVIEW'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {eligibilityDecision}
              </span>
            </div>

            {/* 4 Deterministic Rule Checks */}
            <div className="space-y-2.5">
              {/* Check 1: Active Enrollment */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  checks.activeEnrollment
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                    : 'bg-rose-50/60 border-rose-100 text-rose-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {checks.activeEnrollment ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span className="font-semibold">Active Enrollment</span>
                </div>
                <span className="font-mono text-[11px] font-bold capitalize">
                  {student.enrollmentStatus}
                </span>
              </div>

              {/* Check 2: Fees Cleared */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  checks.feesCleared
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                    : 'bg-amber-50/60 border-amber-100 text-amber-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {checks.feesCleared ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <span className="font-semibold">Fees Cleared</span>
                </div>
                <span className="font-mono text-[11px] font-bold">
                  {isFeesCleared ? '₹0' : `₹${feesDue.toLocaleString('en-IN')}`}
                </span>
              </div>

              {/* Check 3: Attendance >= 75% */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  checks.attendanceSufficient
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                    : 'bg-amber-50/60 border-amber-100 text-amber-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {checks.attendanceSufficient ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <span className="font-semibold">Attendance ≥ 75%</span>
                </div>
                <span className="font-mono text-[11px] font-bold">
                  {attendance}%
                </span>
              </div>

              {/* Check 4: No Administrative Hold */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  checks.noAdministrativeHold
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                    : 'bg-rose-50/60 border-rose-100 text-rose-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {checks.noAdministrativeHold ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span className="font-semibold">No Administrative Hold</span>
                </div>
                <span className="font-mono text-[11px] font-bold">
                  {hasHold ? 'Hold Active' : 'None ✓'}
                </span>
              </div>
            </div>

            {/* Rule Engine Recommendation Note */}
            {eligibility.recommendedAction && (
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">Policy Outcome:</span>{' '}
                {eligibility.recommendedAction}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 7. Document Request History ("My Requests") */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              My Requests
            </h3>
            <p className="text-xs text-slate-500">
              Track eligibility evaluations and departmental routing decisions
            </p>
          </div>
          <button
            onClick={() => navigate('/student/requests')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No document requests yet</p>
              <p className="text-xs text-slate-400 mt-0.5">Submit your first credential request in seconds.</p>
            </div>
            <button
              onClick={() => navigate('/student/request')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono uppercase text-slate-400">
                  <th className="pb-3 font-semibold">Request ID</th>
                  <th className="pb-3 font-semibold">Document Type</th>
                  <th className="pb-3 font-semibold">Purpose</th>
                  <th className="pb-3 font-semibold">Request Date</th>
                  <th className="pb-3 font-semibold">Status / Decision</th>
                  <th className="pb-3 font-semibold">Routing</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">{req.id}</td>
                    <td className="py-3.5 font-semibold text-slate-800">{req.documentType}</td>
                    <td className="py-3.5 text-slate-600 max-w-[150px] truncate">
                      {req.aiUnderstanding?.purpose || 'General Verification'}
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {formatDate(req.submittedAt)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'pending_review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {req.status === 'approved' && <span>✓ Approved</span>}
                        {req.status === 'pending_review' && <span>🟡 Review Required</span>}
                        {req.status === 'blocked' && <span>🚫 Blocked</span>}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {req.ruleEvaluation?.route ? (
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {req.ruleEvaluation.route}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/student/requests/${req.id}`)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      {req.certificateId && (
                        <button
                          onClick={() => handleOpenCert(req.certificateId)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-lg transition-colors"
                        >
                          <Award className="w-3 h-3" />
                          <span>Certificate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 8. Certificates ("My Certificates") */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                My Certificates
              </h3>
              <p className="text-xs text-slate-500">Cryptographically signed credentials verifiable via public QR</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/certificates')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All ({certificates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {certificates.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No certificates generated yet</p>
            <p className="text-[11px] text-slate-400">
              When an approved request is processed, your official digital certificate will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.slice(0, 3).map((cert) => (
              <div
                key={cert.certificateId}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {cert.certificateId}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span>✓ VALID</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{cert.documentType}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Issued: <span className="font-medium text-slate-700">{formatDate(cert.issueDate)}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenCert(cert.certificateId)}
                    className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors shadow-sm"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Certificate</span>
                  </button>
                  <button
                    onClick={() => navigate(`/verify/${cert.certificateId}`)}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                    title="Verify QR code integrity"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificatePreviewModal
          certificate={selectedCert}
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
        />
      )}
    </div>
  );
}
