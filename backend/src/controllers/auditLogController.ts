import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class AuditLogController {
  public static async getLogs(req: Request, res: Response): Promise<void> {
    const { action, entityType, search, startDate, endDate, format, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action && action !== 'ALL') {
      where.action = String(action);
    }
    if (entityType && entityType !== 'ALL') {
      where.entityType = String(entityType);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { entityId: { contains: q, mode: 'insensitive' } },
        { actor: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (format === 'csv') {
      const allLogs = await prisma.auditLog.findMany({
        where,
        include: { actor: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      });

      const headers = 'ID,Timestamp,Actor Name,Actor Email,Actor Role,Action,Entity Type,Entity ID,Metadata\n';
      const rows = allLogs
        .map((l) =>
          [
            l.id,
            l.createdAt.toISOString(),
            `"${l.actor?.name || 'System Worker'}"`,
            `"${l.actor?.email || 'system@certiflow'}"`,
            `"${l.actor?.role || 'SYSTEM'}"`,
            `"${l.action}"`,
            `"${l.entityType}"`,
            `"${l.entityId}"`,
            `"${JSON.stringify(l.metadata || {}).replace(/"/g, '""')}"`,
          ].join(',')
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="certiflow_audit_logs.csv"');
      res.send(headers + rows);
      return;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }
}
