import React, { useRef } from 'react';
import { X, Download, ExternalLink, Printer, ShieldCheck, QrCode, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CertificatePreviewModal({ certificate, isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen || !certificate) return null;

  const handleDownloadPdf = () => {
    window.open(`${api.defaults.baseURL}/certificates/${certificate.certificateId}/download`, '_blank');
  };

  const handleVerify = () => {
    onClose();
    navigate(`/verify/${certificate.certificateId}`);
  };

  const formattedDate = new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Official Credential Preview
            </h3>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              VERIFIED
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleVerify}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verify Online</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Rendering Container */}
        <div className="p-6 sm:p-10 bg-slate-100/50 overflow-y-auto max-h-[75vh] flex justify-center">
          <div className="bg-white border-4 border-double border-indigo-950 p-8 sm:p-12 rounded-lg shadow-lg max-w-2xl w-full relative text-slate-800 font-serif">
            {/* Watermark simulation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-9xl font-black font-sans rotate-45 text-slate-900">CAMPUSFLOW</span>
            </div>

            {/* University Header */}
            <div className="text-center border-b pb-6 border-amber-600/30">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-amber-600 flex items-center justify-center text-indigo-950 font-bold font-sans text-sm mb-2 shadow-sm">
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

            {/* Reference & Date */}
            <div className="flex justify-between items-center text-xs font-sans text-slate-600 mt-4 font-mono">
              <div>REF: <span className="font-bold text-slate-900">{certificate.certificateId}</span></div>
              <div>DATE: <span className="font-bold text-slate-900">{formattedDate}</span></div>
            </div>

            {/* Certificate Title */}
            <div className="text-center my-8">
              <div className="inline-block px-6 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md">
                <h1 className="text-lg sm:text-xl font-bold tracking-wider text-indigo-950 uppercase font-sans">
                  Bonafide Certificate
                </h1>
              </div>
            </div>

            {/* Certificate Body Text */}
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 text-center font-sans">
              <p>
                This is to certify that{' '}
                <span className="font-bold text-slate-900 underline decoration-indigo-300 underline-offset-4">
                  {certificate.studentName || 'The Student'}
                </span>
                , bearing Student Identification Number{' '}
                <span className="font-bold text-slate-900 font-mono">
                  {certificate.studentId || certificate.metadata?.studentId || ''}
                </span>
                , is a bonafide student of CampusFlow Demo University.
              </p>
              <p>
                The student is currently enrolled in the{' '}
                <span className="font-semibold text-slate-900">
                  {certificate.program || 'B.Tech AI & Data Science'}
                </span>
                {' '}({certificate.year || 'Current Academic Year'}) for the academic session 2025–2026.
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
                  {certificate.purpose || 'Official Academic Verification'}
                  {certificate.organization ? ` — ${certificate.organization}` : ''}
                </p>
              </div>
            </div>

            {/* Signatures & QR Section */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
              {/* QR Verification stamp */}
              <div className="flex items-center space-x-3 text-left">
                {certificate.qrCodeDataUrl ? (
                  <img
                    src={certificate.qrCodeDataUrl}
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
                    Hash: {certificate.verificationHash ? certificate.verificationHash.substring(0, 16) + '...' : 'Verified'}
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
      </div>
    </div>
  );
}
