'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function MaintenancePage() {
  const { messages } = useLocale();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hydrated && user?.role === 'admin') router.replace('/admin');
  }, [hydrated, user, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-amber-50 to-stone-50 px-4">
      <section className="w-full max-w-2xl rounded-3xl border border-amber-100 bg-white p-6 text-center shadow-soft sm:p-10">
        <div className="mx-auto mb-6 h-48 w-full max-w-sm">
          <svg viewBox="0 0 360 190" className="h-full w-full" role="img" aria-label={messages.maintenance.imageAlt}>
            <rect x="34" y="34" width="292" height="122" rx="24" fill="#fffbeb" />
            <rect x="58" y="57" width="244" height="76" rx="18" fill="#fff" stroke="#fcd34d" strokeWidth="3" />
            <path d="M82 118h196" stroke="#e7e5e4" strokeWidth="7" strokeLinecap="round" />
            <circle cx="180" cy="95" r="27" fill="#f59e0b" />
            <path d="M168 94l8 8 18-20" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="82" cy="35" r="13" fill="#fde68a" />
            <circle cx="288" cy="151" r="11" fill="#fdba74" />
            <path d="M72 23l11 11m0-11L72 34M280 142l13 13m0-13-13 13" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <Wrench className="h-3.5 w-3.5" />
          {messages.maintenance.eyebrow}
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-stone-900 sm:text-3xl">{messages.maintenance.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-stone-600 sm:text-base">
          {messages.maintenance.intro}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/login" className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
            {messages.nav.login}
          </Link>
          <button onClick={() => window.location.reload()} className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
            {messages.common.retry}
          </button>
        </div>
      </section>
    </main>
  );
}
