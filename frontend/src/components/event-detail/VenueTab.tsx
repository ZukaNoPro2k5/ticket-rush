import type { DisplayEvent } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';

interface Props {
  event: DisplayEvent;
}

export function VenueTab({ event }: Props) {
  const { messages } = useLocale();
  const mapQuery = encodeURIComponent(`${event.venue}, ${event.city}`);
  const venueFacts = [
    { label: 'Check-in', value: messages.eventDetail.openBeforeShow },
    { label: messages.seats.ticket, value: messages.eventDetail.digitalQr },
    { label: messages.eventDetail.support, value: messages.eventDetail.organizerNotice },
  ];

  return (
    <div className="animate-fadeInUp space-y-5">
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft">
        <div className="relative aspect-[16/9] bg-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${mapQuery}&zoom=13&size=1200x600&maptype=roadmap&markers=color:0xd97706%7C${mapQuery}`}
            alt={messages.eventDetail.mapAlt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        </div>
        <div className="p-6">
          <h2 className="font-display text-xl font-bold">{event.venue}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {event.venue}, {event.city}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {venueFacts.map((x) => (
              <div key={x.label} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-stone-500">{x.label}</div>
                <div className="mt-0.5 font-semibold text-stone-900">{x.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
