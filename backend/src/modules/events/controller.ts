import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/response';
import * as eventService from './service';
import type { ListEventsQuery, CreateEventInput, UpdateEventInput, ChangeStatusInput } from './validation';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const includeUnpublished = req.user?.role === 'admin';
  const result = await eventService.listEvents(
    req.query as unknown as ListEventsQuery,
    includeUnpublished,
  );
  sendSuccess(res, result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const includeUnpublished = req.user?.role === 'admin';
  const event = await eventService.getEventById(id, includeUnpublished);
  sendSuccess(res, event);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.createEvent(req.user!.userId, req.body as CreateEventInput);
  sendCreated(res, event, 'Tạo sự kiện thành công');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const event = await eventService.updateEvent(id, req.body as UpdateEventInput);
  sendSuccess(res, event);
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const event = await eventService.changeStatus(id, req.body as ChangeStatusInput);
  sendSuccess(res, event);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  await eventService.deleteEvent(id);
  sendSuccess(res, null, 'Đã xóa sự kiện');
});
