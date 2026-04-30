import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendCreated, sendSuccess } from '../../shared/response';
import * as seatZoneService from './service';
import type { CreateSeatZoneInput, UpdateSeatZoneInput } from './validation';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const zones = await seatZoneService.listSeatZones(Number(req.params.eventId));
  sendSuccess(res, zones);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const zone = await seatZoneService.createSeatZone(
    Number(req.params.eventId),
    req.body as CreateSeatZoneInput,
  );
  sendCreated(res, zone, 'Seat zone created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const zone = await seatZoneService.updateSeatZone(
    Number(req.params.eventId),
    Number(req.params.id),
    req.body as UpdateSeatZoneInput,
  );
  sendSuccess(res, zone, 'Seat zone updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await seatZoneService.deleteSeatZone(Number(req.params.eventId), Number(req.params.id));
  sendSuccess(res, null, 'Seat zone deleted');
});
