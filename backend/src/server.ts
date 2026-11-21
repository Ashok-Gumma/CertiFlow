import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { startWorkers } from './workers';
import { logger } from './utils/logger';

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
}));

// Request Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving for generated certificates
app.use('/uploads', express.static(config.uploadDir));

// API Routes
app.use('/api', routes);

// Error Handling Middleware
app.use(errorHandler);

// Start server only if not in test
let server: any = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(Number(config.port), '0.0.0.0', () => {
    logger.info(`====================================================`);
    logger.info(`  CertiFlow Backend Server running on port ${config.port}`);
    logger.info(`  Environment: ${config.nodeEnv}`);
    logger.info(`  API Health: http://localhost:${config.port}/api/health`);
    logger.info(`====================================================`);

    // Initialize background workers
    startWorkers();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server?.close(() => {
      logger.info('HTTP server closed');
    });
  });
}

export default app;
