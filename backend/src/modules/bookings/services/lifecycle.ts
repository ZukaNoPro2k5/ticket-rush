import { Prisma } from '@prisma/client';
import prisma from '../../../config/prisma';
import { AppError } from '../../../shared/AppError';
import { bookingsConfirmedTotal } from '../../../config/metrics';
import { getBookingRules } from '../../../config/runtimeSettings';
import { applyPromoCode, lockAndValidateSeats, updateSeatsStatus } from './helpers';

type LockedBooking = {
  id: number;
  user_id: number;
  event_id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  expires_at: Date;
  promo_code_id: number | null;
  total_amount?: { toNumber(): number } | number;
};

async function getLockedBooking(tx: Prisma.TransactionClient, bookingId: number) {
  const rows = await tx.$queryRaw<LockedBooking[]>`
    SELECT id, user_id, event_id, status, expires_at, promo_code_id, total_amount
    FROM bookings WHERE id = ${bookingId} FOR UPDATE
  `;
  if (!rows[0]) throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
  return rows[0];
}

function assertEditable(booking: LockedBooking, userId: number, action: string) {
  if (booking.user_id !== userId) throw AppError.forbidden(`Bạn không có quyền ${action} đơn này`);
  if (booking.status !== 'pending') {
    throw AppError.conflict('Chỉ có thể chỉnh đơn đang chờ thanh toán', 'BOOKING_NOT_EDITABLE');
  }
  if (new Date(booking.expires_at) < new Date()) throw AppError.badRequest('Đơn đã hết hạn. Vui lòng đặt lại', 'BOOKING_EXPIRED');
}

async function decrementPromo(tx: Prisma.TransactionClient, promoCodeId: number | null) {
  if (!promoCodeId) return;
  const promo = await tx.promo_codes.findUnique({ where: { id: promoCodeId }, select: { used_count: true } });
  await tx.promo_codes.update({
    where: { id: promoCodeId },
    data: { used_count: Math.max(0, (promo?.used_count ?? 0) - 1) },
  });
}

export async function replaceBookingSeats(bookingId: number, userId: number, nextSeatIds: number[]) {
  const rules = await getBookingRules();
  if (nextSeatIds.length > rules.maxTicketsPerBooking) {
    throw AppError.badRequest(`Tối đa ${rules.maxTicketsPerBooking} vé cho mỗi giao dịch`, 'MAX_TICKETS_PER_BOOKING');
  }
  return prisma.$transaction(async (tx) => {
    const booking = await getLockedBooking(tx, bookingId);
    assertEditable(booking, userId, 'chỉnh ghế của');
    const currentRows = await tx.booking_seats.findMany({ where: { booking_id: bookingId }, select: { seat_id: true } });
    const currentSeatIds = currentRows.map((row) => row.seat_id);
    const current = new Set(currentSeatIds);
    const next = new Set(nextSeatIds);
    const addedSeatIds = nextSeatIds.filter((id) => !current.has(id));
    const removedSeatIds = currentSeatIds.filter((id) => !next.has(id));
    if (addedSeatIds.length) {
      const seats = await lockAndValidateSeats(tx, addedSeatIds, booking.event_id);
      await tx.booking_seats.createMany({ data: seats.map((seat) => ({ booking_id: bookingId, seat_id: seat.id, price: seat.price })) });
      await updateSeatsStatus(tx, addedSeatIds, 'locked', userId);
    }
    if (removedSeatIds.length) {
      await tx.booking_seats.deleteMany({ where: { booking_id: bookingId, seat_id: { in: removedSeatIds } } });
      await updateSeatsStatus(tx, removedSeatIds, 'available');
    }
    await decrementPromo(tx, booking.promo_code_id);
    const subtotal = await tx.booking_seats.aggregate({ where: { booking_id: bookingId }, _sum: { price: true } });
    await tx.bookings.update({
      where: { id: bookingId },
      data: {
        promo_code_id: null,
        discount_amount: 0,
        total_amount: subtotal._sum.price ?? 0,
      },
    });
    return { bookingId, eventId: booking.event_id, seatIds: nextSeatIds, addedSeatIds, removedSeatIds };
  });
}

export async function applyBookingPromo(bookingId: number, userId: number, code: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await getLockedBooking(tx, bookingId);
    assertEditable(booking, userId, 'áp mã cho');
    const subtotalResult = await tx.booking_seats.aggregate({ where: { booking_id: bookingId }, _sum: { price: true } });
    const subtotal = Number(subtotalResult._sum.price ?? 0);
    await decrementPromo(tx, booking.promo_code_id);
    const { promoCodeId, discountAmount } = await applyPromoCode(tx, code, booking.event_id, subtotal);
    await tx.bookings.update({
      where: { id: bookingId },
      data: { promo_code_id: promoCodeId, discount_amount: discountAmount, total_amount: subtotal - discountAmount },
    });
    return { bookingId };
  });
}

export async function confirmBooking(bookingId: number, userId: number, paymentMethod: string) {
  let didConfirm = false;
  const result = await prisma.$transaction(async (tx) => {
    const booking = await getLockedBooking(tx, bookingId);
    if (booking.user_id !== userId) throw AppError.forbidden('Bạn không có quyền xác nhận đơn này');
    if (booking.status === 'cancelled') throw AppError.conflict('Đơn đã bị hủy', 'BOOKING_NOT_CANCELLABLE');
    if (booking.status !== 'confirmed' && new Date(booking.expires_at) < new Date()) {
      throw AppError.badRequest('Đơn đã hết hạn. Vui lòng đặt lại', 'BOOKING_EXPIRED');
    }
    const method = await tx.payment_gateways.findFirst({ where: { id: paymentMethod, enabled: true }, select: { id: true } });
    if (!method) throw AppError.badRequest('Phương thức thanh toán không khả dụng', 'PAYMENT_METHOD_UNAVAILABLE');
    const seatRows = await tx.booking_seats.findMany({ where: { booking_id: bookingId }, select: { seat_id: true } });
    const seatIds = seatRows.map((row) => row.seat_id);
    if (booking.status !== 'confirmed') {
      await tx.payments.upsert({
        where: { booking_id: bookingId },
        update: {
          payment_method: paymentMethod,
          amount: Number(booking.total_amount),
          status: 'succeeded',
          provider_reference: `sandbox_${bookingId}_${Date.now()}`,
          paid_at: new Date(),
        },
        create: {
          booking_id: bookingId,
          payment_method: paymentMethod,
          amount: Number(booking.total_amount),
          status: 'succeeded',
          provider_reference: `sandbox_${bookingId}_${Date.now()}`,
          paid_at: new Date(),
        },
      });
      await tx.bookings.update({ where: { id: bookingId }, data: { status: 'confirmed', confirmed_at: new Date() } });
      await updateSeatsStatus(tx, seatIds, 'sold');
      didConfirm = true;
    }
    return { bookingId, seatIds };
  });
  if (didConfirm) bookingsConfirmedTotal.inc();
  return result;
}

export async function cancelBooking(bookingId: number, userId: number, isAdmin = false) {
  return prisma.$transaction(async (tx) => {
    const booking = await getLockedBooking(tx, bookingId);
    if (!isAdmin && booking.user_id !== userId) throw AppError.forbidden('Bạn không có quyền hủy đơn này');
    if (booking.status !== 'pending') throw AppError.conflict('Chỉ có thể hủy đơn đang chờ xác nhận', 'BOOKING_NOT_CANCELLABLE');
    await tx.bookings.update({ where: { id: bookingId }, data: { status: 'cancelled' } });
    const seatRows = await tx.booking_seats.findMany({ where: { booking_id: bookingId }, select: { seat_id: true } });
    const seatIds = seatRows.map((row) => row.seat_id);
    await updateSeatsStatus(tx, seatIds, 'available');
    await decrementPromo(tx, booking.promo_code_id);
    return { bookingId, seatIds };
  });
}
