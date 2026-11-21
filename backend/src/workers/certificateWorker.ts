import { prisma } from '../utils/prisma';
import { PdfService } from '../services/pdfService';
import { generateCertificateId } from '../utils/certificateId';
import { enqueueWhatsAppDelivery } from '../queues';
import { eventBus } from '../events/eventBus';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function processCertificateGeneration(data: {
  batchId: string;
  courseCode: string;
}): Promise<void> {
  const { batchId, courseCode } = data;
  logger.info(`[Worker] Starting certificate generation for batch ${batchId}...`);

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      candidates: {
        include: {
          certificate: true,
        },
      },
      trainingCentre: true,
      district: true,
    },
  });

  if (!batch) {
    logger.error(`[Worker] Batch ${batchId} not found`);
    return;
  }

  let generatedCount = 0;
  const now = new Date();
  const issueDateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  for (let i = 0; i < batch.candidates.length; i++) {
    const candidate = batch.candidates[i];

    // Idempotency: skip if candidate already has a certificate
    if (candidate.certificate) {
      logger.info(`[Worker] Certificate already exists for candidate ${candidate.name} (${candidate.id}), skipping generation.`);
      continue;
    }

    // Generate collision-safe certificate ID
    // Retry if collision occurs
    let certificateNumber = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      certificateNumber = generateCertificateId(courseCode || batch.courseCode);
      const existing = await prisma.certificate.findUnique({
        where: { certificateNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const verificationUrl = `${config.frontendUrl}/verify/${certificateNumber}`;

    try {
      // Generate the institutional PDF
      const { filePath } = await PdfService.generateCertificatePdf({
        certificateNumber,
        candidateName: candidate.name,
        courseName: batch.courseName,
        trainingCentreName: batch.trainingCentre.name,
        batchNumber: batch.batchNumber,
        issueDate: issueDateFormatted,
        verificationUrl,
      });

      // Transaction: create Certificate and Delivery records
      const { cert, delivery } = await prisma.$transaction(async (tx) => {
        const cert = await tx.certificate.create({
          data: {
            candidateId: candidate.id,
            batchId: batch.id,
            certificateNumber,
            filePath,
            status: 'VALID',
          },
        });

        const delivery = await tx.delivery.create({
          data: {
            certificateId: cert.id,
            phone: candidate.phone,
            status: 'PENDING',
          },
        });

        return { cert, delivery };
      });

      generatedCount++;

      // Enqueue WhatsApp delivery
      await enqueueWhatsAppDelivery({
        deliveryId: delivery.id,
        certificateId: cert.id,
        phone: candidate.phone,
        candidateName: candidate.name,
        certificateNumber,
      });

    } catch (err: any) {
      logger.error(`[Worker] Failed generating certificate for candidate ${candidate.name}: ${err.message}`);
    }
  }

  logger.info(`[Worker] Generated ${generatedCount} certificates for batch ${batch.batchNumber}`);

  // Record audit log
  await prisma.auditLog.create({
    data: {
      action: 'CERTIFICATES_GENERATED',
      entityType: 'BATCH',
      entityId: batch.id,
      metadata: {
        batchNumber: batch.batchNumber,
        totalGenerated: generatedCount,
      },
    },
  });

  // Broadcast SSE event
  eventBus.broadcast('CERTIFICATES_GENERATED', {
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    count: generatedCount,
  });
}
