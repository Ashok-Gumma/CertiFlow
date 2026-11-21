import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(`[Unhandled Error] ${req.method} ${req.url} - ${err.message}`, err.stack);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
