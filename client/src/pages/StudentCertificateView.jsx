import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  ShieldCheck,
  Award,
  QrCode
} from 'lucide-react';

export default function StudentCertificateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCert();
  }, [id]);

  const fetchCert = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/certificates/${id}`);
      if (res.data.success) {
        setCert(res.data.data);
      }
    } catch (err) {
      addToast('Could not load certificate record', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-slate-500">Loading certificate...</p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Certificate not found.</p>
        <button
          onClick={() => navigate('/student')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const formattedDate = new Date(cert.issueDate || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/verify/${cert.certificateId}`)}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify Online</span>
          </button>
          <button
            onClick={() => window.open(`${api.defaults.baseURL}/certificates/${cert.certificateId}/download`, '_blank')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Visual Presentation */}
      <div className="bg-white border-4 border-double border-indigo-950 p-8 sm:p-14 rounded-2xl shadow-xl max-w-3xl mx-auto text-slate-800 relative">
        {/* Crest */}
        <div className="text-center border-b pb-6 border-amber-600/30">
          <div className="w-14 h-14 mx-auto rounded-full border-2 border-amber-600 flex items-center justify-center text-indigo-950 font-bold font-sans text-base mb-2 shadow-sm">
            CFU
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase font-sans">
            CampusFlow Demo University
          </h2>
          <p className="text-[10px] tracking-widest text-slate-500 uppercase font-sans font-medium mt-1">
            Established Under Institutional Excellence Act • Accredited Grade A++
          </p>
          <p className="text-xs font-semibold text-indigo-700 tracking-wider uppercase font-sans mt-1">
            Office of the Academic Registrar
          </p>
        </div>

        {/* Ref & Date */}
        <div className="flex justify-between items-center text-xs font-sans text-slate-600 mt-6 font-mono">
          <div>REF: <span className="font-bold text-slate-900">{cert.certificateId}</span></div>
          <div>DATE: <span className="font-bold text-slate-900">{formattedDate}</span></div>
        </div>

        {/* Title */}
        <div className="text-center my-8">
          <div className="inline-block px-8 py-2 bg-indigo-50 border border-indigo-200 rounded-md">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-indigo-950 uppercase font-sans">
              Bonafide Certificate
            </h1>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 text-center font-sans">
          <p>
            This is to certify that{' '}
            <span className="font-bold text-slate-900 underline decoration-indigo-300 underline-offset-4">
              {cert.studentName || 'The Student'}
            </span>
            , bearing Student Identification Number{' '}
            <span className="font-bold text-slate-900 font-mono">
              {cert.studentId || cert.metadata?.studentId || ''}
            </span>
            , is a bonafide student of CampusFlow Demo University.
          </p>
          <p>
            The student is currently enrolled in the{' '}
            <span className="font-semibold text-slate-900">
              {cert.program || 'B.Tech AI & Data Science'}
            </span>
            {' '}({cert.year || 'Current Academic Year'}) for the academic session 2025–2026.
          </p>
          <p>
            According to official records maintained by the Registrar Office, the student maintains an active
            enrollment with verified good conduct and no administrative encumbrances.
          </p>
          <div className="pt-2 pb-1">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Certificate Issued For Purpose:
            </p>
            <p className="text-base font-bold text-indigo-900 mt-0.5">
              {cert.purpose || 'Official Academic Verification'}
              {cert.organization ? ` — ${cert.organization}` : ''}
            </p>
          </div>
        </div>

        {/* Signatures & QR Section */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
          {/* QR */}
          <div className="flex items-center space-x-3 text-left">
            {cert.qrCodeDataUrl ? (
              <img
                src={cert.qrCodeDataUrl}
                alt="Certificate QR Verification"
                className="w-20 h-20 border border-slate-300 rounded p-1 bg-white"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-100 flex items-center justify-center rounded border text-slate-400">
                <QrCode className="w-10 h-10" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cryptographic Verification</span>
              </div>
              <p className="text-[10px] text-slate-500 max-w-[140px] leading-tight mt-0.5">
                Scan with any smartphone camera to verify authenticity.
              </p>
              <p className="text-[9px] font-mono text-slate-400 mt-1">
                Hash: {cert.verificationHash ? cert.verificationHash.substring(0, 16) + '...' : 'Verified'}
              </p>
            </div>
          </div>

          {/* Registrar Signature */}
          <div className="text-center sm:text-right">
            <div className="h-10 flex items-end justify-center sm:justify-end">
              <span className="font-serif italic text-indigo-800 text-lg font-bold">
                V. Ramanathan
              </span>
            </div>
            <div className="w-40 border-t border-slate-400 mt-1 mx-auto sm:ml-auto"></div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              Dr. V. Ramanathan, Ph.D.
            </div>
            <div className="text-[11px] text-slate-500">
              Academic Registrar
            </div>
            <div className="text-[10px] text-slate-400">
              CampusFlow Demo University
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
