import QRCode from 'qrcode';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

export async function generateQrCodeDataUrl(certificateId) {
  const verificationUrl = `${ENV.CLIENT_URL}/verify/${certificateId}`;
  return QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff'
    }
  });
}

export async function generateQrCodeBuffer(certificateId) {
  const verificationUrl = `${ENV.CLIENT_URL}/verify/${certificateId}`;
  return QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff'
    }
  });
}

export function generateVerificationHash(certificateData) {
  const payload = `${certificateData.certificateId}:${certificateData.studentId}:${certificateData.issueDate}:${certificateData.documentType}`;
  return 'cf_sha256_' + crypto.createHash('sha256').update(payload).digest('hex').substring(0, 24);
}
