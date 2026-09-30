import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import CertificatePreviewModal from '../components/CertificatePreviewModal';
import {
  Award,
  Download,
  Eye,
  ExternalLink,
  ShieldCheck,
  Calendar,
  FileText,
  PlusCircle,
  QrCode
} from 'lucide-react';

export default function StudentCertificatesPage() {
  const { user, student } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/certificates/student');
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = (cert) => {
    setSelectedCert(cert);
    setIsCertModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Credentials Vault
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-2">
            Issued Certificates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Digitally signed, cryptographically stamped documents issued by CampusFlow AI.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/request')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-indigo-600/20 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Request New Document</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-400">
          Loading issued credentials...
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No certificates issued yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once your document requests are approved through the deterministic rule engine, your verifiable credentials will appear here.
          </p>
          <button
            onClick={() => navigate('/student/request')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit a Request</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => {
            const formattedDate = new Date(cert.issueDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={cert.certificateId}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-indigo-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {cert.certificateId}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>VALID</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {cert.documentType}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Issued for: <span className="font-semibold text-slate-800">{cert.purpose}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400 font-mono text-[10px]">STUDENT:</span>
                      <span className="font-semibold">{cert.studentName} ({cert.studentId})</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400 font-mono text-[10px]">ISSUE DATE:</span>
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400 font-mono text-[10px]">SIGNATORY:</span>
                      <span className="truncate max-w-[180px]">{cert.authorizedSignatory}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/verify/${cert.certificateId}`)}
                    className="p-2 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    title="Verify Public Integrity"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Verify QR</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenPreview(cert)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => window.open(`/api/certificates/${cert.certificateId}/download`, '_blank')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <CertificatePreviewModal
        certificate={selectedCert}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}
