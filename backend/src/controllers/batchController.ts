import { Request, Response } from 'express';
import { BatchStatus, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { CsvService } from '../services/csvService';
import { eventBus } from '../events/eventBus';
import { logger } from '../utils/logger';

export class BatchController {
  public static async getBatches(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { status, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Role-based filtering
    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId) {
      where.trainingCentreId = user.trainingCentreId;
    } else if (user.role === Role.DISTRICT_OFFICER && user.districtId) {
      where.districtId = user.districtId;
    }

    if (status && status !== 'ALL') {
      where.status = status as BatchStatus;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { batchNumber: { contains: q, mode: 'insensitive' } },
        { batchName: { contains: q, mode: 'insensitive' } },
        { courseName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, batches] = await Promise.all([
      prisma.batch.count({ where }),
      prisma.batch.findMany({
        where,
        include: {
          trainingCentre: { select: { id: true, name: true, code: true } },
          district: { select: { id: true, name: true, code: true } },
          approvals: {
            where: { approvalCycle: undefined }, // will sort by cycle
            include: { officer: { select: { id: true, name: true, role: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: batches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  public static async getBatchById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        trainingCentre: true,
        district: true,
        candidates: {
          include: {
            certificate: {
              include: {
                delivery: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        approvals: {
          include: {
            officer: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }

    // Strict Training Centre isolation: Trainer can ONLY access their own centre's batch
    const user = req.user!;
    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId && batch.trainingCentreId !== user.trainingCentreId) {
      res.status(403).json({ success: false, error: 'Access denied: You can only access batches belonging to your accredited training centre' });
      return;
    }

    res.json({
      success: true,
      batch,
    });
  }

  public static async createBatch(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { batchName, courseName, courseCode, trainingStartDate, trainingEndDate } = req.body;

    let targetCentreId = req.body.trainingCentreId;
    let targetDistrictId = req.body.districtId;

    // Strict Training Centre isolation: Trainer can ONLY create batches for their own assigned centre
    if (user.role === Role.TRAINING_CENTRE) {
      if (!user.trainingCentreId) {
        res.status(403).json({ success: false, error: 'Trainer account has no accredited training centre assigned' });
        return;
      }
      targetCentreId = user.trainingCentreId;

      const tc = await prisma.trainingCentre.findUnique({ where: { id: user.trainingCentreId } });
      if (tc) {
        targetDistrictId = tc.districtId;
      }
    }

    const sanitizedCode = courseCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const currentYear = new Date().getFullYear();
    const count = await prisma.batch.count();
    const batchNumber = `CF/${currentYear}/${sanitizedCode}/${String(count + 1).padStart(3, '0')}`;

    const batch = await prisma.batch.create({
      data: {
        batchNumber,
        batchName,
        courseName,
        courseCode: sanitizedCode,
        trainingCentreId: targetCentreId,
        districtId: targetDistrictId,
        trainingStartDate: trainingStartDate ? new Date(trainingStartDate) : null,
        trainingEndDate: trainingEndDate ? new Date(trainingEndDate) : null,
        status: BatchStatus.DRAFT,
      },
      include: {
        trainingCentre: true,
        district: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'BATCH_CREATED',
        entityType: 'BATCH',
        entityId: batch.id,
        metadata: { batchNumber, batchName, courseName },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      batch,
    });
  }

  public static async uploadCsv(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user!;

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { trainingCentre: true },
    });

    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }

    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId && batch.trainingCentreId !== user.trainingCentreId) {
      res.status(403).json({ success: false, error: 'Access denied: You cannot submit another training centre\'s batch' });
      return;
    }

    if (batch.status !== BatchStatus.DRAFT && batch.status !== BatchStatus.RETURNED) {
      res.status(400).json({
        success: false,
        error: `Cannot upload candidates to a batch with status '${batch.status}'`,
      });
      return;
    }

    // Get CSV content either from multer file buffer or raw text body
    let csvContent = '';
    if (req.file) {
      csvContent = req.file.buffer.toString('utf-8');
    } else if (typeof req.body === 'string') {
      csvContent = req.body;
    } else if (req.body.csv) {
      csvContent = req.body.csv;
    }

    if (!csvContent || csvContent.trim().length === 0) {
      res.status(400).json({ success: false, error: 'CSV file or content is required' });
      return;
    }

    // Validate using CsvService
    const validationResult = CsvService.validateCsv(csvContent, batch.courseName);

    // CRITICAL: If ANY row is invalid, reject entire upload! Transactional guarantee.
    if (!validationResult.isValid) {
      res.status(422).json({
        success: false,
        error: `Validation failed: Found ${validationResult.invalidRows.length} invalid rows out of ${validationResult.totalRows} total candidates. Entire upload rejected.`,
        validation: {
          totalRows: validationResult.totalRows,
          validCount: validationResult.validRows.length,
          invalidCount: validationResult.invalidRows.length,
          invalidRows: validationResult.invalidRows,
        },
      });
      return;
    }

    // Transactional insertion: remove old candidates for this draft batch and insert valid rows
    await prisma.$transaction(async (tx) => {
      // Remove any existing candidates if updating draft
      await tx.candidate.deleteMany({
        where: { batchId: batch.id },
      });

      // Insert all validated candidates
      await tx.candidate.createMany({
        data: validationResult.validRows.map((candidate) => ({
          batchId: batch.id,
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          courseName: candidate.courseName,
        })),
      });

      // Update candidate count on batch
      await tx.batch.update({
        where: { id: batch.id },
        data: {
          candidateCount: validationResult.validRows.length,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'CANDIDATES_UPLOADED',
          entityType: 'BATCH',
          entityId: batch.id,
          metadata: {
            count: validationResult.validRows.length,
            batchNumber: batch.batchNumber,
          },
        },
      });
    });

    res.json({
      success: true,
      message: `Successfully validated and saved all ${validationResult.validRows.length} candidates.`,
      validation: {
        totalRows: validationResult.totalRows,
        validCount: validationResult.validRows.length,
        invalidCount: 0,
      },
      candidateCount: validationResult.validRows.length,
    });
  }

  public static async submitBatch(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user!;

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { candidates: true },
    });

    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }

    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId && batch.trainingCentreId !== user.trainingCentreId) {
      res.status(403).json({ success: false, error: 'Access denied: You cannot submit another training centre\'s batch' });
      return;
    }

    if (batch.status !== BatchStatus.DRAFT && batch.status !== BatchStatus.RETURNED) {
      res.status(400).json({
        success: false,
        error: `Only batches in DRAFT or RETURNED status can be submitted. Current status: ${batch.status}`,
      });
      return;
    }

    if (batch.candidates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot submit a batch with 0 candidates. Please upload a valid CSV first.',
      });
      return;
    }

    const nextCycle = batch.status === BatchStatus.RETURNED ? batch.approvalCycle + 1 : batch.approvalCycle;

    const updatedBatch = await prisma.batch.update({
      where: { id },
      data: {
        status: BatchStatus.SUBMITTED,
        submittedAt: new Date(),
        approvalCycle: nextCycle,
      },
    });

    // Notify District Officers
    await prisma.notification.create({
      data: {
        role: Role.DISTRICT_OFFICER,
        title: 'New Batch Submitted for Review',
        message: `Batch ${batch.batchNumber} (${batch.courseName}, ${batch.candidateCount} candidates) was submitted by ${user.name}.`,
        link: `/batches/${batch.id}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: batch.status === BatchStatus.RETURNED ? 'BATCH_RESUBMITTED' : 'BATCH_SUBMITTED',
        entityType: 'BATCH',
        entityId: batch.id,
        metadata: {
          batchNumber: batch.batchNumber,
          candidates: batch.candidateCount,
          approvalCycle: nextCycle,
        },
      },
    });

    eventBus.broadcast('BATCH_SUBMITTED', {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      candidateCount: batch.candidateCount,
      submittedBy: user.name,
    });

    res.json({
      success: true,
      message: 'Batch submitted for approval successfully.',
      batch: updatedBatch,
    });
  }

  public static async getSampleCsv(req: Request, res: Response): Promise<void> {
    const csv = CsvService.getSampleCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="certiflow_candidates_sample.csv"');
    res.send(csv);
  }

  public static async getLookups(req: Request, res: Response): Promise<void> {
    const [districts, trainingCentres] = await Promise.all([
      prisma.district.findMany({ orderBy: { name: 'asc' } }),
      prisma.trainingCentre.findMany({ include: { district: true }, orderBy: { name: 'asc' } }),
    ]);

    res.json({
      success: true,
      districts,
      trainingCentres,
    });
  }
}
