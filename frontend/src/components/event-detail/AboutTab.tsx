import type { DisplayEvent } from '@/types';
import Link from 'next/link';
import { Building2, Clock, Info, Star, Users } from 'lucide-react';
import { formatVnd} from '@/data/uiConfig';
import { DETAIL_ZONES } from '@/data/eventDetailData';

interface Props {
  event: DisplayEvent;
}

const FEATURE_ICONS = [
  { icon: Users, label: '15,000+ khán giả' },
  { icon: Clock, label: 'Thời lượng 3 tiếng' },
  { icon: Building2, label: 'SVĐ ngoài trời' },
  { icon: Info, label: 'Độ tuổi 12+' },
];

export function AboutTab({ event }: Props) {
  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Intro */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
        <h2 className="font-display text-xl font-bold">Giới thiệu sự kiện</h2>
        <div className="mt-4 space-y-4 text-stone-700 leading-relaxed">
          <p>
            Chào mừng quý khán giả đến với <strong>{event.title}</strong> — một trong những sự kiện được mong chờ nhất năm 2026. Diễn ra tại <strong>{event.venue}</strong>, đây sẽ là đêm bùng nổ cảm xúc với âm thanh ánh sáng đỉnh cao, quy tụ dàn nghệ sĩ hàng đầu trong và ngoài nước.
          </p>
          <p>
            Ban tổ chức đã chuẩn bị một sân khấu quy mô lớn với công nghệ LED 4K, hệ thống âm thanh Line Array chuẩn quốc tế, cùng đội ngũ sản xuất giàu kinh nghiệm từng thực hiện nhiều chương trình lớn như Monsoon Music Festival, HAY Festival và nhiều sự kiện quốc tế khác.
          </p>
          <p>
            Đặc biệt, trong đêm diễn sẽ có phần giao lưu Meet-and-Greet — cơ hội hiếm có để khán giả gặp gỡ trực tiếp các nghệ sĩ thần tượng. Đừng bỏ lỡ!
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURE_ICONS.map((f, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-center">
              <f.icon className="mx-auto h-5 w-5 text-amber-600" />
              <div className="mt-1 text-xs font-semibold text-stone-700">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zones */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Hạng vé & giá</h2>
          <Link href={`/events/${event.id}/seats`} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
            Xem sơ đồ ghế →
          </Link>
        </div>
        <div className="space-y-3">
          {DETAIL_ZONES.map((z) => {
            const soldPct = Math.round(((z.total - z.available) / z.total) * 100);
            return (
              <div key={z.name} className="flex items-center gap-4 rounded-2xl border border-stone-200 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30">
                <div className={`h-12 w-2 flex-shrink-0 rounded-full ${z.color}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate font-semibold text-stone-900">{z.name}</h4>
                    <div className="font-display text-lg font-bold text-amber-700">{formatVnd(z.price)}</div>
                  </div>
                  <div className="mt-0.5 text-xs text-stone-500">{z.desc}</div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-500">
                    <span>Còn {z.available}/{z.total}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full rounded-full ${soldPct >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`} style={{ width: `${soldPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organizer */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
        <h2 className="mb-4 font-display text-xl font-bold">Đơn vị tổ chức</h2>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 font-display text-xl font-bold text-white shadow-lift">
            {(event.organizer ?? 'TR').charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-stone-900">{event.organizer ?? 'TicketRush Events'}</h3>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-stone-500">
              <span>12 sự kiện đã tổ chức</span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 4.9
              </span>
            </div>
          </div>
          <button className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-amber-500 hover:text-amber-700">
            Theo dõi
          </button>
        </div>
      </div>
    </div>
  );
}
