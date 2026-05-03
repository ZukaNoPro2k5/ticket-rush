import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import redis from '../../config/redis';
import { AppError } from '../../shared/AppError';
import { queueGrantedTotal, queueWaitingGauge } from '../../config/metrics';

// Virtual queue using Redis sorted sets:
//   queue:event:<id>          ZSET — score = enqueue timestamp (ms), member = userId
//   queue:granted:<eventId>:<userId>  STRING — TTL marker, presence = user has access
//
// Lifecycle:
//   1. User hits POST /api/queue/:eventId/enter → ZADD with NX (idempotent re-entry)
//   2. Cron worker every 5s reads top N from ZSET, sets granted:* keys (TTL 5m),
//      removes those userIds from queue
//   3. While grant is active, user can call POST /api/bookings (middleware checks key)
//   4. When user finishes booking (or grant expires), key disappears

const QUEUE_KEY = (eventId: number) => `queue:event:${eventId}`;
const GRANT_KEY = (eventId: number, userId: number) => `queue:granted:${eventId}:${userId}`;

export const GRANT_TTL_SEC = 300;     // 5-minute window to enter seats + create booking
export const BATCH_SIZE = 20;          // grant 20 users per cron tick
export const TICK_INTERVAL_SEC = 5;    // cron tick

export interface QueueStatus {
  enabled: boolean;
  position: number;       // 1-based; 0 = not in queue; -1 = granted
  ahead: number;          // users ahead of you (position - 1)
  totalWaiting: number;
  granted: boolean;
  estimatedWaitSec: number;
}

async function isQueueEnabled(eventId: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT queue_enabled FROM events WHERE id = ?',
    [eventId],
  );
  if (rows.length === 0) throw AppError.notFound('Sự kiện không tồn tại');
  return Boolean(rows[0].queue_enabled);
}

export async function enterQueue(eventId: number, userId: number): Promise<QueueStatus> {
  const enabled = await isQueueEnabled(eventId);
  if (!enabled) {
    // Bypass: instant grant so caller can proceed normally
    await redis.set(GRANT_KEY(eventId, userId), '1', 'EX', GRANT_TTL_SEC);
    return {
      enabled: false, position: -1, ahead: 0, totalWaiting: 0,
      granted: true, estimatedWaitSec: 0,
    };
  }

  // Already granted? short-circuit.
  if (await redis.exists(GRANT_KEY(eventId, userId))) {
    return getStatus(eventId, userId);
  }

  // ZADD NX — idempotent: keeps original timestamp if user re-enters
  await redis.zadd(QUEUE_KEY(eventId), 'NX', Date.now(), String(userId));
  return getStatus(eventId, userId);
}

export async function getStatus(eventId: number, userId: number): Promise<QueueStatus> {
  const enabled = await isQueueEnabled(eventId);
  const granted = (await redis.exists(GRANT_KEY(eventId, userId))) === 1;

  if (!enabled || granted) {
    return { enabled, position: -1, ahead: 0, totalWaiting: 0, granted: true, estimatedWaitSec: 0 };
  }

  const [rank, totalWaiting] = await Promise.all([
    redis.zrank(QUEUE_KEY(eventId), String(userId)),
    redis.zcard(QUEUE_KEY(eventId)),
  ]);

  if (rank === null) {
    return { enabled: true, position: 0, ahead: 0, totalWaiting, granted: false, estimatedWaitSec: 0 };
  }

  const position = rank + 1;
  const ahead = rank;
  // Naive estimate: ahead / batch * tick
  const estimatedWaitSec = Math.ceil(ahead / BATCH_SIZE) * TICK_INTERVAL_SEC;

  return { enabled: true, position, ahead, totalWaiting, granted: false, estimatedWaitSec };
}

export async function leaveQueue(eventId: number, userId: number): Promise<void> {
  await redis.zrem(QUEUE_KEY(eventId), String(userId));
}

/**
 * Cron tick: for each event with queue_enabled, take top BATCH_SIZE users
 * from the queue and mark them granted.
 */
export async function processQueueTick(): Promise<void> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM events WHERE queue_enabled = TRUE AND status = "published"',
  );
  if (rows.length === 0) return;

  for (const row of rows) {
    const eventId = row.id as number;
    const top = await redis.zrange(QUEUE_KEY(eventId), 0, BATCH_SIZE - 1);
    if (top.length === 0) {
      queueWaitingGauge.set({ event_id: String(eventId) }, 0);
      continue;
    }

    const pipeline = redis.pipeline();
    for (const userId of top) {
      pipeline.set(GRANT_KEY(eventId, Number(userId)), '1', 'EX', GRANT_TTL_SEC);
      pipeline.zrem(QUEUE_KEY(eventId), userId);
    }
    await pipeline.exec();
    queueGrantedTotal.inc(top.length);
    const remaining = await redis.zcard(QUEUE_KEY(eventId));
    queueWaitingGauge.set({ event_id: String(eventId) }, remaining);
    console.log(`[Queue] Granted ${top.length} user(s) for event ${eventId}`);
  }
}

export async function hasGrant(eventId: number, userId: number): Promise<boolean> {
  return (await redis.exists(GRANT_KEY(eventId, userId))) === 1;
}

export async function consumeGrant(eventId: number, userId: number): Promise<void> {
  await redis.del(GRANT_KEY(eventId, userId));
}
