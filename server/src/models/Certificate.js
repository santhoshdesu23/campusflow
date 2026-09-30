import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    requestId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    documentType: { type: String, default: 'Bonafide Certificate' },
    purpose: { type: String, default: 'Official Verification' },
    organization: { type: String, default: null },
    program: { type: String, default: '' },
    year: { type: String, default: '' },
    issueDate: { type: Date, default: Date.now },
    validUntil: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 3600000) },
    status: { type: String, default: 'Valid', index: true },
    verificationHash: { type: String, required: true },
    authorizedSignatory: { type: String, default: 'Dr. V. Ramanathan, Academic Registrar' },
    qrCodeDataUrl: { type: String, default: null }
  },
  { timestamps: true }
);

export const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
