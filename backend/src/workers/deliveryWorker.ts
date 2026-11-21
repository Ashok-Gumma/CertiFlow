import { prisma } from '../utils/prisma';
import { WhatsAppService } from '../services/whatsappService';
import { eventBus } from '../events/eventBus';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function processWhatsAppDelivery(data: {
  deliveryId: string;
  certificateId: string;
  phone: string;
  candidateName: string;
  certificateNumber: string;
}): Promise<void> {
  const { deliveryId, certificateId, phone, candidateName, certificateNumber } = data;

  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
  });

  if (!delivery) {
    logger.warn(`[Delivery Worker] Delivery record ${deliveryId} not found.`);
    return;
  }

  // Idempotency: Do not deliver twice!
  if (delivery.status === 'DELIVERED') {
    logger.info(`[Delivery Worker] Delivery for certificate ${certificateNumber} is already DELIVERED. Skipping.`);
    return;
  }

  const newAttempts = delivery.attempts + 1;

  await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      status: 'PROCESSING',
      attempts: newAttempts,
    },
  });

  const pdfDownloadUrl = `${config.backendUrl}/api/certificates/${certificateId}/download`;
  const verificationUrl = `${config.frontendUrl}/verify/${certificateNumber}`;

  const result = await WhatsAppService.sendMessage({
    phoneNumber: phone,
    candidateName,
    certificateNumber,
    pdfDownloadUrl,
    verificationUrl,
  });

  if (result.success) {
    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        lastError: null,
      },
    });

    eventBus.broadcast('DELIVERY_UPDATED', {
      deliveryId,
      certificateNumber,
      status: 'DELIVERED',
      deliveredAt: updated.deliveredAt,
    });
  } else {
    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'FAILED',
        lastError: result.error || 'Unknown delivery failure',
      },
    });

    eventBus.broadcast('DELIVERY_UPDATED', {
      deliveryId,
      certificateNumber,
      status: 'FAILED',
      attempts: newAttempts,
      error: updated.lastError,
    });
  }
}
