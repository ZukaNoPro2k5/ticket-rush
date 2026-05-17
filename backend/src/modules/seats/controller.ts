import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as seatsService from './service';

// A6 — list seats by event
export const list = asyncHandler(async (req: Request, res: Response) => {
  const seats = await seatsService.listByEvent(Number(req.params.eventId));
  sendSuccess(res, seats);
});

export const listZone = asyncHandler(async (req: Request, res: Response) => {
  const seats = await seatsService.listByZone(Number(req.params.eventId), Number(req.params.zoneId));
  sendSuccess(res, seats);
});
