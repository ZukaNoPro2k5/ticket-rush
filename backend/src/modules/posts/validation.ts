import { z } from 'zod';

const postStatusEnum = z.enum(['draft', 'published']);

const paragraphSchema = z.string().trim().min(1, 'Đoạn nội dung không được để trống').max(5000);

export const createPostSchema = z.object({
  title: z.string().trim().min(3, 'Tiêu đề tối thiểu 3 ký tự').max(255),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9-]+$/i, 'Slug chỉ gồm chữ, số và dấu gạch ngang').optional(),
  excerpt: z.string().trim().min(10, 'Mô tả ngắn tối thiểu 10 ký tự').max(3000),
  body: z.array(paragraphSchema).min(1, 'Bài viết cần ít nhất 1 đoạn').max(40),
  quote: z.string().trim().max(2000).nullable().optional().default(null),
  author_name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  cover_url: z.string().url('URL ảnh bìa không hợp lệ').max(500),
  read_time_min: z.number().int().min(1).max(120).optional().default(5),
  featured: z.boolean().optional().default(false),
});

export const updatePostSchema = createPostSchema.partial();

export const changePostStatusSchema = z.object({
  status: postStatusEnum,
});

export const listPostsQuerySchema = z.object({
  category: z.string().trim().min(1).max(60).optional(),
  status: postStatusEnum.optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['published_at', 'created_at', 'views']).default('published_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PostStatus = z.infer<typeof postStatusEnum>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ChangePostStatusInput = z.infer<typeof changePostStatusSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
