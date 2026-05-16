import cron from 'node-cron';
import pool from './config/database';
import { RowDataPacket } from 'mysql2';
import { getIO } from './config/socket';
import * as seatsService from './modules/seats/service';

/**
 * Release expired bookings: pending bookings past expires_at
 * → cancel booking, release locked seats, restore promo used_count
 */
async function releaseExpiredBookings() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Find expired pending bookings
    const [expiredRows] = await conn.execute<RowDataPacket[]>(
      `SELECT b.id, b.user_id, b.event_id, b.promo_code_id
       FROM bookings b
       WHERE b.status = 'pending' AND b.expires_at < NOW()`,
    );

    if (expiredRows.length === 0) {
      await conn.rollback();
      return;
    }

    const io = getIO();

    for (const booking of expiredRows) {
      // Get booked seat IDs
      const [seatRows] = await conn.execute<RowDataPacket[]>(
        'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
        [booking.id],
      );
      const seatIds = seatRows.map((r: RowDataPacket) => r.seat_id as number);

      // Release seats
      if (seatIds.length > 0) {
        const placeholders = seatIds.map(() => '?').join(', ');
        const [lockedRows] = await conn.execute<RowDataPacket[]>(
          `SELECT id FROM seats
           WHERE id IN (${placeholders}) AND status = 'locked' AND locked_by = ?`,
          [...seatIds, booking.user_id],
        );
        const releasableSeatIds = lockedRows.map((r: RowDataPacket) => r.id as number);

        if (releasableSeatIds.length > 0) {
          const releasablePlaceholders = releasableSeatIds.map(() => '?').join(', ');
          await conn.execute(
            `UPDATE seats SET status = 'available', locked_by = NULL, locked_at = NULL
             WHERE id IN (${releasablePlaceholders}) AND locked_by = ?`,
            [...releasableSeatIds, booking.user_id],
          );

          // Broadcast seat release
          io.to(`event:${booking.event_id}`).emit('seat:status_changed',
            releasableSeatIds.map((id: number) => ({ seat_id: id, status: 'available' })),
          );
        }
      }

      // Restore promo used_count
      if (booking.promo_code_id) {
        await conn.execute(
          'UPDATE promo_codes SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?',
          [booking.promo_code_id],
        );
      }

      // Mark booking as cancelled
      await conn.execute(
        `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
        [booking.id],
      );
    }

    await conn.commit();
    console.log(`[Cron] Released ${expiredRows.length} expired booking(s)`);
  } catch (err) {
    await conn.rollback();
    console.error('[Cron] Error releasing expired bookings:', err);
  } finally {
    conn.release();
  }
}

/**
 * Release expired locked seats (safety net)
 */
async function releaseLockedSeats() {
  try {
    const released = await seatsService.releaseExpiredSeats();
    if (released.length > 0) {
      console.log(`[Cron] Released ${released.length} expired locked seat(s)`);
    }
  } catch (err) {
    console.error('[Cron] Error releasing expired seats:', err);
  }
}

export function startCronJobs() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    await releaseExpiredBookings();
    await releaseLockedSeats();
  });

  console.log('⏰ Cron jobs started (every minute)');
}
