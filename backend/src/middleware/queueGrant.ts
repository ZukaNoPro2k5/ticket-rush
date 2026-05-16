import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { AppError } from '../shared/AppError';
import * as queueService from '../modules/queue/service';

/**
 * For event-bound booking writes: if the target event has queue_enabled, the
 * caller must hold a valid grant token. Admins bypass the queue.
 */
export async function requireQueueGrant(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(AppError.unauthorized());
  if (req.user.role === 'admin') return next();

  const eventId = Number(req.body?.event_id);
  if (!eventId) return next();

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT status, queue_enabled FROM events WHERE id = ?',
    [eventId],
  );
  if (rows.length === 0) return next(AppError.notFound('Su kien khong ton tai', 'EVENT_NOT_FOUND'));
  if (rows[0].status !== 'published') {
    return next(AppError.conflict('Su kien chua mo ban hoac da ket thuc', 'EVENT_NOT_BOOKABLE'));
  }
  if (!rows[0].queue_enabled) return next();

  const granted = await queueService.hasGrant(eventId, req.user.userId);
  if (!granted) {
    return next(
      AppError.forbidden(
        'Ban can vao phong cho truoc khi dat ve su kien nay',
        'QUEUE_REQUIRED',
      ),
    );
  }

  next();
}
