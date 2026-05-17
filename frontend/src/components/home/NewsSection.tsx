'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Newspaper } from 'lucide-react';
import { listPosts } from '@/lib/api/posts';
import { formatPostDate } from '@/lib/utils/posts';
import type { Post } from '@/types';
import { cardVariant, fadeUp, staggerContainer, useSectionInView } from '@/lib/motion';

export function NewsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [featured, ...rest] = posts;
  const { ref, inView } = useSectionInView();

  useEffect(() => {
    listPosts({ limit: 5 })
      .then((result) => setPosts(result.posts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-12 lg:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-6 flex items-end justify-between gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">
              <Newspaper className="h-3.5 w-3.5" /> Tin tức
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Điểm tin sự kiện &amp; nghệ sĩ</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Cập nhật trực tiếp từ newsroom TicketRush</p>
          </div>
          <Link href="/news" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-600 sm:inline-flex">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 py-16 text-stone-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải tin mới…</span>
          </div>
        ) : !featured ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-sm text-stone-500">
            Chưa có bài đăng nào được xuất bản.
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid gap-5 lg:grid-cols-12"
          >
            <motion.div variants={cardVariant} className="lg:col-span-7">
              <Link href={`/news/${featured.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.cover_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="inline-flex rounded-full bg-sky-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {featured.category}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-bold leading-tight md:text-2xl">{featured.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/80">{featured.excerpt}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
                      <span>{formatPostDate(featured.published_at)}</span>
                      <span className="h-1 w-1 rounded-full bg-white/40" />
                      <span>{featured.read_time_min} phút đọc</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <div className="space-y-4 lg:col-span-5">
              {rest.slice(0, 4).map((post) => (
                <motion.div key={post.id} variants={cardVariant}>
                  <Link href={`/news/${post.slug}`} className="group flex gap-4 rounded-2xl p-2 transition-colors hover:bg-stone-50">
                    <div className="aspect-[4/3] w-32 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">{post.category}</span>
                      <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug text-stone-900 group-hover:text-amber-700 md:text-base">
                        {post.title}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-stone-500">
                        <span>{formatPostDate(post.published_at)}</span>
                        <span className="h-1 w-1 rounded-full bg-stone-300" />
                        <span>{post.read_time_min} phút đọc</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-5 flex justify-center sm:hidden">
          <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
            Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
