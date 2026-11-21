import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { CertificateStatus, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { PdfService } from '../services/pdfService';
import { eventBus } from '../events/eventBus';
import { config } from '../config';
import { logger } from '../utils/logger';

export class CertificateController {
  public static async getCertificates(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { status, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Role-based scoping: only show certificates in officer's jurisdiction
    if (user.role === Role.TRAINING_CENTRE && user.trainingCentreId) {
      where.batch = { trainingCentreId: user.trainingCentreId };
    } else if (user.role === Role.DISTRICT_OFFICER && user.districtId) {
      where.batch = { districtId: user.districtId };
    }

    if (status && status !== 'ALL') {
      where.status = status as CertificateStatus;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { certificateNumber: { contains: q, mode: 'insensitive' } },
        { candidate: { name: { contains: q, mode: 'insensitive' } } },
        { batch: { courseName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, certificates] = await Promise.all([
      prisma.certificate.count({ where }),
      prisma.certificate.findMany({
        where,
        include: {
          candidate: true,
          batch: {
            include: {
              trainingCentre: true,
              district: true,
            },
          },
          delivery: true,
        },
        orderBy: { issueDate: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: certificates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  public static async getCertificateById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateNumber: id }],
      },
      include: {
        candidate: true,
        batch: {
          include: {
            trainingCentre: true,
            district: true,
          },
        },
        delivery: true,
      },
    });

    if (!certificate) {
      res.status(404).json({ success: false, error: 'Certificate not found' });
      return;
    }

    res.json({
      success: true,
      certificate,
    });
  }

  public static async downloadCertificate(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateNumber: id }],
      },
      include: {
        candidate: true,
        batch: {
          include: {
            trainingCentre: true,
            district: true,
          },
        },
      },
    });

    if (!certificate) {
      res.status(404).json({ success: false, error: 'Certificate not found' });
      return;
    }

    const verificationUrl = `${config.frontendUrl}/verify/${certificate.certificateNumber}`;
    const safeFilename = `${certificate.certificateNumber.replace(/[\/\\?%*:|"<>]/g, '_')}.pdf`;
    let absolutePath = path.resolve(certificate.filePath);

    // If file doesn't exist on disk, regenerate it on the fly!
    if (!fs.existsSync(absolutePath)) {
      logger.info(`PDF file not found at ${absolutePath}, generating now...`);
      const generated = await PdfService.generateCertificatePdf({
        certificateNumber: certificate.certificateNumber,
        candidateName: certificate.candidate.name,
        courseName: certificate.batch.courseName,
        trainingCentreName: certificate.batch.trainingCentre.name,
        batchNumber: certificate.batch.batchNumber,
        issueDate: certificate.issueDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        verificationUrl,
      });
      absolutePath = generated.filePath;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  }

  public static async revokeCertificate(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user!;

    if (user.role !== Role.STATE_OFFICE) {
      res.status(403).json({ success: false, error: 'Only State Office (Farah) can revoke certificates.' });
      return;
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateNumber: id }],
      },
      include: {
        candidate: true,
        batch: true,
      },
    });

    if (!certificate) {
      res.status(404).json({ success: false, error: 'Certificate not found' });
      return;
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      res.status(400).json({ success: false, error: 'This certificate has already been revoked.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const revoked = await tx.certificate.update({
        where: { id: certificate.id },
        data: {
          status: CertificateStatus.REVOKED,
          revokedAt: new Date(),
          revocationReason: reason,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'CERTIFICATE_REVOKED',
          entityType: 'CERTIFICATE',
          entityId: certificate.id,
          metadata: {
            certificateNumber: certificate.certificateNumber,
            candidateName: certificate.candidate.name,
            reason,
            revokedBy: user.name,
          },
        },
      });

      return revoked;
    });

    eventBus.broadcast('CERTIFICATE_REVOKED', {
      certificateId: certificate.id,
      certificateNumber: certificate.certificateNumber,
      candidateName: certificate.candidate.name,
      reason,
      revokedBy: user.name,
      revokedAt: updated.revokedAt,
    });

    res.json({
      success: true,
      message: `Certificate ${certificate.certificateNumber} has been successfully revoked.`,
      certificate: updated,
    });
  }
}
