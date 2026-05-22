 'use client';

import { useLocale } from '@/components/providers/LocaleProvider';

export function SeatsInfoBox({ holdMinutes, maxTickets }: { holdMinutes: number; maxTickets: number }) {
  const { messages } = useLocale();

  return (
    <div className="space-y-1.5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
      <p className="font-semibold">{messages.seats.notice}</p>
      <p>• {messages.seats.selectedHold(holdMinutes)}</p>
      <p>• {messages.seats.perTransaction(maxTickets)}</p>
      <p>• {messages.seats.holdReturn}</p>
    </div>
  );
}

export function SeatsLoading() {
  const { messages } = useLocale();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        <p className="text-sm text-gray-500">{messages.seats.loadingMap}</p>
      </div>
    </div>
  );
}
