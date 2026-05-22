import prisma from '../../config/prisma';
import { AppError } from '../../shared/AppError';
import type {
  ChangePostStatusInput,
  CreatePostInput,
  ListPostsQuery,
  UpdatePostInput,
} from './validation';

type PostRecord = Awaited<ReturnType<typeof prisma.posts.findFirstOrThrow>>;

function normalizeBody(body: PostRecord['body']): string[] {
  return Array.isArray(body) ? body.map(String) : [];
}

function normalizePost(row: PostRecord) {
  return { ...row, body: normalizeBody(row.body) };
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'bai-viet';
}

async function ensureUniqueSlug(base: string, excludeId?: number) {
  const normalized = slugify(base);
  let candidate = normalized;
  let suffix = 1;
  while (true) {
    const existing = await prisma.posts.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${normalized.slice(0, Math.max(1, 176 - String(suffix).length))}-${suffix}`;
  }
}

export async function listPosts(query: ListPostsQuery, includeUnpublished = false) {
  const { category, status, search, page, limit, sort, order } = query;
  const where = {
    ...(includeUnpublished ? (status ? { status } : {}) : { status: 'published' as const }),
    ...(category ? { category } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { author_name: { contains: search } },
      ],
    } : {}),
  };
  const orderField = sort === 'views' ? 'view_count' : sort === 'created_at' ? 'created_at' : 'published_at';
  const [rows, total] = await prisma.$transaction([
    prisma.posts.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { [orderField]: order }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.posts.count({ where }),
  ]);
  return {
    posts: rows.map(normalizePost),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getPostById(id: number) {
  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) throw AppError.notFound('Bài đăng không tồn tại', 'POST_NOT_FOUND');
  return normalizePost(post);
}

export async function getPostBySlug(slug: string, includeUnpublished = false, trackView = false) {
  const post = await prisma.posts.findUnique({ where: { slug } });
  if (!post || (!includeUnpublished && post.status !== 'published')) {
    throw AppError.notFound('Bài đăng không tồn tại', 'POST_NOT_FOUND');
  }
  const next = trackView && post.status === 'published'
    ? await prisma.posts.update({ where: { id: post.id }, data: { view_count: { increment: 1 } } })
    : post;
  return normalizePost(next);
}

export async function getPostStats() {
  const [total, published, draft, categories, views] = await prisma.$transaction([
    prisma.posts.count(),
    prisma.posts.count({ where: { status: 'published' } }),
    prisma.posts.count({ where: { status: 'draft' } }),
    prisma.posts.findMany({ distinct: ['category'], select: { category: true } }),
    prisma.posts.aggregate({ _sum: { view_count: true } }),
  ]);
  return { total, published, draft, categories: categories.length, views: views._sum.view_count ?? 0 };
}

export async function createPost(userId: number, input: CreatePostInput) {
  const slug = await ensureUniqueSlug(input.slug ?? input.title);
  const created = await prisma.posts.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      quote: input.quote ?? null,
      author_name: input.author_name,
      category: input.category,
      cover_url: input.cover_url,
      read_time_min: input.read_time_min,
      featured: !!input.featured,
      status: 'draft',
      published_at: null,
      created_by: userId,
    },
  });
  return normalizePost(created);
}

export async function updatePost(id: number, input: UpdatePostInput) {
  await getPostById(id);
  if (Object.keys(input).length === 0) throw AppError.badRequest('Không có dữ liệu cập nhật');
  const updated = await prisma.posts.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.quote !== undefined && { quote: input.quote ?? null }),
      ...(input.author_name !== undefined && { author_name: input.author_name }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.cover_url !== undefined && { cover_url: input.cover_url }),
      ...(input.read_time_min !== undefined && { read_time_min: input.read_time_min }),
      ...(input.featured !== undefined && { featured: input.featured }),
      ...(input.slug !== undefined && { slug: await ensureUniqueSlug(input.slug, id) }),
    },
  });
  return normalizePost(updated);
}

export async function changePostStatus(id: number, input: ChangePostStatusInput) {
  const current = await getPostById(id);
  if (current.status === input.status) return current;
  const updated = await prisma.posts.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.status === 'published' && !current.published_at ? { published_at: new Date() } : {}),
    },
  });
  return normalizePost(updated);
}

export async function deletePost(id: number) {
  await getPostById(id);
  await prisma.posts.delete({ where: { id } });
}
