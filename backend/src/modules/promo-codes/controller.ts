import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../shared/response';
import * as promoService from './service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.query.event_id ? Number(req.query.event_id) : undefined;
  const promos = await promoService.listPromoCodes(eventId);
  sendSuccess(res, promos);
});

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const promos = await promoService.listPublicPromoCodes();
  sendSuccess(res, promos);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const promo = await promoService.getPromoById(Number(req.params.id));
  sendSuccess(res, promo);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const promo = await promoService.createPromo(req.body);
  sendCreated(res, promo, 'Tạo mã giảm giá thành công');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const promo = await promoService.updatePromo(Number(req.params.id), req.body);
  sendSuccess(res, promo, 'Cập nhật mã giảm giá thành công');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await promoService.deletePromo(Number(req.params.id));
  sendNoContent(res);
});

export const validate = asyncHandler(async (req: Request, res: Response) => {
  const result = await promoService.validatePromo(req.body);
  sendSuccess(res, result);
});
