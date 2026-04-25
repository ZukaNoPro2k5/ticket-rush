'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, TrendingUp, BookOpen, Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NEWS_ARTICLES as ALL_NEWS, NEWS_CATEGORIES, TRENDING_NEWS_IDS, type NewsCategory } from '@/data/uiConfig';
import { fadeUp, staggerContainer, cardVariant, useSectionInView } from '@/lib/motion';

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>('Tất cả');
  const [pendingQuery, setPendingQuery] = useState('');
  const [query, setQuery] = useState('');

  const { ref, inView } = useSectionInView();

  const filtered = useMemo(() => {
    return ALL_NEWS.filter((a) => {
      if (category !== 'Tất cả' && a.category !== category) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      }
      return true;
    });
  }, [category, query]);

  const [hero, ...rest] = filtered;
  const secondaryTop = rest.slice(0, 2);
  const remaining = rest.slice(2);

  const trending = TRENDING_NEWS_IDS
    .map((id) => ALL_NEWS.find((a) => a.id === id))
    .filter(Boolean) as typeof ALL_NEWS;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(pendingQuery);
  };

  return (
    <>
      <Navbar variant="solid" />

      {/* Editorial header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
              <BookOpen className="h-3.5 w-3.5" /> TicketRush · Newsroom
            </span>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] text-stone-900 md:text-6xl">
              Đằng sau những đêm <span className="italic text-amber-600">bùng nổ</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-stone-600 md:text-lg">
              Tin tức, phỏng vấn, review thẳng thắn và hậu trường sự kiện — viết cho những người xem show không chỉ để giải trí.
            </p>
          </motion.div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6 flex max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={pendingQuery}
                onChange={(e) => setPendingQuery(e.target.value)}
                placeholder="Tìm bài viết, nghệ sĩ, sự kiện…"
                className="h-11 w-full rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <button type="submit" className="h-11 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-stone-800">
              Tìm
            </button>
          </form>
        </div>

        {/* Category chips */}
        <div className="sticky top-16 z-20 border-t border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 lg:px-8">
            {NEWS_CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors
                    ${active ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main ref={ref} className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-3 font-semibold text-stone-700">Chưa có bài viết phù hợp</p>
            <p className="mt-1 text-sm text-stone-500">Thử đổi chủ đề hoặc tìm bằng từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Main column */}
            <div className="lg:col-span-8">
              {/* Hero article */}
              {hero && (
                <motion.article
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  variants={fadeUp}
                  className="group"
                >
                  <Link href={`/news/${hero.id}`} className="block">
                    <div className="overflow-hidden rounded-3xl">
                      <div
                        className="aspect-[16/9] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
                        style={{ backgroundImage: `url(${hero.cover})` }}
                        role="img"
                        aria-label={hero.title}
                      />
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
                        <span>{hero.category}</span>
                        <span className="h-1 w-1 rounded-full bg-stone-300" />
                        <span className="text-stone-500">{hero.publishedAt}</span>
                        <span className="h-1 w-1 rounded-full bg-stone-300" />
                        <span className="inline-flex items-center gap-1 text-stone-500">
                          <Clock className="h-3 w-3" /> {hero.readMin} phút đọc
                        </span>
                      </div>
                      <h2 className="mt-3 line-clamp-3 font-display text-2xl font-bold leading-tight text-stone-900 group-hover:text-amber-700 md:text-4xl">
                        {hero.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
                        {hero.excerpt}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 group-hover:text-amber-800">
                        Đọc tiếp <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              )}

              {/* Two-up secondary */}
              {secondaryTop.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  variants={staggerContainer(0.08, 0.15)}
                  className="mt-12 grid grid-cols-1 gap-8 border-t border-stone-200 pt-10 sm:grid-cols-2"
                >
                  {secondaryTop.map((a) => (
                    <motion.article key={a.id} variants={cardVariant} className="group">
                      <Link href={`/news/${a.id}`} className="block">
                        <div className="overflow-hidden rounded-2xl">
                          <div
                            className="aspect-[4/3] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                            style={{ backgroundImage: `url(${a.cover})` }}
                            role="img"
                            aria-label={a.title}
                          />
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                            <span>{a.category}</span>
                            <span className="h-1 w-1 rounded-full bg-stone-300" />
                            <span className="text-stone-500">{a.publishedAt}</span>
                          </div>
                          <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-stone-900 group-hover:text-amber-700 md:text-xl">
                            {a.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-sm text-stone-600">{a.excerpt}</p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              )}

              {/* Text-first list */}
              {remaining.length > 0 && (
                <motion.ul
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  variants={staggerContainer(0.05, 0.25)}
                  className="mt-12 divide-y divide-stone-200 border-t border-stone-200"
                >
                  {remaining.map((a) => (
                    <motion.li key={a.id} variants={cardVariant} className="py-6 first:pt-6">
                      <Link href={`/news/${a.id}`} className="group flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex-1 order-2 sm:order-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                            <span>{a.category}</span>
                            <span className="h-1 w-1 rounded-full bg-stone-300" />
                            <span className="text-stone-500">{a.publishedAt}</span>
                            <span className="h-1 w-1 rounded-full bg-stone-300" />
                            <span className="inline-flex items-center gap-1 text-stone-500">
                              <Clock className="h-3 w-3" /> {a.readMin}&rsquo;
                            </span>
                          </div>
                          <h3 className="mt-2 line-clamp-2 font-display text-xl font-bold leading-snug text-stone-900 group-hover:text-amber-700 md:text-2xl">
                            {a.title}
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">{a.excerpt}</p>
                        </div>
                        <div
                          className="order-1 h-28 w-full flex-shrink-0 overflow-hidden rounded-xl bg-cover bg-center sm:order-2 sm:h-24 sm:w-32"
                          style={{ backgroundImage: `url(${a.cover})` }}
                          aria-hidden
                        />
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                {/* Trending */}
                <section>
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-stone-900">
                    <TrendingUp className="h-4 w-4 text-rose-500" /> Đang hot
                  </h3>
                  <ol className="mt-4 space-y-4">
                    {trending.map((a, i) => (
                      <li key={a.id}>
                        <Link href={`/news/${a.id}`} className="group flex items-start gap-3">
                          <span className="font-display text-2xl font-extrabold leading-none text-stone-200 group-hover:text-amber-400">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug text-stone-800 group-hover:text-amber-700">
                              {a.title}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {a.category} · {a.publishedAt}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Newsletter */}
                <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <h3 className="font-display text-base font-bold text-stone-900">Nhận bản tin hàng tuần</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    Những bài đáng đọc nhất về sự kiện giải trí Việt Nam — đến hộp thư của bạn mỗi thứ Bảy.
                  </p>
                  <form
                    onSubmit={(e) => { e.preventDefault(); }}
                    className="mt-3 flex gap-2"
                  >
                    <input
                      type="email" required placeholder="email@ban.vn"
                      className="h-10 flex-1 rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button type="submit" className="h-10 rounded-full bg-amber-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-amber-600">
                      Đăng ký
                    </button>
                  </form>
                </section>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
