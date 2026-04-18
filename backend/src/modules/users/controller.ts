import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as usersService from './service';
import type { UpdateProfileInput, ChangePasswordInput } from './validation';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateProfile(req.user!.userId, req.body as UpdateProfileInput);
  sendSuccess(res, user, 'Cập nhật thành công');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await usersService.changePassword(req.user!.userId, req.body as ChangePasswordInput);
  sendSuccess(res, null, 'Đổi mật khẩu thành công');
});
