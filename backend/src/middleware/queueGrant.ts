import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../shared/AppError';
import * as queueService from '../modules/queue/service';

/**
 * For event-bound write actions (POST /api/bookings) — if the target event has
 * queue_enabled, the caller must hold a valid grant token. Otherwise the request
 * is rejected with code QUEUE_REQUIRED so the frontend can redirect to /queue.
 *
 * Reads `event_id` from req.body. Skips if user is admin.
 */
export async function requireQueueGrant(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(AppError.unauthorized());
  if (req.user.role === 'admin') return next();

  const eventId = Number(req.body?.event_id);
  if (!eventId) return next();

  const event = await prisma.events.findUnique({ where: { id: eventId }, select: { queue_enabled: true } });
  if (!event) return next(AppError.notFound('Sự kiện không tồn tại'));
  if (!event.queue_enabled) return next();

  const granted = await queueService.hasGrant(eventId, req.user.userId);
  if (!granted) {
    return next(
      AppError.forbidden(
        'Bạn cần vào phòng chờ trước khi đặt vé sự kiện này',
        'QUEUE_REQUIRED',
      ),
    );
  }

  next();
}
