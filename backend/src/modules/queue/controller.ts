import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as queueService from './service';

export const enter = asyncHandler(async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  const userId = req.user!.userId;
  const status = await queueService.enterQueue(eventId, userId);
  sendSuccess(res, status);
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  const userId = req.user!.userId;
  const result = await queueService.getStatus(eventId, userId);
  sendSuccess(res, result);
});

export const leave = asyncHandler(async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  const userId = req.user!.userId;
  await queueService.leaveQueue(eventId, userId);
  sendSuccess(res, { left: true });
});
