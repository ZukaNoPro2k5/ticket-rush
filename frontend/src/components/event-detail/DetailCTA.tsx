import type { DisplayEvent } from '@/types';
import Link from 'next/link';
import { ArrowRight, Check, Heart } from 'lucide-react';
import { formatVnd} from '@/data/uiConfig';

interface Props {
  event: DisplayEvent;
  minPrice: number;
  maxPrice: number;
}

export function DetailSidebarCTA({ event, minPrice, maxPrice }: Props) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lift">
          <div className="text-[11px] uppercase tracking-wider text-stone-500">Giá vé</div>
          <div className="mt-1 font-display text-2xl font-bold text-stone-900">
            {formatVnd(minPrice)}{' '}
            <span className="text-sm font-medium text-stone-500">- {formatVnd(maxPrice)}</span>
          </div>

          <div className="mt-4 space-y-2 rounded-2xl bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-sm text-amber-900">
              <Check className="h-4 w-4" /> Miễn phí đổi trả trong 24h
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-900">
              <Check className="h-4 w-4" /> Nhận QR ngay sau thanh toán
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-900">
              <Check className="h-4 w-4" /> Hỗ trợ 24/7
            </div>
          </div>

          <Link
            href={`/events/${event.id}/seats`}
            className="mt-5 group flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-600"
          >
            Chọn vé ngay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400">
            <Heart className="h-4 w-4" /> Lưu sự kiện
          </button>

          <div className="mt-5 border-t border-stone-100 pt-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Tiến độ bán vé
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{event.soldPercent}% đã bán</span>
              {event.soldPercent >= 80 && (
                <span className="text-xs font-bold text-orange-600">Sắp cháy vé</span>
              )}
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full ${event.soldPercent >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`}
                style={{ width: `${event.soldPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileStickyCTA({ eventId, minPrice }: { eventId: number; minPrice: number }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-lift lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Từ</div>
          <div className="font-display text-lg font-bold text-amber-700">{formatVnd(minPrice)}</div>
        </div>
        <Link
          href={`/events/${eventId}/seats`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-white shadow-lift transition-all hover:bg-amber-600"
        >
          Chọn vé ngay <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
