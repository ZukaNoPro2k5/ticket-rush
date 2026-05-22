'use client';

import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import type { Seat } from '@/types';
import { formatMmSs } from '@/lib/utils/seatUtils';
import { useLocale } from '@/components/providers/LocaleProvider';
import { localeTag } from '@/lib/i18n';

interface Props {
  selectedSeats: Seat[];
  subtotal: number;
  eventTitle: string;
  venue: string;
  eventDate: string;
  countdown: number;
  submitting: boolean;
  onContinue: () => void;
  unitLabel?: string;
}

export function SelectingPanel({
  selectedSeats,
  subtotal,
  eventTitle,
  venue,
  eventDate,
  countdown,
  submitting,
  onContinue,
  unitLabel,
}: Props) {
  const { formatCurrency, locale, messages } = useLocale();
  const count = selectedSeats.length;
  const selectedSeatUnit = unitLabel ?? messages.seats.seatUnit;
  const isSeatUnit = selectedSeatUnit === messages.seats.seatUnit;

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-base font-bold font-mono ${
          countdown < 120 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
        }`}>
          <Clock3 className="h-5 w-5" />
          {formatMmSs(countdown)}
        </span>
        <button
          onClick={onContinue}
          disabled={submitting || count === 0}
          className="ml-auto min-h-11 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400"
        >
          {submitting ? messages.seats.updating : messages.seats.continuePayment}
        </button>
      </div>

      <div className="space-y-2 border-b border-stone-100 pb-4">
        <h2 className="font-display text-base font-bold leading-snug text-stone-900">{eventTitle}</h2>
        <p className="flex gap-2 text-sm text-stone-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{venue}</span>
        </p>
        <p className="flex gap-2 text-sm text-stone-500">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {new Intl.DateTimeFormat(localeTag(locale), {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(eventDate))}
          </span>
        </p>
      </div>

      <h2 className="font-semibold text-gray-800">{isSeatUnit ? messages.seats.selectedSeats : messages.seats.selectedTickets}</h2>

      {count === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {isSeatUnit ? messages.seats.seatHint : messages.seats.ticketHint}
        </p>
      ) : (
        <div className="max-h-52 space-y-1.5 overflow-y-auto">
          {selectedSeats.map((seat) => (
            <div key={seat.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seat.zone_color }} />
                {seat.zone_name} - {seat.row_label}
                {seat.col_number}
              </span>
              <span className="shrink-0 font-medium text-gray-800">
                {formatCurrency(seat.zone_price)}
              </span>
            </div>
          ))}
        </div>
      )}

      {count > 0 && (
        <div className="flex justify-between border-t pt-3 font-bold">
          <span className="text-gray-700">{messages.seats.subtotal} ({count} {selectedSeatUnit})</span>
          <span className="text-orange-600">{formatCurrency(subtotal)}</span>
        </div>
      )}

    </div>
  );
}
