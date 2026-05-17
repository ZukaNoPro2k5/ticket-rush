import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as usersService from './service';
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  SavePreferencesInput,
  UpdateAvatarInput,
} from './validation';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getProfile(req.user!.userId);
  sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateProfile(req.user!.userId, req.body as UpdateProfileInput);
  sendSuccess(res, user, 'Cập nhật thành công');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await usersService.changePassword(req.user!.userId, req.body as ChangePasswordInput);
  sendSuccess(res, null, 'Đổi mật khẩu thành công');
});

export const savePreferences = asyncHandler(async (req: Request, res: Response) => {
  await usersService.savePreferences(req.user!.userId, req.body as SavePreferencesInput);
  sendSuccess(res, null, 'Đã lưu sở thích');
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateAvatar(req.user!.userId, req.body as UpdateAvatarInput);
  sendSuccess(res, user, 'Đã cập nhật ảnh đại diện');
});
