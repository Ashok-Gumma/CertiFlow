import { Role, BatchStatus, ApprovalDecision, CertificateStatus, DeliveryStatus } from '@prisma/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  districtId?: string | null;
  trainingCentreId?: string | null;
}

export interface CsvCandidateRow {
  'Candidate Name'?: string;
  'name'?: string;
  'CandidateName'?: string;
  'Phone'?: string;
  'phone'?: string;
  'Email'?: string;
  'email'?: string;
  'Course'?: string;
  'course'?: string;
  'CourseName'?: string;
}

export interface ValidatedCandidate {
  name: string;
  phone: string;
  email: string;
  courseName: string;
}

export interface CsvValidationResult {
  totalRows: number;
  validRows: ValidatedCandidate[];
  invalidRows: { row: number; reason: string; data: Record<string, any> }[];
  isValid: boolean;
}

export interface CertificateMetadata {
  certificateNumber: string;
  candidateName: string;
  courseName: string;
  trainingCentreName: string;
  batchNumber: string;
  issueDate: string;
  verificationUrl: string;
}
