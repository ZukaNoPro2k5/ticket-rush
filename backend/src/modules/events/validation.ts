import { z } from 'zod';

const categoryEnum = z.enum(['music', 'stage', 'sports', 'workshop', 'other']);
const statusEnum = z.enum(['draft', 'published', 'cancelled', 'completed']);

export const createEventSchema = z.object({
  title: z.string().min(3, 'Tiêu đề tối thiểu 3 ký tự').max(255),
  description: z.string().max(5000).optional(),
  category: categoryEnum.default('other'),
  venue: z.string().min(3, 'Địa điểm tối thiểu 3 ký tự').max(255),
  event_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Ngày không hợp lệ'),
  poster_url: z.string().url('URL poster không hợp lệ').max(500).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(5000).optional(),
  category: categoryEnum.optional(),
  venue: z.string().min(3).max(255).optional(),
  event_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Ngày không hợp lệ').optional(),
  poster_url: z.string().url().max(500).optional(),
  queue_enabled: z.boolean().optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(['published', 'cancelled', 'completed']),
});

export const listEventsQuerySchema = z.object({
  category: categoryEnum.optional(),
  status: statusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(12),
  sort: z.enum(['event_date', 'created_at']).default('event_date'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
