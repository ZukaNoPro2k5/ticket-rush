'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/data/uiConfig';
import { cardVariant, fadeIn, fadeUp, staggerContainer, useSectionInView } from '@/lib/motion';

export function CategoriesGrid() {
  const { ref, inView } = useSectionInView();

  return (
    <section id="home-categories" className="scroll-mt-20 bg-stone-50 py-12 lg:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-8 flex items-end justify-between"
        >
          <motion.div variants={fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Khám phá theo chủ đề</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Chọn lĩnh vực bạn yêu thích để tìm sự kiện nhanh hơn</p>
          </motion.div>
          <motion.div variants={fadeIn}>
            <Link href="/events" className="hidden items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 md:inline-flex">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {CATEGORIES.map((c) => (
            <motion.div key={c.key} variants={cardVariant}>
              <Link
                href={`/events?category=${c.key}`}
                className="group flex h-full flex-col items-center rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-stone-300 hover:shadow-lift"
              >
                <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-4 transition-transform duration-300 group-hover:scale-110 ${c.accent} ${c.ring}`}>
                  <i className={`${c.icon} text-xl`} aria-hidden />
                </div>
                <div className="mt-3 font-semibold text-stone-900">{c.label}</div>
                <div className="mt-0.5 text-xs text-stone-500">{c.count} sự kiện</div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
