import crypto from 'crypto';

export function generateCertificateId(courseCode: string, sequenceNumber?: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sanitizedCode = courseCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6) || 'GEN';
  
  // If sequenceNumber provided use it, otherwise generate a secure random 6-digit number
  const serial = sequenceNumber !== undefined 
    ? String(sequenceNumber).padStart(6, '0')
    : String(crypto.randomInt(100000, 999999));

  return `CF/${year}/${sanitizedCode}/${month}/${serial}`;
}
