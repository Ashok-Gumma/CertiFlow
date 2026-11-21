import { Request, Response } from 'express';
import { BatchStatus, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { config } from '../config';

export class DashboardController {
  public static async getStats(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const batchWhere: any = {};

    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId) {
      batchWhere.trainingCentreId = user.trainingCentreId;
    } else if (user.role === Role.DISTRICT_OFFICER && user.districtId) {
      batchWhere.districtId = user.districtId;
    }

    const [
      totalBatches,
      pendingBatches,
      approvedBatches,
      totalCertificates,
      totalDeliveries,
      successfulDeliveries,
      recentBatches,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.batch.count({ where: batchWhere }),
      prisma.batch.count({
        where: {
          ...batchWhere,
          status: {
            in: [
              BatchStatus.SUBMITTED,
              BatchStatus.DISTRICT_REVIEW,
              BatchStatus.QUALITY_REVIEW,
              BatchStatus.STATE_REVIEW,
            ],
          },
        },
      }),
      prisma.batch.count({
        where: {
          ...batchWhere,
          status: BatchStatus.APPROVED,
        },
      }),
      prisma.certificate.count({
        where: {
          status: 'VALID',
          ...(user.role === Role.TRAINING_CENTRE && user.trainingCentreId
            ? { batch: { trainingCentreId: user.trainingCentreId } }
            : user.role === Role.DISTRICT_OFFICER && user.districtId
            ? { batch: { districtId: user.districtId } }
            : {}),
        },
      }),
      prisma.delivery.count({
        where: user.role === Role.TRAINING_CENTRE && user.trainingCentreId
          ? { certificate: { batch: { trainingCentreId: user.trainingCentreId } } }
          : user.role === Role.DISTRICT_OFFICER && user.districtId
          ? { certificate: { batch: { districtId: user.districtId } } }
          : undefined,
      }),
      prisma.delivery.count({
        where: {
          status: 'DELIVERED',
          ...(user.role === Role.TRAINING_CENTRE && user.trainingCentreId
            ? { certificate: { batch: { trainingCentreId: user.trainingCentreId } } }
            : user.role === Role.DISTRICT_OFFICER && user.districtId
            ? { certificate: { batch: { districtId: user.districtId } } }
            : {}),
        },
      }),
      prisma.batch.findMany({
        where: batchWhere,
        include: {
          trainingCentre: { select: { name: true } },
          district: { select: { name: true } },
          approvals: {
            include: { officer: { select: { name: true, role: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.auditLog.findMany({
        include: {
          actor: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const deliverySuccessRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 100;

    res.json({
      success: true,
      stats: {
        totalBatches,
        pendingApprovals: pendingBatches,
        certificatesIssued: totalCertificates,
        deliverySuccessRate,
      },
      recentBatches,
      recentActivity: recentAuditLogs,
    });
  }

  public static async getStuckBatches(req: Request, res: Response): Promise<void> {
    const thresholdHours = config.overdueBatchHours || 24;
    const cutoffDate = new Date(Date.now() - thresholdHours * 3600 * 1000);

    const overdueBatches = await prisma.batch.findMany({
      where: {
        status: {
          in: [
            BatchStatus.SUBMITTED,
            BatchStatus.DISTRICT_REVIEW,
            BatchStatus.QUALITY_REVIEW,
            BatchStatus.STATE_REVIEW,
          ],
        },
        updatedAt: {
          lt: cutoffDate,
        },
      },
      include: {
        trainingCentre: { select: { name: true } },
        district: { select: { name: true } },
        approvals: {
          include: { officer: { select: { name: true, role: true } } },
        },
      },
      orderBy: { updatedAt: 'asc' },
    });

    const enriched = overdueBatches.map((b) => {
      const waitHours = Math.round((Date.now() - new Date(b.updatedAt).getTime()) / (3600 * 1000));
      return {
        ...b,
        hoursWaiting: waitHours,
        isOverdue: true,
        thresholdHours,
      };
    });

    res.json({
      success: true,
      thresholdHours,
      count: enriched.length,
      stuckBatches: enriched,
    });
  }
}
