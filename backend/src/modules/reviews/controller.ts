import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../shared/response';
import * as reviewService from './service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.listReviews(Number(req.params.eventId));
  sendSuccess(res, result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const review = await reviewService.createReview(userId, Number(req.params.eventId), req.body);
  sendCreated(res, review, 'Đã gử đánh giá');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === 'admin';
  await reviewService.deleteReview(userId, Number(req.params.id), isAdmin);
  sendNoContent(res);
});
