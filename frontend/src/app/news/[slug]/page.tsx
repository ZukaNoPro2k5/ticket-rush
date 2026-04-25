import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Share2, Bookmark, User } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NEWS_ARTICLES as ALL_NEWS } from '@/data/uiConfig';

export function generateStaticParams() {
  return ALL_NEWS.map((a) => ({ slug: a.id }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = ALL_NEWS.find((a) => a.id === params.slug);
  if (!article) notFound();

  const related = ALL_NEWS.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);
  const paragraphs = article.body ?? [article.excerpt];

  return (
    <>
      <Navbar variant="solid" />

      {/* ── HERO: full-width cover + overlaid title ── */}
      <div className="relative w-full overflow-hidden bg-stone-900" style={{ minHeight: 420 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover}
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
            <span className="text-xs text-white/60">{article.publishedAt}</span>
            <span className="inline-flex items-center gap-1 text-xs text-white/60">
              <Clock className="h-3 w-3" /> {article.readMin} phút đọc
            </span>
          </div>

          <h1 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
            {article.excerpt}
          </p>

          {/* Author + share row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-400/40">
                <User className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-white/90">{article.author ?? 'TicketRush Newsroom'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20">
                <Share2 className="h-3.5 w-3.5" /> Chia sẻ
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20">
                <Bookmark className="h-3.5 w-3.5" /> Lưu bài
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ARTICLE BODY ── */}
      <article className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">

        {/* Body */}
        <div className="space-y-5 text-base leading-relaxed text-stone-800 md:text-[1.0625rem] md:leading-[1.85]">
          {/* Lead paragraph — larger */}
          <p className="text-lg font-medium leading-relaxed text-stone-700 md:text-xl md:leading-[1.75]">
            {paragraphs[0]}
          </p>

          {paragraphs.slice(1, 3).map((p, i) => <p key={i}>{p}</p>)}

          {article.quote && (
            <blockquote className="my-8 border-l-4 border-amber-500 bg-amber-50 px-6 py-5 font-display text-xl italic leading-snug text-stone-800 md:text-2xl">
              &ldquo;{article.quote}&rdquo;
            </blockquote>
          )}

          {paragraphs.slice(3).map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* Tags / category badge */}
        <div className="mt-10 flex flex-wrap gap-2 border-t border-stone-200 pt-6">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            #{article.category}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            #TicketRush
          </span>
        </div>

        {/* Author bar */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-stone-900">{article.author ?? 'TicketRush Newsroom'}</p>
            <p className="text-xs text-stone-500">Đội ngũ biên tập — viết vì người yêu show.</p>
          </div>
          <Link href="/news" className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-800">
            Xem thêm bài →
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14 border-t border-stone-200 pt-10">
            <h2 className="font-display text-xl font-bold text-stone-900 md:text-2xl">Đọc thêm cùng chủ đề</h2>
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/news/${r.id}`} className="group block">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.cover}
                        alt={r.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">{r.category}</p>
                    <p className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug text-stone-900 group-hover:text-amber-700">
                      {r.title}
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
