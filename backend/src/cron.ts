import cron from 'node-cron';
import prisma from './config/prisma';
import { getIO } from './config/socket';
import * as seatsService from './modules/seats/service';
import { processQueueTick } from './modules/queue/service';
import { completePastPublishedEvents } from './modules/events/service';

async function releaseExpiredBookings() {
  try {
    const released = await prisma.$transaction(async (tx) => {
      const expired = await tx.$queryRaw<Array<{ id: number; event_id: number; promo_code_id: number | null }>>`
        SELECT id, event_id, promo_code_id
        FROM bookings
        WHERE status = 'pending' AND expires_at < NOW()
        FOR UPDATE
      `;
      if (expired.length === 0) return [];

      const io = getIO();
      for (const booking of expired) {
        const seatRows = await tx.booking_seats.findMany({
          where: { booking_id: booking.id },
          select: { seat_id: true },
        });
        const seatIds = seatRows.map((row) => row.seat_id);
        if (seatIds.length) {
          await tx.seats.updateMany({
            where: { id: { in: seatIds } },
            data: { status: 'available', locked_by: null, locked_at: null },
          });
          io.to(`event:${booking.event_id}`).emit(
            'seat:status_changed',
            seatIds.map((id) => ({ seat_id: id, status: 'available' })),
          );
        }
        if (booking.promo_code_id) {
          await tx.$executeRaw`
            UPDATE promo_codes
            SET used_count = GREATEST(used_count - 1, 0)
            WHERE id = ${booking.promo_code_id}
          `;
        }
        await tx.bookings.update({ where: { id: booking.id }, data: { status: 'cancelled' } });
      }
      return expired;
    });
    if (released.length > 0) console.log(`[Cron] Released ${released.length} expired booking(s)`);
  } catch (err) {
    console.error('[Cron] Error releasing expired bookings:', err);
  }
}

async function releaseLockedSeats() {
  try {
    const released = await seatsService.releaseExpiredSeats();
    if (released.length > 0) console.log(`[Cron] Released ${released.length} expired locked seat(s)`);
  } catch (err) {
    console.error('[Cron] Error releasing expired seats:', err);
  }
}

async function completePastEvents() {
  try {
    const completed = await completePastPublishedEvents();
    if (completed.length > 0) console.log(`[Cron] Completed ${completed.length} past event(s)`);
  } catch (err) {
    console.error('[Cron] Error completing past events:', err);
  }
}

export function startCronJobs() {
  cron.schedule('* * * * *', async () => {
    await releaseExpiredBookings();
    await releaseLockedSeats();
    await completePastEvents();
  });
  cron.schedule('*/5 * * * * *', async () => {
    try {
      await processQueueTick();
    } catch (err) {
      console.error('[Cron] Queue tick error:', err);
    }
  });
  console.log('⏰ Cron jobs started (every minute + queue every 5s)');
}
