import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword2026@localhost:5432/certiflow?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'certiflow_super_secret_production_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  whatsapp: {
    failureRate: parseFloat(process.env.WHATSAPP_FAILURE_RATE || '0.1'),
    timeoutRate: parseFloat(process.env.WHATSAPP_TIMEOUT_RATE || '0.05'),
    maxRetries: parseInt(process.env.MAX_DELIVERY_RETRIES || '3', 10),
  },
  overdueBatchHours: parseInt(process.env.OVERDUE_BATCH_HOURS || '24', 10),
};
