import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/response';
import * as postsService from './service';
import type {
  ChangePostStatusInput,
  CreatePostInput,
  ListPostsQuery,
  UpdatePostInput,
} from './validation';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const includeUnpublished = req.user?.role === 'admin';
  const data = await postsService.listPosts(req.query as unknown as ListPostsQuery, includeUnpublished);
  res.set('Cache-Control', 'no-store');
  sendSuccess(res, data);
});

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await postsService.getPostStats();
  sendSuccess(res, data);
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const includeUnpublished = req.user?.role === 'admin';
  const post = await postsService.getPostBySlug(req.params.slug, includeUnpublished, !includeUnpublished);
  res.set('Cache-Control', 'no-store');
  sendSuccess(res, post);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const post = await postsService.getPostById(Number(req.params.id));
  sendSuccess(res, post);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const post = await postsService.createPost(req.user!.userId, req.body as CreatePostInput);
  sendCreated(res, post, 'Tạo bài đăng thành công');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const post = await postsService.updatePost(Number(req.params.id), req.body as UpdatePostInput);
  sendSuccess(res, post, 'Cập nhật bài đăng thành công');
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const post = await postsService.changePostStatus(Number(req.params.id), req.body as ChangePostStatusInput);
  sendSuccess(res, post, 'Đã cập nhật trạng thái bài đăng');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await postsService.deletePost(Number(req.params.id));
  sendNoContent(res);
});
