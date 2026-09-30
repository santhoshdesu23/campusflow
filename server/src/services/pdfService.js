import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateQrCodeBuffer } from './qrService.js';

export async function generateCertificatePdf(cert) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  // Standard A4 portrait: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Load standard fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Palette
  const navy = rgb(0.06, 0.09, 0.20); // #0f172a
  const indigo = rgb(0.26, 0.22, 0.79); // #4338ca
  const gold = rgb(0.79, 0.60, 0.24); // #c99a3d
  const slateDark = rgb(0.2, 0.25, 0.33); // #334155
  const slateLight = rgb(0.55, 0.6, 0.68); // #8c99ae

  // 1. Decorative Borders
  // Outer border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: navy,
    borderWidth: 2,
  });

  // Inner fine border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: gold,
    borderWidth: 0.75,
  });

  // Corner decorative marks
  const corners = [
    { x: 34, y: 34 },
    { x: width - 44, y: 34 },
    { x: 34, y: height - 44 },
    { x: width - 44, y: height - 44 }
  ];
  for (const c of corners) {
    page.drawRectangle({
      x: c.x,
      y: c.y,
      width: 10,
      height: 10,
      borderColor: indigo,
      borderWidth: 1,
    });
  }

  // 2. University Crest / Header
  // Crest icon outline
  page.drawCircle({
    x: width / 2,
    y: height - 80,
    size: 26,
    borderColor: gold,
    borderWidth: 1.5,
  });
  const crestText = "CFU";
  const crestWidth = fontBold.widthOfTextAtSize(crestText, 14);
  page.drawText(crestText, {
    x: (width - crestWidth) / 2,
    y: height - 85,
    size: 14,
    font: fontBold,
    color: indigo,
  });

  const uniName = "CAMPUSFLOW DEMO UNIVERSITY";
  const uniNameWidth = fontTimesBold.widthOfTextAtSize(uniName, 22);
  page.drawText(uniName, {
    x: (width - uniNameWidth) / 2,
    y: height - 122,
    size: 22,
    font: fontTimesBold,
    color: navy,
  });

  const subHeader = "ESTABLISHED UNDER INSTITUTIONAL EXCELLENCE ACT • ACCREDITED GRADE A++";
  const subHeaderWidth = fontRegular.widthOfTextAtSize(subHeader, 8);
  page.drawText(subHeader, {
    x: (width - subHeaderWidth) / 2,
    y: height - 138,
    size: 8,
    font: fontRegular,
    color: slateDark,
  });

  const officeText = "OFFICE OF THE ACADEMIC REGISTRAR";
  const officeWidth = fontBold.widthOfTextAtSize(officeText, 10);
  page.drawText(officeText, {
    x: (width - officeWidth) / 2,
    y: height - 154,
    size: 10,
    font: fontBold,
    color: indigo,
  });

  // Divider line
  page.drawLine({
    start: { x: 60, y: height - 168 },
    end: { x: width - 60, y: height - 168 },
    thickness: 1,
    color: gold,
  });

  // Certificate Reference Details
  const refText = `REF: ${cert.certificateId || 'CF-2026-00124'}`;
  page.drawText(refText, {
    x: 60,
    y: height - 190,
    size: 9,
    font: fontBold,
    color: slateDark,
  });

  const formattedDate = new Date(cert.issueDate || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const dateText = `DATE: ${formattedDate}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 9);
  page.drawText(dateText, {
    x: width - 60 - dateWidth,
    y: height - 190,
    size: 9,
    font: fontRegular,
    color: slateDark,
  });

  // Certificate Title
  const title = "BONAFIDE CERTIFICATE";
  const titleWidth = fontBold.widthOfTextAtSize(title, 18);
  
  // Title background pill
  page.drawRectangle({
    x: (width - titleWidth - 40) / 2,
    y: height - 245,
    width: titleWidth + 40,
    height: 32,
    color: rgb(0.95, 0.96, 0.99),
    borderColor: indigo,
    borderWidth: 1,
  });

  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 233,
    size: 18,
    font: fontBold,
    color: indigo,
  });

  // Certificate Body Paragraphs
  const p1 = `This is to certify that ${cert.studentName || 'the student'}, bearing Student Identification Number`;
  const p2 = `${cert.studentId || 'STU001'}, is a bonafide student of CampusFlow Demo University, enrolled in the`;
  const p3 = `${cert.program || 'Degree Program'}, currently in ${cert.year || 'Current Year'} during the Academic Session 2025–2026.`;
  
  const p4 = `According to institutional records maintained by the Registrar's Office, the student has a verified active`;
  const p5 = `academic status with no disciplinary or institutional holds.`;

  const orgStr = cert.organization ? ` with ${cert.organization}` : '';
  const p6 = `This certificate is issued upon official request for the specific purpose of:`;
  const purposeLine = `${cert.purpose || 'Internship'}${orgStr}.`;

  const lines = [
    { text: p1, y: height - 310, font: fontRegular, size: 11, color: slateDark },
    { text: p2, y: height - 330, font: fontRegular, size: 11, color: slateDark },
    { text: p3, y: height - 350, font: fontRegular, size: 11, color: slateDark },
    { text: p4, y: height - 390, font: fontRegular, size: 11, color: slateDark },
    { text: p5, y: height - 410, font: fontRegular, size: 11, color: slateDark },
    { text: p6, y: height - 450, font: fontRegular, size: 11, color: slateDark },
    { text: purposeLine, y: height - 475, font: fontBold, size: 12, color: navy },
  ];

  for (const item of lines) {
    const textWidth = item.font.widthOfTextAtSize(item.text, item.size);
    page.drawText(item.text, {
      x: (width - textWidth) / 2,
      y: item.y,
      size: item.size,
      font: item.font,
      color: item.color,
    });
  }

  // 3. Verification & QR Code Section
  try {
    const qrBuffer = await generateQrCodeBuffer(cert.certificateId);
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    
    // Draw QR Code
    page.drawImage(qrImage, {
      x: 60,
      y: 110,
      width: 90,
      height: 90,
    });

    // QR instructions
    page.drawText("SCAN TO VERIFY INTEGRITY", {
      x: 60,
      y: 95,
      size: 7,
      font: fontBold,
      color: indigo,
    });

    const hashStr = `Hash: ${cert.verificationHash || 'cf_sha256_verified'}`;
    page.drawText(hashStr, {
      x: 60,
      y: 82,
      size: 6,
      font: fontRegular,
      color: slateLight,
    });
  } catch (err) {
    console.error("Failed to embed QR image in PDF:", err);
  }

  // Official Seal Stamp in center
  page.drawCircle({
    x: width / 2,
    y: 155,
    size: 32,
    borderColor: gold,
    borderWidth: 1.5,
  });
  page.drawText("OFFICIAL SEAL", {
    x: width / 2 - 28,
    y: 152,
    size: 7,
    font: fontBold,
    color: gold,
  });

  // Registrar Signature Section (Right)
  const sigX = width - 200;
  
  // Drawn signature line simulation
  page.drawLine({
    start: { x: sigX, y: 145 },
    end: { x: width - 60, y: 145 },
    thickness: 1,
    color: slateDark,
  });

  // Script signature approximation
  page.drawText("V. Ramanathan", {
    x: sigX + 25,
    y: 155,
    size: 15,
    font: fontOblique,
    color: indigo,
  });

  page.drawText("Dr. V. Ramanathan, Ph.D.", {
    x: sigX + 15,
    y: 130,
    size: 10,
    font: fontBold,
    color: navy,
  });

  page.drawText("Academic Registrar", {
    x: sigX + 30,
    y: 118,
    size: 9,
    font: fontRegular,
    color: slateDark,
  });

  page.drawText("CampusFlow Demo University", {
    x: sigX + 12,
    y: 106,
    size: 8,
    font: fontRegular,
    color: slateLight,
  });

  // Footer Disclaimer
  const disclaimer = "This digitally signed document is generated through CampusFlow AI workflow automation. Its validity can be verified online.";
  const disclaimerWidth = fontRegular.widthOfTextAtSize(disclaimer, 7);
  page.drawText(disclaimer, {
    x: (width - disclaimerWidth) / 2,
    y: 45,
    size: 7,
    font: fontRegular,
    color: slateLight,
  });

  return await pdfDoc.save();
}
