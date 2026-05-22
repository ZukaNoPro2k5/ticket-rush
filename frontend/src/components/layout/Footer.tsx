'use client';

import Link from 'next/link';
import { Headphones, ShieldCheck, Ticket } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

export function Footer() {
  const { messages } = useLocale();
  const links = {
    company: [
      { label: messages.footer.about, href: '/about' },
      { label: messages.nav.news, href: '/news' },
      { label: messages.footer.contact, href: '/help' },
    ],
    discover: [
      { label: messages.common.allEvents, href: '/events' },
      { label: messages.footer.hotEvents, href: '/events?sort=trending' },
      { label: messages.footer.upcoming, href: '/events?sort=upcoming' },
      { label: messages.footer.budgetTickets, href: '/events?sort=priceAsc' },
    ],
    support: [
      { label: messages.footer.helpCenter, href: '/help' },
      { label: messages.footer.buyingGuide, href: '/help#buying' },
      { label: messages.footer.refundPolicy, href: '/refund-policy' },
      { label: messages.footer.terms, href: '/terms' },
    ],
  };

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white"><Ticket className="h-5 w-5" /></span>
              TicketRush
            </div>
            <p className="mt-3 text-sm text-stone-400">{messages.footer.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> {messages.footer.transparentSeatHold}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 px-3 py-1.5">
                <Headphones className="h-3.5 w-3.5" /> {messages.footer.clearSupport}
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">{messages.footer.company}</h4>
            <ul className="space-y-2 text-sm">
              {links.company.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">{messages.footer.discover}</h4>
            <ul className="space-y-2 text-sm">
              {links.discover.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">{messages.footer.support}</h4>
            <ul className="space-y-2 text-sm">
              {links.support.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-stone-800 pt-6 text-xs text-stone-500 md:flex-row md:items-center">
          <div>&copy; 2026 TicketRush. {messages.footer.project}</div>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="rounded-md border border-stone-700 px-2 py-1 text-[10px] font-semibold">{messages.footer.realtimeSeatHold}</span>
            <span className="rounded-md border border-stone-700 px-2 py-1 text-[10px] font-semibold">{messages.footer.digitalQr}</span>
            <span className="rounded-md border border-stone-700 px-2 py-1 text-[10px] font-semibold">{messages.footer.virtualQueue}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
