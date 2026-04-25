import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/response';
import * as authService from './service';
import type { RegisterInput, LoginInput, OAuthSyncInput } from './validation';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const { token, user } = await authService.register(input);
  sendCreated(res, { token, user }, 'Đăng ký thành công');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const { token, user } = await authService.login(input);
  sendSuccess(res, { token, user });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);
  sendSuccess(res, user);
});

export const oauthSync = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as OAuthSyncInput;
  const result = await authService.oauthSync(input);
  sendSuccess(res, result);
});
