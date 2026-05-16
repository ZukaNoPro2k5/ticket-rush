import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/response';
import { getIO } from '../../config/socket';
import * as bookingsService from './service';
import * as emailService from '../email/service';
import type { CreateBookingInput } from './validation';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingsService.createBooking(req.user!.userId, req.body as CreateBookingInput);

  const io = getIO();
  io.to(`event:${result.event_id}`).emit(
    'seat:status_changed',
    result.seat_ids.map((id) => ({ seat_id: id, status: 'locked' })),
  );

  sendCreated(res, result, 'Dat ghe thanh cong. Vui long thanh toan trong 10 phut');
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

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, seatIds, tickets } = await bookingsService.confirmBooking(
    Number(req.params.id),
    req.user!.userId,
  );

  const booking = await bookingsService.getBooking(bookingId);
  const io = getIO();
  io.to(`event:${booking.event.id}`).emit(
    'seat:status_changed',
    seatIds.map((id) => ({ seat_id: id, status: 'sold' })),
  );

  void emailService.sendBookingConfirmationDevLog(booking, tickets).catch((err) => {
    console.error('[Email:dev-log] Failed to log booking confirmation:', err);
  });

  sendSuccess(res, { booking_id: bookingId, tickets }, 'Thanh toan thanh cong! Ve da duoc tao');
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const { seatIds } = await bookingsService.cancelBooking(
    Number(req.params.id),
    req.user!.userId,
    isAdmin,
  );

  const booking = await bookingsService.getBooking(Number(req.params.id));
  const io = getIO();
  io.to(`event:${booking.event.id}`).emit(
    'seat:status_changed',
    seatIds.map((id) => ({ seat_id: id, status: 'available' })),
  );

  sendSuccess(res, null, 'Da huy dat ve. Ghe da duoc tra lai');
});
