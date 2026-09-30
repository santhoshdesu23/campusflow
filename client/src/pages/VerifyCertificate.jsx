import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Download,
  Calendar,
  Building,
  GraduationCap,
  ExternalLink,
  QrCode
} from 'lucide-react';

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerification();
  }, [certificateId]);

  const fetchVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificates/${certificateId}/verify`);
      const json = await res.json();
      if (json.success && json.verified) {
        setData(json.data);
      } else {
        setError(json.message || 'Certificate verification failed');
      }
    } catch (err) {
      setError('Network lookup error. Please verify the QR identifier.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = data?.issueDate
    ? new Date(data.issueDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6">
        <Logo size="small" />
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-slate-200">
          Public Trust Registry
        </span>
      </div>

      {/* Main Verification Card */}
      <div className="max-w-xl mx-auto w-full my-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          {/* Header Strip */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 mx-auto flex items-center justify-center mb-3 shadow-lg">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              Certificate Verification
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              CampusFlow Cryptographic Verification Portal
            </p>

            {/* Large Verified Status Banner */}
            {!loading && !error && data && (
              <div className="inline-flex items-center space-x-2 bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full mt-4 shadow-sm shadow-emerald-500/30 tracking-wide font-mono">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>VERIFIED AUTHENTIC</span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {loading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-slate-500">Querying university registry hash...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Verification Unsuccessful</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : (
              data && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Certificate ID</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {data.certificateId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Document</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {data.documentType}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Student Name</span>
                      <span className="font-bold text-slate-900">{data.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Student ID</span>
                      <span className="font-mono font-semibold text-slate-800">{data.studentId}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Program</span>
                      <span className="font-semibold text-slate-800">{data.program}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Issued On</span>
                      <span className="font-semibold text-slate-800">{formattedDate}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono text-[10px] uppercase">Issuing Authority</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">STATUS: VALID</span>
                    </div>
                    <div className="font-bold text-slate-900">{data.institution}</div>
                    <div className="text-[11px] text-slate-500">{data.accreditation}</div>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Signatory: {data.authorizedSignatory}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1 leading-relaxed">
                    <div className="font-bold flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      <span>Certificate Integrity Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      This certificate was issued through CampusFlow AI workflow automation. Cryptographic seal matches institutional records.
                    </p>
                    <div className="text-[9px] font-mono text-indigo-700 truncate pt-1">
                      Token Hash: {data.verificationHash}
                    </div>
                  </div>

                  {/* PDF Download Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => window.open(`/api/certificates/${data.certificateId}/download`, '_blank')}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Official PDF Copy</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto w-full text-center text-xs text-slate-400 py-4">
        <span>© 2026 CampusFlow AI Demo University • Powered by CampusFlow AI Workflow Engine</span>
      </div>
    </div>
  );
}
