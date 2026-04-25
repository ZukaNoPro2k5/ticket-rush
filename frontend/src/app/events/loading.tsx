import { Shimmer } from '@/components/ui/Shimmer';

// This file is automatically used by Next.js App Router as a Suspense boundary.
// It renders instantly (server-side) while the page's async data loads.

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
      <Shimmer className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2.5 p-4">
        <Shimmer className="h-3 w-16 rounded-full" />
        <Shimmer className="h-4 w-full rounded" />
        <Shimmer className="h-4 w-3/4 rounded" />
        <Shimmer className="mt-1 h-3 w-28 rounded" />
        <Shimmer className="mt-3 h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar placeholder — keeps layout stable */}
      <div className="sticky top-0 z-40 h-16 border-b border-stone-200 bg-white/95 backdrop-blur-md" />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <Shimmer className="h-8 w-48 rounded-lg" />
          <Shimmer className="mt-2 h-4 w-64 rounded" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar filter skeleton */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
              <Shimmer className="mb-4 h-5 w-24 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Shimmer key={i} className="h-9 w-full rounded-xl" />
                ))}
              </div>
              <Shimmer className="mt-6 mb-4 h-5 w-20 rounded" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Shimmer key={i} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Result bar */}
            <div className="mb-5 flex items-center justify-between">
              <Shimmer className="h-5 w-36 rounded" />
              <div className="flex items-center gap-2">
                <Shimmer className="h-10 w-40 rounded-full" />
                <Shimmer className="h-10 w-20 rounded-full" />
              </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
