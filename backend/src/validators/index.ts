import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createBatchSchema = z.object({
  batchName: z.string().min(3, 'Batch name must be at least 3 characters'),
  courseName: z.string().min(3, 'Course name must be at least 3 characters'),
  courseCode: z.string().min(2, 'Course code must be at least 2 characters'),
  trainingCentreId: z.string().uuid('Valid training centre ID is required'),
  districtId: z.string().uuid('Valid district ID is required'),
  trainingStartDate: z.string().optional(),
  trainingEndDate: z.string().optional(),
});

export const approvalSchema = z.object({
  decision: z.preprocess((val) => {
    if (typeof val === 'string') {
      const u = val.trim().toUpperCase();
      if (u === 'APPROVE') return 'APPROVED';
      if (u === 'REJECT') return 'REJECTED';
      if (u === 'RETURN') return 'RETURNED';
      return u;
    }
    return val;
  }, z.enum(['APPROVED', 'REJECTED', 'RETURNED'])),
  comments: z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), z.string().optional()),
}).refine((data) => {
  if (data.decision !== 'APPROVED' && (!data.comments || data.comments.length < 5)) {
    return false;
  }
  return true;
}, {
  message: 'A detailed reason (at least 5 characters) is required when rejecting or returning a batch for correction.',
  path: ['comments'],
});

export const revokeCertificateSchema = z.object({
  reason: z.string().min(5, 'Revocation reason must be at least 5 characters long'),
});

export const createCandidateSchema = z.object({
  batchId: z.string().uuid('Valid batch ID is required'),
  name: z.string().min(2, 'Candidate name must be at least 2 characters'),
  phone: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.replace(/[\s-]/g, '');
    }
    return val;
  }, z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format (e.g. +919876543210)')),
  email: z.string().email('Valid email address is required'),
  courseName: z.string().optional(),
});
