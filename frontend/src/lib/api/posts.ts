import api from './client';
import type { ApiResponse, Post, PostStats } from '@/types';

export interface ListPostsParams {
  category?: string;
  status?: Post['status'];
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'published_at' | 'created_at' | 'views';
  order?: 'asc' | 'desc';
}

export interface PostPayload {
  title: string;
  slug?: string;
  excerpt: string;
  body: string[];
  quote?: string | null;
  author_name: string;
  category: string;
  cover_url: string;
  read_time_min: number;
  featured: boolean;
}

export async function listPosts(params: ListPostsParams = {}) {
  const res = await api.get<ApiResponse<{
    posts: Post[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }>>('/posts', { params });
  return res.data.data!;
}

export async function getPostStats() {
  const res = await api.get<ApiResponse<PostStats>>('/posts/stats');
  return res.data.data!;
}

export async function getPostById(id: number) {
  const res = await api.get<ApiResponse<Post>>(`/posts/${id}`);
  return res.data.data!;
}

export async function getPostBySlug(slug: string) {
  const res = await api.get<ApiResponse<Post>>(`/posts/slug/${slug}`);
  return res.data.data!;
}

export async function createPost(payload: PostPayload) {
  const res = await api.post<ApiResponse<Post>>('/posts', payload);
  return res.data.data!;
}

export async function updatePost(id: number, payload: Partial<PostPayload>) {
  const res = await api.put<ApiResponse<Post>>(`/posts/${id}`, payload);
  return res.data.data!;
}

export async function changePostStatus(id: number, status: Post['status']) {
  const res = await api.patch<ApiResponse<Post>>(`/posts/${id}/status`, { status });
  return res.data.data!;
}

export async function deletePost(id: number) {
  await api.delete(`/posts/${id}`);
}
