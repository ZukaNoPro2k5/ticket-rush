import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as paymentService from './service';

export const listMethods = asyncHandler(async (_req: Request, res: Response) => {
  const methods = await paymentService.listEnabledPaymentMethods();
  sendSuccess(res, methods);
});
