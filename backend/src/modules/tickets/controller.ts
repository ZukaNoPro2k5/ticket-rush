import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as ticketsService from './service';

export const listMy = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query;
  const result = await ticketsService.listMyTickets(
    req.user!.userId,
    status as string | undefined,
    page ? Number(page) : 1,
    limit ? Number(limit) : 10,
  );
  sendSuccess(res, result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const ticket = await ticketsService.getTicket(
    Number(req.params.id),
    isAdmin ? undefined : req.user!.userId,
  );
  sendSuccess(res, ticket);
});

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketsService.checkIn(Number(req.params.id));
  sendSuccess(res, ticket, 'Soát vé thành công');
});
