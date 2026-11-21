import { Worker } from 'bullmq';
import { redisClient, isRedisAvailable } from '../queues';
import { processCertificateGeneration } from './certificateWorker';
import { processWhatsAppDelivery } from './deliveryWorker';
import { logger } from '../utils/logger';

export function startWorkers(): void {
  if (!isRedisAvailable || !redisClient) {
    logger.info('[Workers] Redis not active. Workers running in in-process event-driven mode.');
    return;
  }

  try {
    const certWorker = new Worker(
      'certificate-generation',
      async (job) => {
        logger.info(`[BullMQ Worker] Processing certificate generation job: ${job.id}`);
        await processCertificateGeneration(job.data);
      },
      { connection: redisClient, concurrency: 5 }
    );

    certWorker.on('completed', (job) => {
      logger.info(`[BullMQ Worker] Certificate generation completed: ${job.id}`);
    });

    certWorker.on('failed', (job, err) => {
      logger.error(`[BullMQ Worker] Certificate generation failed: ${job?.id}: ${err.message}`);
    });

    const deliveryWorker = new Worker(
      'whatsapp-delivery',
      async (job) => {
        logger.info(`[BullMQ Worker] Processing delivery job: ${job.id}`);
        await processWhatsAppDelivery(job.data);
      },
      { connection: redisClient, concurrency: 10 }
    );

    deliveryWorker.on('completed', (job) => {
      logger.info(`[BullMQ Worker] Delivery completed: ${job.id}`);
    });

    deliveryWorker.on('failed', (job, err) => {
      logger.error(`[BullMQ Worker] Delivery failed: ${job?.id}: ${err.message}`);
    });

    logger.info('[BullMQ Workers] Successfully initialized distributed BullMQ workers.');
  } catch (err: any) {
    logger.error(`[BullMQ Workers] Error starting workers: ${err.message}`);
  }
}

// If executed directly as standalone process
if (require.main === module) {
  logger.info('[Worker Process] Launching dedicated background worker service...');
  startWorkers();
}
