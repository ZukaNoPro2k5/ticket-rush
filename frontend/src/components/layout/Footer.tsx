'use client';

import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { FOOTER_LINKS } from '@/data/uiConfig';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white"><Ticket className="h-5 w-5" /></span>
              TicketRush
            </div>
            <p className="mt-3 text-sm text-stone-400">Nền tảng đặt vé sự kiện trực tuyến hàng đầu Việt Nam — nhanh, an toàn, minh bạch.</p>
            <div className="mt-4 flex items-center gap-2">
              {['fa-brands fa-facebook-f', 'fa-brands fa-instagram', 'fa-brands fa-youtube', 'fa-brands fa-x-twitter', 'fa-brands fa-tiktok'].map((c) => (
                <a key={c} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-stone-700 transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:text-amber-400">
                  <i className={`${c} text-sm`} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.company.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.discover.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.support.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-stone-800 pt-6 text-xs text-stone-500 md:flex-row md:items-center">
          <div>© 2026 TicketRush · Đồ án môn INT3306 · UET, ĐHQGHN</div>
          <div className="flex items-center gap-3">
            <span className="text-stone-600">Thanh toán:</span>
            {['Visa', 'Mastercard', 'Momo', 'ZaloPay', 'VNPay'].map((p) => (
              <span key={p} className="rounded-md border border-stone-700 px-2 py-1 text-[10px] font-semibold text-stone-400">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
