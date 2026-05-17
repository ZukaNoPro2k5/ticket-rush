'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createPost, updatePost, type PostPayload } from '@/lib/api/posts';
import { POST_CATEGORIES } from '@/lib/utils/posts';
import type { Post } from '@/types';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const EDITABLE_CATEGORIES = POST_CATEGORIES.filter((item) => item !== 'Tất cả');

export default function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [bodyText, setBodyText] = useState(post?.body.join('\n\n') ?? '');
  const [quote, setQuote] = useState(post?.quote ?? '');
  const [authorName, setAuthorName] = useState(post?.author_name ?? 'TicketRush Newsroom');
  const [category, setCategory] = useState(post?.category ?? 'Sự kiện');
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? '');
  const [readTime, setReadTime] = useState(post?.read_time_min ?? 5);
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [slugTouched, title]);

  const paragraphs = useMemo(() => splitParagraphs(bodyText), [bodyText]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (paragraphs.length === 0) {
      toast.error('Bài viết cần ít nhất một đoạn nội dung');
      return;
    }

    const payload: PostPayload = {
      title,
      slug: slug || undefined,
      excerpt,
      body: paragraphs,
      quote: quote.trim() || null,
      author_name: authorName,
      category,
      cover_url: coverUrl,
      read_time_min: readTime,
      featured,
    };

    setSaving(true);
    try {
      const saved = post
        ? await updatePost(post.id, payload)
        : await createPost(payload);
      toast.success(post ? 'Đã lưu bài đăng' : 'Đã tạo bản nháp');
      router.push(`/admin/posts/${saved.id}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Không thể lưu bài đăng';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={post ? `/admin/posts/${post.id}` : '/admin/posts'} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" />
          {post ? 'Quay lại bài đăng' : 'Danh sách bài đăng'}
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {post ? 'Lưu thay đổi' : 'Tạo bản nháp'}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <Field label="Tiêu đề">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề bài đăng"
              className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm text-stone-900 outline-none focus:border-amber-400"
            />
          </Field>

          <Field label="Mô tả ngắn">
            <textarea
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Đoạn dẫn hiện trên thẻ bài viết"
              className="w-full resize-none rounded-xl border border-stone-200 px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-amber-400"
            />
          </Field>

          <Field label="Nội dung">
            <textarea
              required
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={16}
              placeholder="Mỗi đoạn cách nhau bằng một dòng trống."
              className="w-full rounded-xl border border-stone-200 px-3.5 py-3 text-sm leading-7 text-stone-900 outline-none focus:border-amber-400"
            />
            <p className="mt-1 text-xs text-stone-400">{paragraphs.length} đoạn nội dung</p>
          </Field>

          <Field label="Trích dẫn nổi bật">
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
              placeholder="Có thể để trống"
              className="w-full resize-none rounded-xl border border-stone-200 px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-amber-400"
            />
          </Field>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-stone-900">Xuất bản</h2>
            <div className="mt-4 space-y-4">
              <Field label="Slug">
                <input
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="duong-dan-bai-viet"
                  className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm text-stone-900 outline-none focus:border-amber-400"
                />
              </Field>

              <Field label="Tác giả">
                <input
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm text-stone-900 outline-none focus:border-amber-400"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Chủ đề">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-amber-400"
                  >
                    {EDITABLE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Phút đọc">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={readTime}
                    onChange={(e) => setReadTime(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm text-stone-900 outline-none focus:border-amber-400"
                  />
                </Field>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-stone-200 px-3.5 py-3">
                <span>
                  <span className="block text-sm font-medium text-stone-800">Bài nổi bật</span>
                  <span className="block text-xs text-stone-400">Ưu tiên ở newsroom và trang chủ</span>
                </span>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-amber-500"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
            <Field label="Ảnh bìa">
              <input
                required
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm text-stone-900 outline-none focus:border-amber-400"
              />
            </Field>
            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-xl bg-stone-100">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-300">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  );
}
