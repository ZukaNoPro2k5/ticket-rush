'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ticket, ShieldCheck, Sparkles, Zap, Star } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';

const BENEFITS = [
  { icon: Zap,         title: 'Đặt vé trong 30 giây',    desc: 'Checkout nhanh, không lag, giữ ghế tức thì.' },
  { icon: ShieldCheck, title: 'Đặt vé an toàn',          desc: 'Không bán trùng ghế, QR sinh ngay sau xác nhận.' },
  { icon: Sparkles,    title: 'Gợi ý theo sở thích',     desc: 'Ưu tiên sự kiện hợp gu từ dữ liệu bạn chọn.' },
];

/**
 * Split-screen layout for /login, /register, /onboarding.
 * Left: warm cream hero with value props (desktop only).
 * Right: form content (full-width on mobile).
 */
export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-stone-50 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ───── Left pane — warm, light, welcoming ───── */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12
                        bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-stone-900">
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-rose-300/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />

        {/* Subtle grain / dot pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(68,64,60,0.35) 1px, transparent 0)',
            backgroundSize:  '22px 22px',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="relative"
        >
          <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-stone-900">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white shadow-lift ring-1 ring-amber-500/30">
              <Ticket className="h-5 w-5" strokeWidth={2.5} />
            </span>
            TicketRush
          </Link>
        </motion.div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.1 }}
          className="relative max-w-lg"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Nền tảng vé sự kiện #1 Việt Nam
          </span>

          <h2 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.1] tracking-tight text-stone-900">
            Mọi sự kiện đỉnh nhất,
            <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              trong tầm tay bạn.
            </span>
          </h2>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-stone-600">
            Khám phá concert, workshop và trận đấu hot trong một luồng đặt vé gọn, rõ và cập nhật theo thời gian thực.
          </p>

          {/* Benefits */}
          <div className="mt-9 space-y-3.5">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/50 p-3.5 shadow-sm backdrop-blur transition-all hover:bg-white/80 hover:shadow-md"
                >
                  <span className="mt-0.5 grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">{b.title}</div>
                    <div className="text-xs leading-relaxed text-stone-600">{b.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Social proof footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative flex items-center gap-4"
        >
          <div className="flex -space-x-2.5">
            {[
              'from-amber-400 to-orange-500',
              'from-rose-400 to-pink-500',
              'from-sky-400 to-indigo-500',
              'from-emerald-400 to-teal-500',
            ].map((grad, i) => (
              <div
                key={i}
                className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-gradient-to-br ${grad} text-xs font-bold text-white shadow-sm`}
              >
                {['T', 'M', 'L', 'H'][i]}
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1.5 text-xs font-bold text-stone-900">4.9</span>
            </div>
            <span className="text-xs text-stone-600">+1,200 sự kiện đang mở bán</span>
          </div>
        </motion.div>
      </aside>

      {/* ───── Right pane — form ───── */}
      <section className="flex min-h-screen flex-col lg:min-h-0">
        {/* Top bar on mobile shows logo only */}
        <header className="flex items-center justify-between px-4 py-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold text-stone-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-white">
              <Ticket className="h-4 w-4" strokeWidth={2.5} />
            </span>
            TicketRush
          </Link>
          <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900">← Về trang chủ</Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-stone-900 md:text-[32px]">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-stone-500 md:text-base">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-sm text-stone-500">{footer}</div>}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
