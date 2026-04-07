import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/AppError';
import { sendError } from '../shared/response';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message);
  }

  console.error('❌ Unexpected error:', err);

  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
