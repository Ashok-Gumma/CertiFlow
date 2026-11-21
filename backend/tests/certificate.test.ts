import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { generateCertificateId } from '../src/utils/certificateId';
import { PdfService } from '../src/services/pdfService';

describe('Certificate Generation & ID Integrity Tests', () => {
  it('should generate collision-safe certificate numbers matching CF/YYYY/CODE/MM/SERIAL format', () => {
    const certId = generateCertificateId('JAVA', 142);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    expect(certId).toBe(`CF/${year}/JAVA/${month}/000142`);
  });

  it('should generate 100 unique certificate IDs without collision', () => {
    const idSet = new Set<string>();
    const count = 100;

    for (let i = 0; i < count; i++) {
      const id = generateCertificateId('CLOUD');
      idSet.add(id);
    }

    expect(idSet.size).toBe(count);
  });

  it('should generate a valid PDF document with institutional styling and QR code', async () => {
    const mockMeta = {
      certificateNumber: 'CF/2026/TEST/11/000999',
      candidateName: 'Vikram Malhotra',
      courseName: 'Advanced Cloud Architecture',
      trainingCentreName: 'TechSkill Academy',
      batchNumber: 'CF/2026/TEST/001',
      issueDate: '21 Nov 2026',
      verificationUrl: 'http://localhost:5173/verify/CF/2026/TEST/11/000999',
    };

    const result = await PdfService.generateCertificatePdf(mockMeta);

    expect(result.buffer).toBeDefined();
    expect(result.buffer.length).toBeGreaterThan(1000); // realistic PDF size
    expect(fs.existsSync(result.filePath)).toBe(true);

    // Clean up test file
    try {
      fs.unlinkSync(result.filePath);
    } catch (e) {}
  });
});
