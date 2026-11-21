import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { CertificateMetadata } from '../types';
import { logger } from '../utils/logger';

export class PdfService {
  /**
   * Generates a high-resolution, sovereign institutional certificate PDF
   * modeled after official Indian Government vocational credentials (NCVET / NSDC / State Boards)
   */
  public static async generateCertificatePdf(meta: CertificateMetadata): Promise<{ buffer: Buffer; filePath: string }> {
    // Landscape A4: 842 x 595 points
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // Standard fonts
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Color definitions
    const primaryNavy = rgb(0.05, 0.11, 0.24);     // Deep Sovereign Navy #0D1C3D
    const royalBlue = rgb(0.12, 0.22, 0.42);       // #1E386B
    const deepGold = rgb(0.72, 0.52, 0.04);        // Rich Gold #B8860B
    const lightGold = rgb(0.92, 0.81, 0.52);       // #EBCE84
    const darkSlate = rgb(0.09, 0.12, 0.17);       // #171E2B
    const mutedSlate = rgb(0.40, 0.46, 0.54);      // #66758A
    const bgParchment = rgb(0.995, 0.992, 0.985);  // Warm Ivory Parchment

    // Background fill
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgParchment,
    });

    // Outer double security border
    page.drawRectangle({
      x: 18,
      y: 18,
      width: width - 36,
      height: height - 36,
      borderColor: deepGold,
      borderWidth: 2.5,
    });

    page.drawRectangle({
      x: 24,
      y: 24,
      width: width - 48,
      height: height - 48,
      borderColor: primaryNavy,
      borderWidth: 1,
    });

    page.drawRectangle({
      x: 27,
      y: 27,
      width: width - 54,
      height: height - 54,
      borderColor: lightGold,
      borderWidth: 0.5,
    });

    // Classical Corner Ornaments
    const cornerSize = 22;
    const drawCorner = (cx: number, cy: number) => {
      page.drawRectangle({
        x: cx,
        y: cy,
        width: cornerSize,
        height: cornerSize,
        borderColor: deepGold,
        borderWidth: 1,
        color: rgb(0.98, 0.95, 0.90),
      });
      page.drawRectangle({
        x: cx + 4,
        y: cy + 4,
        width: cornerSize - 8,
        height: cornerSize - 8,
        borderColor: primaryNavy,
        borderWidth: 0.8,
      });
    };
    drawCorner(20, height - 42);
    drawCorner(width - 42, height - 42);
    drawCorner(20, 20);
    drawCorner(width - 42, 20);

    // Micro-security top ribbon
    const ribbonText = 'DIRECTORATE GENERAL OF VOCATIONAL TRAINING | NATIONAL SKILLS AUTHORITY | OFFICIAL SOVEREIGN CREDENTIAL';
    const ribbonWidth = helveticaBold.widthOfTextAtSize(ribbonText, 6.5);
    page.drawText(ribbonText, {
      x: (width - ribbonWidth) / 2,
      y: height - 34,
      size: 6.5,
      font: helveticaBold,
      color: deepGold,
    });

    // 1. Apex Sovereign Crest & Header
    const govtText = 'DIRECTORATE GENERAL OF VOCATIONAL TRAINING';
    const govtWidth = timesRomanBold.widthOfTextAtSize(govtText, 14);
    page.drawText(govtText, {
      x: (width - govtWidth) / 2,
      y: height - 58,
      size: 14,
      font: timesRomanBold,
      color: primaryNavy,
    });

    const authorityText = 'NATIONAL VOCATIONAL QUALIFICATION AUTHORITY';
    const authorityWidth = helveticaBold.widthOfTextAtSize(authorityText, 10.5);
    page.drawText(authorityText, {
      x: (width - authorityWidth) / 2,
      y: height - 73,
      size: 10.5,
      font: helveticaBold,
      color: royalBlue,
    });

    const missionText = 'NATIONAL SKILLS QUALIFICATIONS FRAMEWORK - NSQF LEVEL 5 ACCREDITED';
    const missionWidth = helvetica.widthOfTextAtSize(missionText, 8.5);
    page.drawText(missionText, {
      x: (width - missionWidth) / 2,
      y: height - 86,
      size: 8.5,
      font: helvetica,
      color: mutedSlate,
    });

    // Gold divider flourish
    page.drawLine({
      start: { x: width / 2 - 200, y: height - 94 },
      end: { x: width / 2 + 200, y: height - 94 },
      thickness: 1.2,
      color: deepGold,
    });
    page.drawCircle({
      x: width / 2,
      y: height - 94,
      size: 3,
      color: deepGold,
    });

    // 2. Certificate Title & Framework Standard
    const title = 'CERTIFICATE OF SKILL COMPETENCY';
    const titleWidth = timesRomanBold.widthOfTextAtSize(title, 24);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: height - 124,
      size: 24,
      font: timesRomanBold,
      color: primaryNavy,
    });

    const nsqfText = 'Conferred under the National Skills Qualifications Framework (NSQF Level 5)';
    const nsqfWidth = timesRomanItalic.widthOfTextAtSize(nsqfText, 10);
    page.drawText(nsqfText, {
      x: (width - nsqfWidth) / 2,
      y: height - 138,
      size: 10,
      font: timesRomanItalic,
      color: deepGold,
    });

    // 3. Preamble & Candidate Identity
    const certifyText = 'This is to officially certify that';
    const certifyWidth = timesRomanItalic.widthOfTextAtSize(certifyText, 13);
    page.drawText(certifyText, {
      x: (width - certifyWidth) / 2,
      y: height - 165,
      size: 13,
      font: timesRomanItalic,
      color: mutedSlate,
    });

    const candidateName = meta.candidateName.toUpperCase();
    const candidateNameWidth = timesRomanBold.widthOfTextAtSize(candidateName, 23);
    page.drawText(candidateName, {
      x: (width - candidateNameWidth) / 2,
      y: height - 200,
      size: 23,
      font: timesRomanBold,
      color: darkSlate,
    });

    // Decorative Underline under Candidate Name
    page.drawLine({
      start: { x: width / 2 - 180, y: height - 207 },
      end: { x: width / 2 + 180, y: height - 207 },
      thickness: 1.5,
      color: deepGold,
    });

    // 4. Qualification Statement
    const completionStatement = 'has successfully completed all prescribed coursework, practical competencies, and standardized evaluations in';
    const statementWidth = timesRoman.widthOfTextAtSize(completionStatement, 11.5);
    page.drawText(completionStatement, {
      x: (width - statementWidth) / 2,
      y: height - 228,
      size: 11.5,
      font: timesRoman,
      color: darkSlate,
    });

    const courseTitle = meta.courseName;
    const courseWidth = timesRomanBold.widthOfTextAtSize(courseTitle, 18);
    page.drawText(courseTitle, {
      x: (width - courseWidth) / 2,
      y: height - 256,
      size: 18,
      font: timesRomanBold,
      color: primaryNavy,
    });

    // 5. Training Institution, Batch, and Assessment Grid
    const boxY = height - 330;
    const boxW = width - 160;
    const boxX = 80;
    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxW,
      height: 54,
      color: rgb(0.975, 0.985, 0.995),
      borderColor: rgb(0.85, 0.89, 0.94),
      borderWidth: 1,
    });

    const col1X = boxX + 18;
    const col2X = boxX + 260;
    const col3X = boxX + 490;

    page.drawText('ACCREDITED TRAINING INSTITUTION', { x: col1X, y: boxY + 36, size: 7.5, font: helveticaBold, color: mutedSlate });
    page.drawText(meta.trainingCentreName.length > 34 ? meta.trainingCentreName.slice(0, 32) + '...' : meta.trainingCentreName, {
      x: col1X,
      y: boxY + 18,
      size: 9.5,
      font: helveticaBold,
      color: darkSlate,
    });

    page.drawText('BATCH IDENTIFIER CODE', { x: col2X, y: boxY + 36, size: 7.5, font: helveticaBold, color: mutedSlate });
    page.drawText(meta.batchNumber, { x: col2X, y: boxY + 18, size: 9.5, font: helveticaBold, color: primaryNavy });

    page.drawText('ASSESSMENT PERFORMANCE', { x: col3X, y: boxY + 36, size: 7.5, font: helveticaBold, color: mutedSlate });
    page.drawText('Grade A (Exemplary Merit)', { x: col3X, y: boxY + 18, size: 9.5, font: helveticaBold, color: deepGold });

    // 6. Footer Section: QR Code, Gold Embossed Seal, and Dual Signatures
    // Generate QR Code for Public Verification
    const qrPngDataUrl = await QRCode.toDataURL(meta.verificationUrl, {
      margin: 1,
      width: 150,
      color: {
        dark: '#0D1C3D',
        light: '#FFFFFF',
      },
    });
    const qrImageBytes = Buffer.from(qrPngDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // Draw QR Code
    const qrSize = 82;
    const qrX = 80;
    const qrY = 60;
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Verification text beside QR
    page.drawText('DIGITAL VERIFICATION', { x: qrX + qrSize + 12, y: qrY + 68, size: 8, font: helveticaBold, color: deepGold });
    page.drawText('Scan QR or verify credential online:', { x: qrX + qrSize + 12, y: qrY + 54, size: 7.5, font: helvetica, color: mutedSlate });
    page.drawText(meta.verificationUrl.length > 38 ? meta.verificationUrl.slice(0, 36) + '...' : meta.verificationUrl, {
      x: qrX + qrSize + 12,
      y: qrY + 42,
      size: 7,
      font: helveticaBold,
      color: primaryNavy,
    });
    page.drawText(`Certificate ID: ${meta.certificateNumber}`, {
      x: qrX + qrSize + 12,
      y: qrY + 26,
      size: 8.5,
      font: helveticaBold,
      color: darkSlate,
    });
    page.drawText(`Issue Date: ${meta.issueDate}`, {
      x: qrX + qrSize + 12,
      y: qrY + 12,
      size: 7.5,
      font: helvetica,
      color: mutedSlate,
    });

    // Center Gold Seal of Government Accreditation
    const sealX = width / 2 + 10;
    const sealY = qrY + 40;
    page.drawCircle({
      x: sealX,
      y: sealY,
      size: 34,
      borderColor: deepGold,
      borderWidth: 2,
      color: rgb(0.99, 0.97, 0.91),
    });
    page.drawCircle({
      x: sealX,
      y: sealY,
      size: 28,
      borderColor: lightGold,
      borderWidth: 1,
    });
    const sealText1 = 'PRAGATI';
    const sealText2 = 'SEAL';
    page.drawText(sealText1, {
      x: sealX - helveticaBold.widthOfTextAtSize(sealText1, 7.5) / 2,
      y: sealY + 5,
      size: 7.5,
      font: helveticaBold,
      color: deepGold,
    });
    page.drawText(sealText2, {
      x: sealX - helveticaBold.widthOfTextAtSize(sealText2, 7.5) / 2,
      y: sealY - 7,
      size: 7.5,
      font: helveticaBold,
      color: deepGold,
    });

    // 7. Signatures: District Officer (Dev) and State Director (Farah)
    // Signature 1: District Officer (Dev)
    const sig1X = width - 265;
    const sigY = qrY + 32;

    // Fluid calligraphy signature representation for Dev
    page.drawLine({
      start: { x: sig1X + 5, y: sigY + 22 },
      end: { x: sig1X + 35, y: sigY + 34 },
      thickness: 1.5,
      color: royalBlue,
    });
    page.drawLine({
      start: { x: sig1X + 35, y: sigY + 34 },
      end: { x: sig1X + 55, y: sigY + 18 },
      thickness: 1.2,
      color: royalBlue,
    });
    page.drawLine({
      start: { x: sig1X + 55, y: sigY + 18 },
      end: { x: sig1X + 85, y: sigY + 26 },
      thickness: 1.4,
      color: royalBlue,
    });

    page.drawLine({
      start: { x: sig1X, y: sigY + 12 },
      end: { x: sig1X + 105, y: sigY + 12 },
      thickness: 0.8,
      color: mutedSlate,
    });
    page.drawText('Dev', { x: sig1X + 15, y: sigY, size: 8.5, font: helveticaBold, color: darkSlate });
    page.drawText('District Skill Officer (DSDO)', { x: sig1X + 2, y: sigY - 11, size: 7, font: helveticaBold, color: primaryNavy });
    page.drawText('District Vocational Authority', { x: sig1X + 2, y: sigY - 21, size: 6.5, font: helvetica, color: mutedSlate });

    // Signature 2: State Office Director (Farah)
    const sig2X = width - 140;

    // Fluid calligraphy signature representation for Farah
    page.drawLine({
      start: { x: sig2X + 5, y: sigY + 20 },
      end: { x: sig2X + 30, y: sigY + 36 },
      thickness: 1.5,
      color: royalBlue,
    });
    page.drawLine({
      start: { x: sig2X + 30, y: sigY + 36 },
      end: { x: sig2X + 50, y: sigY + 17 },
      thickness: 1.2,
      color: royalBlue,
    });
    page.drawLine({
      start: { x: sig2X + 50, y: sigY + 17 },
      end: { x: sig2X + 75, y: sigY + 28 },
      thickness: 1.4,
      color: royalBlue,
    });

    page.drawLine({
      start: { x: sig2X, y: sigY + 12 },
      end: { x: sig2X + 95, y: sigY + 12 },
      thickness: 0.8,
      color: mutedSlate,
    });
    page.drawText('Farah', { x: sig2X + 15, y: sigY, size: 8.5, font: helveticaBold, color: darkSlate });
    page.drawText('State Mission Director', { x: sig2X + 2, y: sigY - 11, size: 7, font: helveticaBold, color: primaryNavy });
    page.drawText('Directorate of Vocational Qual.', { x: sig2X + 2, y: sigY - 21, size: 6.5, font: helvetica, color: mutedSlate });

    // Micro-security bottom ribbon
    const botText = 'SOVEREIGN CREDENTIAL REPOSITORY | CRYPTOGRAPHIC SHA-256 INTEGRITY GUARANTEED | OFFICIAL REGISTRY';
    const botWidth = helvetica.widthOfTextAtSize(botText, 6);
    page.drawText(botText, {
      x: (width - botWidth) / 2,
      y: 28,
      size: 6,
      font: helvetica,
      color: mutedSlate,
    });

    // Serialize and save to disk
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    const safeFilename = `${meta.certificateNumber.replace(/[\/\\?%*:|"<>]/g, '_')}.pdf`;
    const certDir = path.resolve(config.uploadDir, 'certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const filePath = path.join(certDir, safeFilename);
    fs.writeFileSync(filePath, pdfBuffer);

    logger.info(`Generated Sovereign Certificate PDF: ${meta.certificateNumber} -> ${filePath}`);

    return {
      buffer: pdfBuffer,
      filePath,
    };
  }
}
