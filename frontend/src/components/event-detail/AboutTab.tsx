import type { DisplayEvent, SeatZone } from '@/types';
import Link from 'next/link';
import { Building2, Clock, Info, Star, Users } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

type ZoneWithStats = SeatZone & {
  available_seats?: number | null;
  total_seats?: number | null;
};

interface Props {
  event: DisplayEvent;
  description?: string | null;
  zones: ZoneWithStats[];
  holdMinutes: number;
}

function getFeatureIcons(holdMinutes: number, messages: ReturnType<typeof useLocale>['messages']) {
  return [
    { icon: Users, label: messages.eventDetail.clearSeatMap },
    { icon: Clock, label: messages.eventDetail.holdForMinutes(holdMinutes) },
    { icon: Building2, label: messages.eventDetail.realtimeUpdates },
    { icon: Info, label: messages.eventDetail.qrAfterConfirmation },
  ];
}

export function AboutTab({ event, description, zones, holdMinutes }: Props) {
  const { formatCurrency, messages } = useLocale();
  const featureIcons = getFeatureIcons(holdMinutes, messages);

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
        <h2 className="font-display text-xl font-bold">{messages.eventDetail.eventIntro}</h2>
        <div className="mt-4 space-y-4 text-stone-700 leading-relaxed">
          {description ? (
            description.split(/\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ) : (
            <p>
              <strong>{event.title}</strong> {messages.eventDetail.fallbackIntroPrefix}{' '}
              <strong>{event.venue}</strong>. {messages.eventDetail.fallbackIntroSuffix}
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {featureIcons.map((f) => (
            <div key={f.label} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-center">
              <f.icon className="mx-auto h-5 w-5 text-amber-600" />
              <div className="mt-1 text-xs font-semibold text-stone-700">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{messages.eventDetail.ticketTiers}</h2>
          <Link href={`/events/${event.id}/seats`} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
            {messages.eventDetail.viewSeatMap} →
          </Link>
        </div>
        {zones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
            {messages.eventDetail.noSeatZones}
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((z) => {
              const total = z.total_seats ?? z.total_rows * z.total_cols;
              const available = z.available_seats ?? null;
              const soldPct = available === null || total <= 0 ? 0 : Math.round(((total - available) / total) * 100);
              return (
                <div
                  key={z.id}
                  className="flex items-center gap-4 rounded-2xl border border-stone-200 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30"
                >
                  <div className="h-12 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: z.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate font-semibold text-stone-900">{z.name}</h4>
                      <div className="font-display text-lg font-bold text-amber-700">{formatCurrency(z.price)}</div>
                    </div>
                    <div className="mt-0.5 text-xs text-stone-500">
                      {z.total_rows} {messages.eventDetail.rows} × {z.total_cols} {messages.eventDetail.seats},{' '}
                      {messages.eventDetail.total} {total} {messages.eventDetail.spots}
                    </div>
                    {available !== null && (
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-500">
                        <span>{messages.eventDetail.available} {available}/{total}</span>
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={`h-full rounded-full ${soldPct >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`}
                            style={{ width: `${soldPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
        <h2 className="mb-4 font-display text-xl font-bold">{messages.eventDetail.organizer}</h2>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 font-display text-xl font-bold text-white shadow-lift">
            {(event.organizer ?? 'TR').charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-stone-900">{event.organizer ?? 'TicketRush Events'}</h3>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-stone-500">
              <span>{messages.eventDetail.organizerManaged}</span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
