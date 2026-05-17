import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as engagementService from './service';
import type { NewsletterSubscriptionInput } from './validation';

export const listEventFavorites = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.listEventFavorites(req.user!.userId);
  sendSuccess(res, data);
});

export const eventFavoriteState = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.getEventFavorite(req.user!.userId, Number(req.params.eventId));
  sendSuccess(res, data);
});

export const saveEventFavorite = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.saveEventFavorite(req.user!.userId, Number(req.params.eventId));
  sendSuccess(res, data, 'Đã lưu sự kiện');
});

export const removeEventFavorite = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.removeEventFavorite(req.user!.userId, Number(req.params.eventId));
  sendSuccess(res, data, 'Đã bỏ lưu sự kiện');
});

export const postBookmarkState = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.getPostBookmark(req.user!.userId, Number(req.params.postId));
  sendSuccess(res, data);
});

export const savePostBookmark = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.savePostBookmark(req.user!.userId, Number(req.params.postId));
  sendSuccess(res, data, 'Đã lưu bài');
});

export const removePostBookmark = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.removePostBookmark(req.user!.userId, Number(req.params.postId));
  sendSuccess(res, data, 'Đã bỏ lưu bài');
});

export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const data = await engagementService.subscribeNewsletter(
    (req.body as NewsletterSubscriptionInput).email,
    req.user?.userId,
  );
  sendSuccess(res, data, 'Đã đăng ký nhận bản tin');
});
