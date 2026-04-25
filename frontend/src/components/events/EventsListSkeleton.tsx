'use client';

import { Shimmer } from '@/components/ui/Shimmer';
import type { ViewMode } from '@/lib/utils/eventsFilters';

export function EventsListSkeleton({ view, count = 6 }: { view: ViewMode; count?: number }) {
  return (
    <div className={view === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
      {Array.from({ length: count }).map((_, i) =>
        view === 'grid' ? (
          <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
            <Shimmer className="aspect-[4/3] w-full rounded-none" />
            <div className="flex flex-col gap-2.5 p-4">
              <Shimmer className="h-3 w-16 rounded-full" />
              <Shimmer className="h-4 w-full rounded" />
              <Shimmer className="h-4 w-3/4 rounded" />
              <Shimmer className="mt-1 h-3 w-24 rounded" />
              <Shimmer className="mt-3 h-6 w-24 rounded-full" />
            </div>
          </div>
        ) : (
          <div key={i} className="flex gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-soft">
            <Shimmer className="aspect-[4/3] w-40 flex-shrink-0 rounded-xl sm:w-56" />
            <div className="flex flex-1 flex-col gap-2.5 py-1">
              <Shimmer className="h-3 w-16 rounded-full" />
              <Shimmer className="h-5 w-full rounded" />
              <Shimmer className="h-4 w-3/4 rounded" />
              <Shimmer className="mt-auto h-6 w-24 rounded-full" />
            </div>
          </div>
        )
      )}
    </div>
  );
}
