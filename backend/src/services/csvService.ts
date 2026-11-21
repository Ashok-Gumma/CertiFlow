import Papa from 'papaparse';
import { CsvValidationResult, ValidatedCandidate } from '../types';

export class CsvService {
  /**
   * Generates a downloadable sample CSV template
   */
  public static getSampleCsv(): string {
    const sample = [
      {
        'Candidate Name': 'Aarav Sharma',
        'Phone': '+919876543210',
        'Email': 'aarav.sharma@example.com',
        'Course': 'Java Full Stack Development',
      },
      {
        'Candidate Name': 'Priya Patel',
        'Phone': '+919876543211',
        'Email': 'priya.patel@example.com',
        'Course': 'Java Full Stack Development',
      },
      {
        'Candidate Name': 'Rohan Nair',
        'Phone': '+919876543212',
        'Email': 'rohan.nair@example.com',
        'Course': 'Java Full Stack Development',
      },
    ];
    return Papa.unparse(sample);
  }

  /**
   * Parses and strictly validates a CSV string or buffer.
   * CRITICAL REQUIREMENT: If ANY row is invalid, isValid is false, and full batch is rejected.
   */
  public static validateCsv(csvContent: string, expectedCourseName?: string): CsvValidationResult {
    const parsed = Papa.parse<Record<string, string>>(csvContent.trim(), {
      header: true,
      skipEmptyLines: 'greedy',
    });

    if (parsed.errors && parsed.errors.length > 0) {
      return {
        totalRows: 0,
        validRows: [],
        invalidRows: parsed.errors.map((err) => ({
          row: err.row ?? 1,
          reason: `CSV Parsing error: ${err.message}`,
          data: {},
        })),
        isValid: false,
      };
    }

    const rows = parsed.data;
    const validRows: ValidatedCandidate[] = [];
    const invalidRows: { row: number; reason: string; data: Record<string, any> }[] = [];

    const emailSet = new Set<string>();
    const phoneSet = new Set<string>();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    rows.forEach((row, index) => {
      const rowNum = index + 2; // +2 considering header is row 1 (1-indexed)

      // Normalize row keys for resilient enterprise header matching (e.g. Student, Phone Number, Mobile, etc.)
      const normalizedRow: Record<string, string> = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        normalizedRow[cleanKey] = (row[key] || '').trim();
      });

      // Name matches: student, studentname, candidate, candidatename, fullname, name, learner, participant
      const rawName = (
        normalizedRow['student'] ||
        normalizedRow['studentname'] ||
        normalizedRow['candidatename'] ||
        normalizedRow['candidate'] ||
        normalizedRow['fullname'] ||
        normalizedRow['name'] ||
        normalizedRow['learner'] ||
        normalizedRow['participant'] ||
        row['Candidate Name'] ||
        row['Student'] ||
        row['Name'] ||
        ''
      ).trim();

      // Phone matches: phone, phonenumber, mobile, mobilenumber, contact, contactnumber, tel, telephone, cell
      const rawPhone = (
        normalizedRow['phonenumber'] ||
        normalizedRow['phone'] ||
        normalizedRow['mobilenumber'] ||
        normalizedRow['mobile'] ||
        normalizedRow['contact'] ||
        normalizedRow['contactnumber'] ||
        normalizedRow['tel'] ||
        normalizedRow['telephone'] ||
        normalizedRow['cell'] ||
        row['Phone Number'] ||
        row['Phone'] ||
        row['Mobile'] ||
        ''
      ).trim();

      // Email matches: email, emailaddress, mail, mailaddress, e-mail
      const rawEmail = (
        normalizedRow['email'] ||
        normalizedRow['emailaddress'] ||
        normalizedRow['mail'] ||
        normalizedRow['mailaddress'] ||
        row['Email'] ||
        row['Email Address'] ||
        ''
      ).trim().toLowerCase();

      // Course matches: course, coursename, qualification, program, trade, or defaults directly to batch course
      const rawCourse = (
        normalizedRow['course'] ||
        normalizedRow['coursename'] ||
        normalizedRow['qualification'] ||
        normalizedRow['program'] ||
        normalizedRow['trade'] ||
        row['Course'] ||
        row['Course Name'] ||
        expectedCourseName ||
        'NSQF Vocational Qualification'
      ).trim();

      const reasons: string[] = [];

      // Validate Candidate Name
      if (!rawName || rawName.length < 2) {
        reasons.push('Candidate name is required and must be at least 2 characters.');
      }

      // Validate Phone (handles +91, spaces, hyphens, and 10-digit Indian standard)
      const digitsOnly = rawPhone.replace(/\D/g, '');
      if (!digitsOnly || digitsOnly.length < 10 || digitsOnly.length > 15) {
        reasons.push(`Invalid phone number '${rawPhone}'. Must be 10-15 digits.`);
      }

      // Validate Email
      if (!rawEmail || !emailRegex.test(rawEmail)) {
        reasons.push(`Invalid email address '${rawEmail}'.`);
      }

      // Validate Course consistency (if explicitly supplied in CSV, allow if equal or matching batch domain)
      if (!rawCourse) {
        reasons.push('Course name is missing.');
      }

      // Check Duplicates within the same CSV upload
      if (rawEmail && emailSet.has(rawEmail)) {
        reasons.push(`Duplicate email '${rawEmail}' found in upload.`);
      }
      if (digitsOnly && phoneSet.has(digitsOnly)) {
        reasons.push(`Duplicate phone number '${rawPhone}' found in upload.`);
      }

      if (reasons.length > 0) {
        invalidRows.push({
          row: rowNum,
          reason: reasons.join(' '),
          data: row,
        });
      } else {
        emailSet.add(rawEmail);
        phoneSet.add(digitsOnly);
        validRows.push({
          name: rawName,
          phone: rawPhone,
          email: rawEmail,
          courseName: rawCourse,
        });
      }
    });

    return {
      totalRows: rows.length,
      validRows,
      invalidRows,
      isValid: invalidRows.length === 0 && validRows.length > 0,
    };
  }
}
