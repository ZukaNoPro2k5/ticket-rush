import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendCreated, sendSuccess } from '../../shared/response';
import { getIO } from '../../config/socket';
import * as seatZoneService from './service';
import type { CreateSeatZoneInput, UpdateSeatZoneInput } from './validation';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const zones = await seatZoneService.listSeatZones(Number(req.params.eventId));
  sendSuccess(res, zones);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  const zone = await seatZoneService.createSeatZone(
    eventId,
    req.body as CreateSeatZoneInput,
  );
  getIO().to(`event:${eventId}`).emit('seat:layout_changed');
  sendCreated(res, zone, 'Seat zone created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  const zone = await seatZoneService.updateSeatZone(
    eventId,
    Number(req.params.id),
    req.body as UpdateSeatZoneInput,
  );
  getIO().to(`event:${eventId}`).emit('seat:layout_changed');
  sendSuccess(res, zone, 'Seat zone updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  await seatZoneService.deleteSeatZone(eventId, Number(req.params.id));
  getIO().to(`event:${eventId}`).emit('seat:layout_changed');
  sendSuccess(res, null, 'Seat zone deleted');
});
