import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import type {
  ChangePostStatusInput,
  CreatePostInput,
  ListPostsQuery,
  PostStatus,
  UpdatePostInput,
} from './validation';

interface PostRow extends RowDataPacket {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string | string[];
  quote: string | null;
  author_name: string;
  category: string;
  cover_url: string;
  read_time_min: number;
  featured: number | boolean;
  status: PostStatus;
  view_count: number;
  published_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

function normalizeBody(body: PostRow['body']): string[] {
  if (Array.isArray(body)) return body;
  try {
    const parsed = JSON.parse(body) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function normalizePost(row: PostRow) {
  return {
    ...row,
    body: normalizeBody(row.body),
    featured: Boolean(row.featured),
    read_time_min: Number(row.read_time_min),
    view_count: Number(row.view_count),
  };
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
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const [rows] = await pool.execute<RowDataPacket[]>(
      excludeId
        ? 'SELECT id FROM posts WHERE slug = ? AND id <> ? LIMIT 1'
        : 'SELECT id FROM posts WHERE slug = ? LIMIT 1',
      params,
    );
    if (rows.length === 0) return candidate;
    suffix += 1;
    candidate = `${normalized.slice(0, Math.max(1, 176 - String(suffix).length))}-${suffix}`;
  }
}

export async function listPosts(query: ListPostsQuery, includeUnpublished = false) {
  const { category, status, search, page, limit, sort, order } = query;
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (includeUnpublished) {
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
  } else {
    conditions.push('status = ?');
    params.push('published');
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(title LIKE ? OR excerpt LIKE ? OR author_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderColumn =
    sort === 'views' ? 'view_count'
      : sort === 'created_at' ? 'created_at'
        : 'published_at';
  const orderDirection = order === 'asc' ? 'ASC' : 'DESC';

  const [rows] = await pool.query<PostRow[]>(
    `SELECT *
     FROM posts
     ${where}
     ORDER BY featured DESC, ${orderColumn} ${orderDirection}, id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );

  const [[count]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM posts ${where}`,
    params,
  );
  const total = Number(count?.total ?? 0);

  return {
    posts: rows.map(normalizePost),
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

export async function getPostById(id: number) {
  const [rows] = await pool.execute<PostRow[]>(
    'SELECT * FROM posts WHERE id = ? LIMIT 1',
    [id],
  );
  if (rows.length === 0) throw AppError.notFound('Bài đăng không tồn tại', 'POST_NOT_FOUND');
  return normalizePost(rows[0]);
}

export async function getPostBySlug(slug: string, includeUnpublished = false, trackView = false) {
  const [rows] = await pool.execute<PostRow[]>(
    'SELECT * FROM posts WHERE slug = ? LIMIT 1',
    [slug],
  );
  if (rows.length === 0 || (!includeUnpublished && rows[0].status !== 'published')) {
    throw AppError.notFound('Bài đăng không tồn tại', 'POST_NOT_FOUND');
  }

  if (trackView && rows[0].status === 'published') {
    await pool.execute('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [rows[0].id]);
    rows[0].view_count += 1;
  }

  return normalizePost(rows[0]);
}

export async function getPostStats() {
  const [[row]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'published') AS published,
       SUM(status = 'draft') AS draft,
       COUNT(DISTINCT category) AS categories,
       COALESCE(SUM(view_count), 0) AS views
     FROM posts`,
  );

  return {
    total: Number(row.total ?? 0),
    published: Number(row.published ?? 0),
    draft: Number(row.draft ?? 0),
    categories: Number(row.categories ?? 0),
    views: Number(row.views ?? 0),
  };
}

export async function createPost(userId: number, input: CreatePostInput) {
  const slug = await ensureUniqueSlug(input.slug ?? input.title);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO posts (
       slug, title, excerpt, body, quote, author_name, category, cover_url,
       read_time_min, featured, status, published_at, created_by
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, ?)`,
    [
      slug,
      input.title,
      input.excerpt,
      JSON.stringify(input.body),
      input.quote ?? null,
      input.author_name,
      input.category,
      input.cover_url,
      input.read_time_min,
      input.featured ? 1 : 0,
      userId,
    ],
  );
  return getPostById(result.insertId);
}

export async function updatePost(id: number, input: UpdatePostInput) {
  await getPostById(id);
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.title !== undefined)         { fields.push('title = ?');         values.push(input.title); }
  if (input.excerpt !== undefined)       { fields.push('excerpt = ?');       values.push(input.excerpt); }
  if (input.body !== undefined)          { fields.push('body = ?');          values.push(JSON.stringify(input.body)); }
  if (input.quote !== undefined)         { fields.push('quote = ?');         values.push(input.quote ?? null); }
  if (input.author_name !== undefined)   { fields.push('author_name = ?');   values.push(input.author_name); }
  if (input.category !== undefined)      { fields.push('category = ?');      values.push(input.category); }
  if (input.cover_url !== undefined)     { fields.push('cover_url = ?');     values.push(input.cover_url); }
  if (input.read_time_min !== undefined) { fields.push('read_time_min = ?'); values.push(input.read_time_min); }
  if (input.featured !== undefined)      { fields.push('featured = ?');      values.push(input.featured ? 1 : 0); }
  if (input.slug !== undefined) {
    fields.push('slug = ?');
    values.push(await ensureUniqueSlug(input.slug, id));
  }

  if (fields.length === 0) throw AppError.badRequest('Không có dữ liệu cập nhật');

  values.push(id);
  await pool.execute(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`, values);
  return getPostById(id);
}

export async function changePostStatus(id: number, input: ChangePostStatusInput) {
  const current = await getPostById(id);
  if (current.status === input.status) return current;

  await pool.execute(
    `UPDATE posts
     SET status = ?,
         published_at = CASE
           WHEN ? = 'published' THEN COALESCE(published_at, NOW())
           ELSE published_at
         END
     WHERE id = ?`,
    [input.status, input.status, id],
  );
  return getPostById(id);
}

export async function deletePost(id: number) {
  await getPostById(id);
  await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
}
