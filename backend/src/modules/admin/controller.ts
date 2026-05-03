import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as adminService from './service';

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
});

export const revenueByMonth = asyncHandler(async (req: Request, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const data = await adminService.getRevenueByMonth(year);
  sendSuccess(res, data);
});

export const fillRates = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getFillRates();
  sendSuccess(res, data);
});

export const audienceStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getAudienceStats();
  sendSuccess(res, data);
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const search = req.query.search as string | undefined;
  const data = await adminService.listUsers(page, limit, search);
  sendSuccess(res, data);
});
