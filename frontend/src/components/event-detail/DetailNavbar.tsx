'use client';

import Link from 'next/link';
import { Heart, Share2, Ticket } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

export function DetailNavbar() {
  const { messages } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white shadow-lift">
            <Ticket className="h-5 w-5" strokeWidth={2.5} />
          </span>
          TicketRush
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">
            {messages.common.home}
          </Link>
          <Link href="/events" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">
            {messages.eventDetail.events}
          </Link>
          <Link href="/admin/events" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">
            {messages.eventDetail.organize}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <button aria-label={messages.eventDetail.save} className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-stone-400 hover:text-rose-500">
            <Heart className="h-4 w-4" />
          </button>
          <button aria-label={messages.eventDetail.share} className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
