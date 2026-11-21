import { Request, Response } from 'express';
import { CertificateStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class PublicVerificationController {
  public static async verify(req: Request, res: Response): Promise<void> {
    const { certificateId } = req.params;

    if (!certificateId) {
      res.status(400).json({
        success: false,
        status: 'INVALID_REQUEST',
        error: 'Certificate ID parameter is required',
      });
      return;
    }

    // Decode in case of URL encoded slashes
    const decodedId = decodeURIComponent(certificateId).trim();

    // Query official PostgreSQL database directly
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: decodedId },
          { id: decodedId },
        ],
      },
      include: {
        candidate: {
          select: {
            name: true,
            courseName: true,
          },
        },
        batch: {
          select: {
            batchNumber: true,
            courseName: true,
            trainingCentre: {
              select: {
                name: true,
                code: true,
              },
            },
            district: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      res.status(404).json({
        success: false,
        status: 'NOT_FOUND',
        heading: 'Certificate Not Found',
        message: 'No matching certificate exists in the official CertiFlow registry database.',
        searchedId: decodedId,
      });
      return;
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      res.status(200).json({
        success: true,
        status: 'REVOKED',
        heading: 'Certificate Revoked',
        message: 'This certificate was previously issued but has been officially cancelled and revoked by the State Office.',
        certificate: {
          certificateNumber: certificate.certificateNumber,
          candidateName: certificate.candidate.name,
          courseName: certificate.batch.courseName,
          trainingCentre: certificate.batch.trainingCentre.name,
          district: certificate.batch.district.name,
          batchNumber: certificate.batch.batchNumber,
          issueDate: certificate.issueDate,
          status: 'REVOKED',
          revokedAt: certificate.revokedAt,
          revocationReason: certificate.revocationReason || 'Cancelled by administrative order',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: 'VALID',
      heading: 'Certificate Verified',
      message: 'This certificate is authentic and registered in the official CertiFlow registry.',
      certificate: {
        certificateNumber: certificate.certificateNumber,
        candidateName: certificate.candidate.name,
        courseName: certificate.batch.courseName,
        trainingCentre: certificate.batch.trainingCentre.name,
        district: certificate.batch.district.name,
        batchNumber: certificate.batch.batchNumber,
        issueDate: certificate.issueDate,
        status: 'VALID',
      },
    });
  }
}
