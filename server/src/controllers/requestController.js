import { z } from 'zod';
import { db } from '../models/db.js';
import { evaluateBonafideRules } from '../rules/ruleEngine.js';
import { parseStudentRequest, generateDecisionExplanation } from '../ai/geminiService.js';
import { generateVerificationHash, generateQrCodeDataUrl } from '../services/qrService.js';

const createRequestSchema = z.object({
  prompt: z.string().min(5, 'Please provide more details about your document need'),
  documentType: z.string().default('Bonafide Certificate'),
  purpose: z.string().optional(),
  organization: z.string().optional()
});

export async function createStudentRequest(req, res) {
  try {
    const student = req.student || (await db.findStudentById(req.user.studentId));
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student institutional record not found'
      });
    }

    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request payload',
        errors: parsed.error.errors
      });
    }

    const { prompt, documentType, purpose, organization } = parsed.data;

    // 1. AI Request Understanding
    let aiUnderstanding = await parseStudentRequest(prompt);
    if (purpose) aiUnderstanding.purpose = purpose;
    if (organization) aiUnderstanding.organization = organization;
    if (documentType) aiUnderstanding.documentType = documentType;

    // 2. Deterministic Rule Engine Evaluation (STRICT SERVER-SIDE)
    const ruleEvaluation = evaluateBonafideRules(student);

    // 3. AI generates human-readable decision explanation based on deterministic rules
    const decisionExplanation = generateDecisionExplanation(ruleEvaluation, student, aiUnderstanding);

    // 4. Generate Request ID (with collision avoidance)
    let requestCounter = (await db.countRequests()) + 125;
    let requestId = `CF-2026-${String(requestCounter).padStart(5, '0')}`;
    while (await db.getRequestById(requestId)) {
      requestCounter++;
      requestId = `CF-2026-${String(requestCounter).padStart(5, '0')}`;
    }
    const now = new Date().toISOString();

    let certificateId = null;

    // 5. If AUTO_APPROVE, automatically issue certificate
    if (ruleEvaluation.decision === 'AUTO_APPROVE') {
      certificateId = `CERT-2026-${String(requestCounter).padStart(5, '0')}`;
      const certData = {
        certificateId,
        requestId,
        studentId: student.studentId,
        studentName: student.name,
        documentType: aiUnderstanding.documentType || 'Bonafide Certificate',
        purpose: aiUnderstanding.purpose,
        organization: aiUnderstanding.organization,
        program: student.program,
        year: student.year,
        issueDate: now,
        validUntil: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
        status: 'Valid',
        verificationHash: generateVerificationHash({
          certificateId,
          studentId: student.studentId,
          issueDate: now,
          documentType: aiUnderstanding.documentType
        }),
        authorizedSignatory: 'Dr. V. Ramanathan, Academic Registrar'
      };
      // Generate QR data url
      certData.qrCodeDataUrl = await generateQrCodeDataUrl(certificateId);
      await db.createCertificate(certData);
    }

    const newRequest = {
      id: requestId,
      studentId: student.studentId,
      studentName: student.name,
      studentEmail: student.email,
      program: student.program,
      documentType: aiUnderstanding.documentType || 'Bonafide Certificate',
      rawPrompt: prompt,
      aiUnderstanding,
      ruleEvaluation,
      decisionExplanation,
      status: ruleEvaluation.status,
      decision: ruleEvaluation.decision,
      route: ruleEvaluation.route,
      submittedAt: now,
      processedAt: ruleEvaluation.decision === 'AUTO_APPROVE' ? now : null,
      certificateId
    };

    await db.createRequest(newRequest);

    // Add Audit Trail Records
    await db.addAuditLog({
      requestId,
      action: 'REQUEST_CREATED',
      actor: `${student.name} (${student.studentId})`,
      details: `Student submitted natural language document request`
    });

    await db.addAuditLog({
      requestId,
      action: 'AI_PARSED',
      actor: 'CampusFlow AI Engine',
      details: `Extracted Document: ${aiUnderstanding.documentType}, Purpose: ${aiUnderstanding.purpose}, Org: ${aiUnderstanding.organization || 'N/A'}`
    });

    await db.addAuditLog({
      requestId,
      action: 'STUDENT_RECORD_RETRIEVED',
      actor: 'CampusFlow Core Database',
      details: `Retrieved record for ${student.name}: Attendance: ${student.attendancePercentage}%, Fees Due: ₹${student.feesDue}, Enrollment: ${student.enrollmentStatus}`
    });

    await db.addAuditLog({
      requestId,
      action: 'RULES_EVALUATED',
      actor: 'Deterministic Rule Engine',
      details: `Evaluated 4 institutional rules -> Result: ${ruleEvaluation.decision}`
    });

    if (ruleEvaluation.decision === 'AUTO_APPROVE') {
      await db.addAuditLog({
        requestId,
        action: 'DECISION_AUTO_APPROVED',
        actor: 'CampusFlow Automated Policy Dispatcher',
        details: 'All institutional requirements satisfied. Auto-approval granted.'
      });

      await db.addAuditLog({
        requestId,
        action: 'CERTIFICATE_GENERATED',
        actor: 'Certificate & QR Cryptographic Engine',
        details: `Issued Certificate #${certificateId} with verified QR integrity stamp`
      });
    } else if (ruleEvaluation.decision === 'REVIEW') {
      await db.addAuditLog({
        requestId,
        action: 'EXCEPTION_ROUTED',
        actor: 'Exception Routing Engine',
        details: `Exception flagged: ${ruleEvaluation.reasons.join(', ')}. Routed to ${ruleEvaluation.route} Department.`
      });
    } else if (ruleEvaluation.decision === 'BLOCKED') {
      await db.addAuditLog({
        requestId,
        action: 'REQUEST_BLOCKED',
        actor: 'Institutional Policy Gatekeeper',
        details: `Request blocked: ${ruleEvaluation.reasons.join(', ')}`
      });
    }

    const auditLogs = await db.getAuditLogsByRequestId(requestId);
    const cert = certificateId ? await db.getCertificateById(certificateId) : null;

    return res.status(201).json({
      success: true,
      data: {
        ...newRequest,
        auditLogs,
        certificate: cert,
        student
      }
    });
  } catch (err) {
    console.error('Create request error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error processing request' });
  }
}

export async function getStudentRequests(req, res) {
  try {
    const studentId = req.student?.studentId || req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID not associated with account' });
    }

    const requests = await db.getRequestsByStudentId(studentId);
    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error('Get student requests error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve requests' });
  }
}

export async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    const request = await db.getRequestById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Role-based security: students can only access their own requests
    if (req.user.role === 'student' && request.studentId !== req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Access forbidden: unauthorized request viewing' });
    }

    const student = await db.findStudentById(request.studentId);
    const auditLogs = await db.getAuditLogsByRequestId(request.id);
    const certificate = request.certificateId ? await db.getCertificateById(request.certificateId) : null;

    return res.json({
      success: true,
      data: {
        ...request,
        student,
        auditLogs,
        certificate
      }
    });
  } catch (err) {
    console.error('Get request by ID error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch request' });
  }
}
