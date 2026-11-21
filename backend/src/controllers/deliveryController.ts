import { Request, Response } from 'express';
import { DeliveryStatus, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { enqueueWhatsAppDelivery } from '../queues';
import { logger } from '../utils/logger';

export class DeliveryController {
  public static async getDeliveries(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { status, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Role-based scoping: each officer only sees dispatches within their authority
    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId) {
      where.certificate = { batch: { trainingCentreId: user.trainingCentreId } };
    } else if (user.role === Role.DISTRICT_OFFICER && user.districtId) {
      where.certificate = { batch: { districtId: user.districtId } };
    }

    if (status && status !== 'ALL') {
      where.status = status as DeliveryStatus;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { phone: { contains: q, mode: 'insensitive' } },
        { certificate: { certificateNumber: { contains: q, mode: 'insensitive' } } },
        { certificate: { candidate: { name: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const [total, deliveries, counts] = await Promise.all([
      prisma.delivery.count({ where }),
      prisma.delivery.findMany({
        where,
        include: {
          certificate: {
            include: {
              candidate: true,
              batch: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.delivery.groupBy({
        by: ['status'],
        where: where.certificate ? { certificate: where.certificate } : undefined,
        _count: { status: true },
      }),
    ]);

    const stats = {
      total: 0,
      delivered: 0,
      pending: 0,
      processing: 0,
      failed: 0,
      successRate: 0,
    };

    counts.forEach((c) => {
      stats.total += c._count.status;
      if (c.status === 'DELIVERED') stats.delivered = c._count.status;
      if (c.status === 'PENDING') stats.pending = c._count.status;
      if (c.status === 'PROCESSING') stats.processing = c._count.status;
      if (c.status === 'FAILED') stats.failed = c._count.status;
    });

    const finished = stats.delivered + stats.failed;
    stats.successRate = finished > 0 ? Math.round((stats.delivered / finished) * 100) : 100;

    res.json({
      success: true,
      stats,
      data: deliveries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  public static async retryFailed(req: Request, res: Response): Promise<void> {
    const failedDeliveries = await prisma.delivery.findMany({
      where: { status: DeliveryStatus.FAILED },
      include: {
        certificate: {
          include: {
            candidate: true,
          },
        },
      },
      take: 50,
    });

    if (failedDeliveries.length === 0) {
      res.json({
        success: true,
        message: 'No failed deliveries found to retry.',
        retriedCount: 0,
      });
      return;
    }

    let retriedCount = 0;
    for (const d of failedDeliveries) {
      // Re-queue
      await enqueueWhatsAppDelivery({
        deliveryId: d.id,
        certificateId: d.certificateId,
        phone: d.phone,
        candidateName: d.certificate.candidate.name,
        certificateNumber: d.certificate.certificateNumber,
      });
      retriedCount++;
    }

    logger.info(`Re-enqueued ${retriedCount} failed WhatsApp deliveries for retry.`);

    res.json({
      success: true,
      message: `Enqueued ${retriedCount} failed deliveries for retry.`,
      retriedCount,
    });
  }
}
