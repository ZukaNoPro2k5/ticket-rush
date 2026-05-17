import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/response';
import { getIO } from '../../config/socket';
import * as bookingsService from './service';
import * as ticketsService from '../tickets/service';
import * as queueService from '../queue/service';
import { getBookingRules } from '../../config/runtimeSettings';
import type {
  ApplyBookingPromoInput,
  ConfirmBookingInput,
  CreateBookingInput,
  ReplaceBookingSeatsInput,
} from './validation';

export const getRules = asyncHandler(async (_req: Request, res: Response) => {
  const rules = await getBookingRules();
  sendSuccess(res, {
    ticket_hold_minutes: rules.ticketHoldMinutes,
    max_tickets_per_booking: rules.maxTicketsPerBooking,
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingsService.createBooking(req.user!.userId, req.body as CreateBookingInput);
  await queueService.consumeGrant(result.event_id, req.user!.userId);

  // Broadcast seat locked
  const io = getIO();
  io.to(`event:${result.event_id}`).emit('seat:status_changed',
    result.seat_ids.map((id) => ({ seat_id: id, status: 'locked' })),
  );

  sendCreated(res, result, `Đã giữ chỗ. Vui lòng hoàn tất thanh toán trong ${result.hold_minutes} phút`);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const booking = await bookingsService.getBooking(
    Number(req.params.id),
    isAdmin ? undefined : req.user!.userId,
  );
  sendSuccess(res, booking);
});

export const listMy = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query;
  const result = await bookingsService.listMyBookings(
    req.user!.userId,
    status as string | undefined,
    page ? Number(page) : 1,
    limit ? Number(limit) : 10,
  );
  sendSuccess(res, result);
});

export const getPendingForEvent = asyncHandler(async (req: Request, res: Response) => {
  const eventId = Number(req.query.event_id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    sendSuccess(res, null);
    return;
  }
  const booking = await bookingsService.getPendingBookingForEvent(req.user!.userId, eventId);
  sendSuccess(res, booking);
});

export const applyPromo = asyncHandler(async (req: Request, res: Response) => {
  await bookingsService.applyBookingPromo(
    Number(req.params.id),
    req.user!.userId,
    (req.body as ApplyBookingPromoInput).code,
  );
  const booking = await bookingsService.getBooking(Number(req.params.id), req.user!.userId);
  sendSuccess(res, booking, 'Đã áp mã giảm giá');
});

export const replaceSeats = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingsService.replaceBookingSeats(
    Number(req.params.id),
    req.user!.userId,
    (req.body as ReplaceBookingSeatsInput).seat_ids,
  );

  const io = getIO();
  if (result.addedSeatIds.length > 0) {
    io.to(`event:${result.eventId}`).emit(
      'seat:status_changed',
      result.addedSeatIds.map((id) => ({ seat_id: id, status: 'locked' })),
    );
  }
  if (result.removedSeatIds.length > 0) {
    io.to(`event:${result.eventId}`).emit(
      'seat:status_changed',
      result.removedSeatIds.map((id) => ({ seat_id: id, status: 'available' })),
    );
  }

  const booking = await bookingsService.getBooking(Number(req.params.id), req.user!.userId);
  sendSuccess(res, booking, 'Đã cập nhật ghế giữ chỗ');
});

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, seatIds } = await bookingsService.confirmBooking(
    Number(req.params.id),
    req.user!.userId,
    (req.body as ConfirmBookingInput).payment_method,
  );

  // Generate tickets with QR codes
  const tickets = await ticketsService.generateTickets(bookingId);

  // Broadcast seat sold
  const booking = await bookingsService.getBooking(bookingId);
  const io = getIO();
  io.to(`event:${booking.event.id}`).emit('seat:status_changed',
    seatIds.map((id) => ({ seat_id: id, status: 'sold' })),
  );

  sendSuccess(res, { booking_id: bookingId, tickets }, 'Thanh toán thành công! Vé đã được tạo');
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const { seatIds } = await bookingsService.cancelBooking(
    Number(req.params.id),
    req.user!.userId,
    isAdmin,
  );

  // Broadcast seat released
  const booking = await bookingsService.getBooking(Number(req.params.id));
  const io = getIO();
  io.to(`event:${booking.event.id}`).emit('seat:status_changed',
    seatIds.map((id) => ({ seat_id: id, status: 'available' })),
  );

  sendSuccess(res, null, 'Đã hủy đặt vé. Ghế đã được trả lại');
});
