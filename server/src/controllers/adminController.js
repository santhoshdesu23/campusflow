import { db } from '../models/db.js';
import { generateAdminDraft } from '../ai/geminiService.js';
import { generateVerificationHash, generateQrCodeDataUrl } from '../services/qrService.js';

export async function getAllAdminRequests(req, res) {
  try {
    const { status, department, search } = req.query;
    let requests = await db.getAllRequests();

    if (status && status !== 'all') {
      requests = requests.filter(r => r.status === status || r.decision === status);
    }

    if (department && department !== 'all') {
      requests = requests.filter(r => (r.route || '').toLowerCase() === department.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      requests = requests.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.documentType.toLowerCase().includes(q) ||
        (r.aiUnderstanding?.purpose || '').toLowerCase().includes(q)
      );
    }

    // Compute metrics
    const all = await db.getAllRequests();
    const stats = {
      total: all.length,
      autoProcessed: all.filter(r => r.decision === 'AUTO_APPROVE' || (r.status === 'approved' && !r.route)).length,
      awaitingReview: all.filter(r => r.status === 'pending_review').length,
      blocked: all.filter(r => r.status === 'blocked').length,
      approvedExceptions: all.filter(r => r.status === 'approved' && r.decision === 'REVIEW').length
    };

    return res.json({
      success: true,
      data: requests,
      stats
    });
  } catch (err) {
    console.error('Admin get requests error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin requests' });
  }
}

export async function getAdminRequestDetail(req, res) {
  try {
    const { id } = req.params;
    const request = await db.getRequestById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const student = await db.findStudentById(request.studentId);
    const auditLogs = await db.getAuditLogsByRequestId(request.id);
    const certificate = request.certificateId ? await db.getCertificateById(request.certificateId) : null;
    
    // AI generated draft message for admin communication
    const adminDraft = student ? generateAdminDraft(request, student) : null;

    return res.json({
      success: true,
      data: {
        ...request,
        student,
        auditLogs,
        certificate,
        adminDraft
      }
    });
  } catch (err) {
    console.error('Admin get request detail error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve request detail' });
  }
}

export async function approveRequest(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const request = await db.getRequestById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const student = await db.findStudentById(request.studentId);
    const now = new Date().toISOString();

    // Generate Certificate if not existing
    let certificate = request.certificateId ? await db.getCertificateById(request.certificateId) : null;
    if (!certificate) {
      const certId = `CERT-2026-${request.id.replace('CF-2026-', '')}`;
      certificate = {
        certificateId: certId,
        requestId: request.id,
        studentId: student.studentId,
        studentName: student.name,
        documentType: request.documentType || 'Bonafide Certificate',
        purpose: request.aiUnderstanding?.purpose || 'Official Verification',
        organization: request.aiUnderstanding?.organization || 'Official Records',
        program: student.program,
        year: student.year,
        issueDate: now,
        validUntil: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
        status: 'Valid',
        verificationHash: generateVerificationHash({
          certificateId: certId,
          studentId: student.studentId,
          issueDate: now,
          documentType: request.documentType
        }),
        authorizedSignatory: 'Dr. V. Ramanathan, Academic Registrar'
      };
      certificate.qrCodeDataUrl = await generateQrCodeDataUrl(certId);
      await db.createCertificate(certificate);
    }

    // Update request
    const updated = await db.updateRequest(id, {
      status: 'approved',
      processedAt: now,
      certificateId: certificate.certificateId,
      adminReview: {
        reviewedBy: req.user.name,
        reviewedAt: now,
        decision: 'APPROVED_EXCEPTION',
        note: note || 'Exception reviewed and approved by Institutional Registrar.'
      }
    });

    // Add Audit Logs
    await db.addAuditLog({
      requestId: id,
      action: 'ADMIN_APPROVED',
      actor: `${req.user.name} (Admin)`,
      details: note || 'Manual exception override approved. Authorized certificate generation.'
    });

    await db.addAuditLog({
      requestId: id,
      action: 'CERTIFICATE_GENERATED',
      actor: 'CampusFlow System',
      details: `Generated Certificate #${certificate.certificateId}`
    });

    await db.addAuditLog({
      requestId: id,
      action: 'VERIFICATION_RECORD_CREATED',
      actor: 'Cryptographic QR Service',
      details: `Created public verification token: ${certificate.verificationHash}`
    });

    const auditLogs = await db.getAuditLogsByRequestId(id);

    return res.json({
      success: true,
      message: 'Request approved successfully',
      data: {
        ...updated,
        certificate,
        auditLogs
      }
    });
  } catch (err) {
    console.error('Approve request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve request' });
  }
}

export async function rejectRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await db.getRequestById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const now = new Date().toISOString();
    const updated = await db.updateRequest(id, {
      status: 'rejected',
      processedAt: now,
      adminReview: {
        reviewedBy: req.user.name,
        reviewedAt: now,
        decision: 'REJECTED',
        note: reason || 'Application does not meet institutional requirements.'
      }
    });

    await db.addAuditLog({
      requestId: id,
      action: 'ADMIN_REJECTED',
      actor: `${req.user.name} (Admin)`,
      details: `Rejected request: ${reason || 'Institutional policy non-compliance'}`
    });

    const auditLogs = await db.getAuditLogsByRequestId(id);

    return res.json({
      success: true,
      message: 'Request rejected',
      data: {
        ...updated,
        auditLogs
      }
    });
  } catch (err) {
    console.error('Reject request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
}

export async function requestMoreInfo(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const request = await db.getRequestById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await db.addAuditLog({
      requestId: id,
      action: 'INFO_REQUESTED',
      actor: `${req.user.name} (Admin)`,
      details: `Requested student documentation: ${message || 'Please upload updated clearance documents'}`
    });

    const auditLogs = await db.getAuditLogsByRequestId(id);

    return res.json({
      success: true,
      message: 'Information request sent to student',
      auditLogs
    });
  } catch (err) {
    console.error('Request info error:', err);
    return res.status(500).json({ success: false, message: 'Failed to request information' });
  }
}

export async function routeRequest(req, res) {
  try {
    const { id } = req.params;
    const { department, reason } = req.body;
    const request = await db.getRequestById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const updated = await db.updateRequest(id, {
      route: department.toUpperCase()
    });

    await db.addAuditLog({
      requestId: id,
      action: 'EXCEPTION_REROUTED',
      actor: `${req.user.name} (Admin)`,
      details: `Re-routed to ${department.toUpperCase()} department. ${reason ? 'Note: ' + reason : ''}`
    });

    return res.json({
      success: true,
      message: `Successfully routed to ${department.toUpperCase()} department`,
      data: updated
    });
  } catch (err) {
    console.error('Route request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to route request' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const logs = await db.getAllAuditLogs();
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
}

export async function getAllCertificates(req, res) {
  try {
    const certs = await db.getAllCertificates();
    return res.json({ success: true, data: certs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
}
