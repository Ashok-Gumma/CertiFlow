import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redisClient: IORedis | null = null;
let isRedisAvailable = false;

try {
  redisClient = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn('[Redis] Redis not reachable, falling back to direct asynchronous task runner.');
        return null; // stop retrying
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    logger.info('[Redis] Successfully connected to Redis.');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    logger.warn(`[Redis] Connection warning: ${err.message}`);
  });
} catch (e: any) {
  logger.warn(`[Redis] Initialization warning: ${e.message}`);
}

export { isRedisAvailable, redisClient };

// BullMQ Queues
export const certificateQueue = redisClient && isRedisAvailable
  ? new Queue('certificate-generation', { connection: redisClient })
  : null;

export const deliveryQueue = redisClient && isRedisAvailable
  ? new Queue('whatsapp-delivery', { connection: redisClient })
  : null;

/**
 * Dispatch certificate generation job
 */
export async function enqueueCertificateGeneration(data: {
  batchId: string;
  courseCode: string;
}): Promise<void> {
  if (certificateQueue) {
    try {
      await certificateQueue.add('generate-certificates', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      });
      logger.info(`[BullMQ] Enqueued certificate generation for batch ${data.batchId}`);
      return;
    } catch (err: any) {
      logger.warn(`[BullMQ] Failed to enqueue to Redis, executing directly: ${err.message}`);
    }
  }

  // Resilient fallback: direct asynchronous processing
  setImmediate(async () => {
    try {
      const { processCertificateGeneration } = await import('../workers/certificateWorker');
      await processCertificateGeneration(data);
    } catch (e: any) {
      logger.error(`[Queue Fallback] Error running certificate worker directly: ${e.message}`);
    }
  });
}

/**
 * Dispatch WhatsApp delivery job
 */
export async function enqueueWhatsAppDelivery(data: {
  deliveryId: string;
  certificateId: string;
  phone: string;
  candidateName: string;
  certificateNumber: string;
}): Promise<void> {
  if (deliveryQueue) {
    try {
      await deliveryQueue.add('send-whatsapp', data, {
        attempts: config.whatsapp.maxRetries,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      });
      logger.info(`[BullMQ] Enqueued WhatsApp delivery for certificate ${data.certificateNumber}`);
      return;
    } catch (err: any) {
      logger.warn(`[BullMQ] Failed to enqueue to Redis, executing directly: ${err.message}`);
    }
  }

  // Resilient fallback: direct asynchronous processing
  setImmediate(async () => {
    try {
      const { processWhatsAppDelivery } = await import('../workers/deliveryWorker');
      await processWhatsAppDelivery(data);
    } catch (e: any) {
      logger.error(`[Queue Fallback] Error running delivery worker directly: ${e.message}`);
    }
  });
}
