import { db } from '../models/db.js';
import { generateCertificatePdf } from '../services/pdfService.js';
import { generateQrCodeDataUrl } from '../services/qrService.js';

export async function getStudentCertificates(req, res) {
  try {
    const studentId = req.student?.studentId || req.user?.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }
    const certs = await db.getCertificatesByStudentId(studentId);
    return res.json({ success: true, data: certs });
  } catch (err) {
    console.error('Get student certificates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve certificates' });
  }
}

export async function getCertificate(req, res) {
  try {
    const { id } = req.params;
    let cert = await db.getCertificateById(id);

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate record not found' });
    }

    if (!cert.qrCodeDataUrl) {
      cert.qrCodeDataUrl = await generateQrCodeDataUrl(cert.certificateId);
    }

    const student = await db.findStudentById(cert.studentId);

    return res.json({
      success: true,
      data: {
        ...cert,
        student
      }
    });
  } catch (err) {
    console.error('Get certificate error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve certificate' });
  }
}

export async function verifyCertificate(req, res) {
  try {
    const { id } = req.params;
    const cert = await db.getCertificateById(id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Invalid certificate identifier. No record found in university registry.'
      });
    }

    const student = await db.findStudentById(cert.studentId);

    return res.json({
      success: true,
      verified: true,
      data: {
        certificateId: cert.certificateId,
        documentType: cert.documentType,
        studentName: cert.studentName,
        studentId: cert.studentId,
        program: cert.program || student?.program,
        year: cert.year || student?.year,
        issueDate: cert.issueDate,
        validUntil: cert.validUntil,
        status: cert.status || 'Valid',
        authorizedSignatory: cert.authorizedSignatory,
        verificationHash: cert.verificationHash,
        institution: 'CampusFlow Demo University',
        accreditation: 'Accredited Grade A++ • Institution of National Standing',
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Verify certificate error:', err);
    return res.status(500).json({ success: false, message: 'Verification lookup failed' });
  }
}

export async function downloadCertificatePdf(req, res) {
  try {
    const { id } = req.params;
    const cert = await db.getCertificateById(id);

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate record not found' });
    }

    const pdfBytes = await generateCertificatePdf(cert);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Bonafide_${cert.certificateId}.pdf"`
    );
    res.setHeader('Content-Length', pdfBytes.length);

    return res.end(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Download certificate PDF error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate certificate PDF' });
  }
}
