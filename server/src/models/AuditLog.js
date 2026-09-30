import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    requestId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    actor: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    details: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
