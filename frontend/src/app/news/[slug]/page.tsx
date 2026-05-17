'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Share2, Bookmark, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getPostBySlug, listPosts } from '@/lib/api/posts';
import { getPostBookmark, removePostBookmark, savePostBookmark } from '@/lib/api/engagement';
import { authorInitials, formatPostDate } from '@/lib/utils/posts';
import type { Post } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import toast from 'react-hot-toast';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPostBySlug(slug)
      .then(async (post) => {
        setArticle(post);
        const feed = await listPosts({ category: post.category, limit: 4 });
        setRelated(feed.posts.filter((item) => item.id !== post.id).slice(0, 3));
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!article || !isAuthenticated) return;
    getPostBookmark(article.id)
      .then((result) => setSaved(result.saved))
      .catch(() => undefined);
  }, [article, isAuthenticated]);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: article?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Đã sao chép liên kết');
      }
    } catch {
      // User cancelled share sheet or clipboard unavailable.
    }
  };

  const handleBookmark = async () => {
    if (!article) return;
    if (!isAuthenticated) {
      openLoginModal('login');
      return;
    }
    setSaving(true);
    try {
      const result = saved
        ? await removePostBookmark(article.id)
        : await savePostBookmark(article.id);
      setSaved(result.saved);
      toast.success(result.saved ? 'Đã lưu bài' : 'Đã bỏ lưu bài');
    } catch {
      toast.error('Chưa thể cập nhật bài đã lưu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar variant="solid" />
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-stone-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Đang tải bài viết…</span>
        </div>
        <Footer />
      </>
    );
  }

  if (missing || !article) {
    return (
      <>
        <Navbar variant="solid" />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold text-stone-900">Không tìm thấy bài viết</h1>
          <Link href="/news" className="mt-4 inline-flex text-sm font-semibold text-amber-700">
            Quay lại newsroom
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar variant="solid" />

      <div className="relative w-full overflow-hidden bg-stone-900" style={{ minHeight: 420 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover_url}
          alt={article.title}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />

        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-8 lg:px-8 lg:pb-14 lg:pt-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại tin tức
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-amber-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              {article.category}
            </span>
            <span className="text-xs text-white/60">{formatPostDate(article.published_at)}</span>
            <span className="inline-flex items-center gap-1 text-xs text-white/60">
              <Clock className="h-3 w-3" /> {article.read_time_min} phút đọc
            </span>
          </div>

          <h1 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
            {article.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/40">
                {authorInitials(article.author_name)}
              </div>
              <span className="text-sm font-semibold text-white/90">{article.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20">
                <Share2 className="h-3.5 w-3.5" /> Chia sẻ
              </button>
              <button
                onClick={handleBookmark}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-60"
              >
                <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-white text-white' : ''}`} /> {saved ? 'Đã lưu' : 'Lưu bài'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="space-y-5 text-base leading-relaxed text-stone-800 md:text-[1.0625rem] md:leading-[1.85]">
          <p className="text-lg font-medium leading-relaxed text-stone-700 md:text-xl md:leading-[1.75]">
            {article.body[0]}
          </p>

          {article.body.slice(1, 3).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          {article.quote && (
            <blockquote className="my-8 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 font-display text-xl italic leading-snug text-stone-800 md:text-2xl">
              &ldquo;{article.quote}&rdquo;
            </blockquote>
          )}

          {article.body.slice(3).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-t border-stone-200 pt-6">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            #{article.category}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            #TicketRush
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white">
            {authorInitials(article.author_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-stone-900">{article.author_name}</p>
            <p className="text-xs text-stone-500">Đội ngũ biên tập, viết vì người yêu show.</p>
          </div>
          <Link href="/news" className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-800">
            Xem thêm bài →
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-14 border-t border-stone-200 pt-10">
            <h2 className="font-display text-xl font-bold text-stone-900 md:text-2xl">Đọc thêm cùng chủ đề</h2>
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((post) => (
                <li key={post.id}>
                  <Link href={`/news/${post.slug}`} className="group block">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">{post.category}</p>
                    <p className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug text-stone-900 group-hover:text-amber-700">
                      {post.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <Footer />
    </>
  );
}
