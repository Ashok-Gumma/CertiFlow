import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class CandidateController {
  public static async getCandidates(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { batchId, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (batchId) {
      where.batchId = String(batchId);
    }

    // Role-based scoping: each officer only sees candidates within their authority
    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId) {
      where.batch = { ...(where.batch || {}), trainingCentreId: user.trainingCentreId };
    } else if (user.role === Role.DISTRICT_OFFICER && user.districtId) {
      where.batch = { ...(where.batch || {}), districtId: user.districtId };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { courseName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, candidates] = await Promise.all([
      prisma.candidate.count({ where }),
      prisma.candidate.findMany({
        where,
        include: {
          batch: {
            include: {
              trainingCentre: true,
              district: true,
            },
          },
          certificate: {
            include: {
              delivery: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: candidates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  public static async getCandidateById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            trainingCentre: true,
            district: true,
          },
        },
        certificate: {
          include: {
            delivery: true,
          },
        },
      },
    });

    if (!candidate) {
      res.status(404).json({ success: false, error: 'Candidate not found' });
      return;
    }

    res.json({
      success: true,
      candidate,
    });
  }

  public static async createCandidate(req: Request, res: Response): Promise<void> {
    const { batchId, name, phone, email, courseName } = req.body;
    const user = req.user!;

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }

    // Training centre permission check
    if (user.role === 'TRAINING_CENTRE' && user.trainingCentreId && user.trainingCentreId !== batch.trainingCentreId) {
      res.status(403).json({ success: false, error: 'Cannot register candidates for another training centre' });
      return;
    }

    if (batch.status !== 'DRAFT' && batch.status !== 'RETURNED') {
      res.status(400).json({
        success: false,
        error: `Cannot add candidate to batch in '${batch.status}' status. Only DRAFT or RETURNED batches can be modified.`,
      });
      return;
    }

    const candidate = await prisma.candidate.create({
      data: {
        batchId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        courseName: courseName ? courseName.trim() : batch.courseName,
      },
      include: {
        batch: {
          select: {
            batchNumber: true,
            courseName: true,
          },
        },
      },
    });

    // Update candidate count
    const totalCount = await prisma.candidate.count({ where: { batchId } });
    await prisma.batch.update({
      where: { id: batchId },
      data: { candidateCount: totalCount },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CANDIDATE_REGISTERED',
        entityType: 'CANDIDATE',
        entityId: candidate.id,
        metadata: {
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          batchNumber: batch.batchNumber,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      candidate,
    });
  }
}
