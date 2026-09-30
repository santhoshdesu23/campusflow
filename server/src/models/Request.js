import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    program: { type: String, default: '' },
    documentType: { type: String, default: 'Bonafide Certificate' },
    rawPrompt: { type: String, required: true },
    aiUnderstanding: {
      documentType: { type: String, default: 'Bonafide Certificate' },
      purpose: { type: String, default: 'General Academic Verification' },
      organization: { type: String, default: null },
      confidence: { type: String, default: 'High' },
      requiredInfoDetected: { type: Boolean, default: true },
      missingFields: [{ type: String }],
      followUpPrompt: { type: String, default: null },
      extractedEntities: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    ruleEvaluation: {
      decision: { type: String, enum: ['AUTO_APPROVE', 'REVIEW', 'BLOCKED'], required: true },
      status: { type: String, default: 'pending_review' },
      route: { type: String, default: null },
      priority: { type: String, default: 'Medium' },
      checks: {
        activeEnrollment: { type: Boolean, default: true },
        feesCleared: { type: Boolean, default: true },
        attendanceSufficient: { type: Boolean, default: true },
        noAdministrativeHold: { type: Boolean, default: true }
      },
      resultsList: [
        {
          rule: String,
          passed: Boolean,
          value: mongoose.Schema.Types.Mixed,
          required: String,
          description: String
        }
      ],
      reasons: [{ type: String }],
      recommendedAction: { type: String, default: '' },
      canAutoProcess: { type: Boolean, default: false }
    },
    decisionExplanation: {
      title: { type: String, default: '' },
      summary: { type: String, default: '' },
      points: [{ type: String }],
      conclusion: { type: String, default: '' },
      generatedBy: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['approved', 'pending_review', 'blocked', 'rejected'],
      default: 'pending_review',
      index: true
    },
    decision: {
      type: String,
      enum: ['AUTO_APPROVE', 'REVIEW', 'BLOCKED'],
      required: true,
      index: true
    },
    route: { type: String, default: null, index: true },
    submittedAt: { type: Date, default: Date.now, index: true },
    processedAt: { type: Date, default: null },
    certificateId: { type: String, default: null, index: true },
    adminReview: {
      reviewedBy: { type: String, default: null },
      reviewedAt: { type: Date, default: null },
      decision: { type: String, default: null },
      note: { type: String, default: null }
    }
  },
  { timestamps: true }
);

export const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
