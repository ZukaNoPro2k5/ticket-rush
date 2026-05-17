'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  ExternalLink,
  Loader2,
  Newspaper,
  PencilLine,
  Send,
  Timer,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { changePostStatus, deletePost, getPostById } from '@/lib/api/posts';
import { formatPostDate, postStatusLabel } from '@/lib/utils/posts';
import type { Post } from '@/types';

export default function AdminPostPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const postId = Number(id);
    if (!postId) {
      router.replace('/admin/posts');
      return;
    }
    setLoading(true);
    getPostById(postId)
      .then(setPost)
      .catch(() => {
        toast.error('Không tải được bài đăng');
        router.replace('/admin/posts');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function togglePublish() {
    if (!post) return;
    setSaving(true);
    try {
      const next = post.status === 'published' ? 'draft' : 'published';
      const updated = await changePostStatus(post.id, next);
      setPost(updated);
      toast.success(next === 'published' ? 'Đã xuất bản bài đăng' : 'Đã đưa bài về bản nháp');
    } catch {
      toast.error('Không cập nhật được trạng thái');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!post || !confirm(`Xóa bài "${post.title}"?`)) return;
    setSaving(true);
    try {
      await deletePost(post.id);
      toast.success('Đã xóa bài đăng');
      router.replace('/admin/posts');
    } catch {
      toast.error('Không xóa được bài đăng');
      setSaving(false);
    }
  }

  if (loading || !post) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Đang tải bài đăng…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" />
          Danh sách bài đăng
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {post.status === 'published' && (
            <Link
              href={`/news/${post.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              <ExternalLink className="h-4 w-4" />
              Mở trang khách
            </Link>
          )}
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            <PencilLine className="h-4 w-4" />
            Chỉnh sửa bài
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative min-h-[220px] bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_url} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          </div>

          <div className="space-y-5 p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {post.category}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  post.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                }`}>
                  {postStatusLabel(post.status)}
                </span>
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-stone-900">{post.title}</h1>
              <p className="mt-2 text-sm text-stone-500">{post.author_name}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <Metric icon={Eye} label="Lượt xem" value={post.view_count.toLocaleString('vi-VN')} />
              <Metric icon={CalendarDays} label="Ngày đăng" value={formatPostDate(post.published_at)} />
              <Metric icon={Timer} label="Thời lượng" value={`${post.read_time_min} phút`} />
              <Metric icon={Newspaper} label="Bài nổi bật" value={post.featured ? 'Có' : 'Không'} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Vận hành bài đăng</h2>
            <p className="text-sm text-stone-500">Xuất bản hoặc rút bài về bản nháp tại một chỗ, không rải nút ngoài danh sách.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void togglePublish()}
              disabled={saving}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                post.status === 'published'
                  ? 'border border-stone-200 text-stone-700 hover:bg-stone-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Send className="h-4 w-4" />
              {post.status === 'published' ? 'Đưa về bản nháp' : 'Xuất bản'}
            </button>
            <button
              onClick={() => void remove()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Xóa bài
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-stone-900">Bản xem trước nội dung</h2>
          <p className="text-sm text-stone-500">Kiểm tra bố cục và nội dung trước khi bài hiển thị ngoài newsroom.</p>
        </div>
        <div className="max-w-4xl space-y-4 text-sm leading-7 text-stone-700">
          <p className="font-medium text-stone-900">{post.excerpt}</p>
          {post.body.slice(0, 3).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-stone-50 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-stone-900">{value}</p>
    </div>
  );
}
