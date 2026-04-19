import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as seatsService from './service';

// A6 — list seats by event
export const list = asyncHandler(async (req: Request, res: Response) => {
  const seats = await seatsService.listByEvent(Number(req.params.eventId));
  sendSuccess(res, seats);
});

// TODO: Dev 2 — additional seat handlers
