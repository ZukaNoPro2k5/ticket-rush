'use client';

import { useLocale } from '@/components/providers/LocaleProvider';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EventsPagination({ currentPage, totalPages, onPageChange }: Props) {
  const { messages } = useLocale();

  if (totalPages <= 1) return null;

  const visiblePages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
  const showEllipsis = totalPages > 7;

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label={messages.events.pagePrevious}
        className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-900 disabled:opacity-40"
      >
        ‹
      </button>

      {visiblePages.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`h-10 min-w-[2.5rem] rounded-full px-3 text-sm font-semibold ${
            n === currentPage
              ? 'bg-stone-900 text-white'
              : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          {n}
        </button>
      ))}

      {showEllipsis && <span className="px-1 text-stone-400">…</span>}
      {showEllipsis && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={`h-10 min-w-[2.5rem] rounded-full px-3 text-sm font-semibold ${
            totalPages === currentPage
              ? 'bg-stone-900 text-white'
              : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          {totalPages}
        </button>
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label={messages.events.pageNext}
        className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-900 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
