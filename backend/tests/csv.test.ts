import { describe, it, expect } from 'vitest';
import { CsvService } from '../src/services/csvService';

describe('CSV Parsing & Validation Unit Tests', () => {
  it('should validate a correctly formatted CSV', () => {
    const validCsv = `Candidate Name,Phone,Email,Course
Aarav Sharma,+919876543210,aarav@example.com,Java Full Stack
Priya Patel,+919876543211,priya@example.com,Java Full Stack`;

    const result = CsvService.validateCsv(validCsv, 'Java Full Stack');
    expect(result.isValid).toBe(true);
    expect(result.totalRows).toBe(2);
    expect(result.validRows.length).toBe(2);
    expect(result.invalidRows.length).toBe(0);
  });

  it('should reject entire CSV if candidate name is missing or too short', () => {
    const invalidCsv = `Candidate Name,Phone,Email,Course
A,+919876543210,valid@example.com,Java Full Stack
Priya Patel,+919876543211,priya@example.com,Java Full Stack`;

    const result = CsvService.validateCsv(invalidCsv, 'Java Full Stack');
    expect(result.isValid).toBe(false);
    expect(result.invalidRows.length).toBe(1);
    expect(result.invalidRows[0].row).toBe(2);
    expect(result.invalidRows[0].reason).toContain('name is required');
  });

  it('should reject entire CSV if phone number is invalid', () => {
    const invalidPhoneCsv = `Candidate Name,Phone,Email,Course
Aarav Sharma,12345,aarav@example.com,Java Full Stack
Priya Patel,+919876543211,priya@example.com,Java Full Stack`;

    const result = CsvService.validateCsv(invalidPhoneCsv, 'Java Full Stack');
    expect(result.isValid).toBe(false);
    expect(result.invalidRows.length).toBe(1);
    expect(result.invalidRows[0].reason).toContain('Invalid phone number');
  });

  it('should reject entire CSV if email format is invalid', () => {
    const invalidEmailCsv = `Candidate Name,Phone,Email,Course
Aarav Sharma,+919876543210,not-an-email,Java Full Stack
Priya Patel,+919876543211,priya@example.com,Java Full Stack`;

    const result = CsvService.validateCsv(invalidEmailCsv, 'Java Full Stack');
    expect(result.isValid).toBe(false);
    expect(result.invalidRows.length).toBe(1);
    expect(result.invalidRows[0].reason).toContain('Invalid email address');
  });

  it('should reject entire CSV if duplicate email exists within upload', () => {
    const duplicateCsv = `Candidate Name,Phone,Email,Course
Aarav Sharma,+919876543210,duplicate@example.com,Java Full Stack
Priya Patel,+919876543211,duplicate@example.com,Java Full Stack`;

    const result = CsvService.validateCsv(duplicateCsv, 'Java Full Stack');
    expect(result.isValid).toBe(false);
    expect(result.invalidRows.length).toBe(1);
    expect(result.invalidRows[0].reason).toContain('Duplicate email');
  });

  it('should reject entire CSV if course name does not match batch', () => {
    const courseMismatchCsv = `Candidate Name,Phone,Email,Course
Aarav Sharma,+919876543210,aarav@example.com,Python Data Science`;

    const result = CsvService.validateCsv(courseMismatchCsv, 'Java Full Stack');
    expect(result.isValid).toBe(false);
    expect(result.invalidRows[0].reason).toContain('does not match batch course');
  });

  it('should generate a downloadable sample CSV template', () => {
    const sample = CsvService.getSampleCsv();
    expect(sample).toContain('Candidate Name');
    expect(sample).toContain('Phone');
    expect(sample).toContain('Email');
    expect(sample).toContain('Course');
  });
});
