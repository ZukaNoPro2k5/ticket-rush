import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import { AppError } from '../shared/AppError';

/**
 * Stripe-style idempotency for POST mutations.
 *
 * Client sends header  Idempotency-Key: <uuid>
 *   1st request → process normally, after success cache (statusCode + body)
 *                 in Redis under key idem:<userId>:<key> for 1 hour.
 *   2nd request → return cached response without re-executing handler.
 *
 * Concurrent duplicates (same key arriving while 1st still in-flight) get a
 * 409 IDEMPOTENCY_IN_PROGRESS so they don't double-book.
 */

const IDEM_TTL_SEC = 3600;
const PROCESSING_MARKER = '__processing__';

interface CachedResponse {
  status: number;
  body: unknown;
}

export function idempotency(scope: string) {
  return async function idempotencyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const key = req.header('Idempotency-Key');
    if (!key) return next();

    if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
      return next(AppError.badRequest('Idempotency-Key không hợp lệ', 'INVALID_IDEM_KEY'));
    }

    const userId = req.user?.userId ?? 'anon';
    const redisKey = `idem:${scope}:${userId}:${key}`;

    // Try to claim the slot atomically. SET NX = "only if not exists".
    const claimed = await redis.set(redisKey, PROCESSING_MARKER, 'EX', IDEM_TTL_SEC, 'NX');

    if (claimed !== 'OK') {
      const cached = await redis.get(redisKey);
      if (cached === PROCESSING_MARKER) {
        return next(
          new AppError(
            'Yêu cầu trùng lặp đang được xử lý, vui lòng đợi',
            409,
            'IDEMPOTENCY_IN_PROGRESS',
          ),
        );
      }
      try {
        const parsed: CachedResponse = JSON.parse(cached!);
        res.status(parsed.status).json(parsed.body);
        return;
      } catch {
        // Corrupted cache — bypass and re-execute
      }
    }

    // Hijack res.json to capture the response, then store it.
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      const status = res.statusCode;
      // Only cache 2xx — errors should be retryable
      if (status >= 200 && status < 300) {
        const payload: CachedResponse = { status, body };
        redis.set(redisKey, JSON.stringify(payload), 'EX', IDEM_TTL_SEC).catch(() => {
          /* best effort */
        });
      } else {
        // Release the slot so client can retry with same key
        redis.del(redisKey).catch(() => { /* best effort */ });
      }
      return originalJson(body);
    };

    next();
  };
}
