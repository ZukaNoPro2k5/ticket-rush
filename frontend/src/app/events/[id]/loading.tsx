import { Shimmer } from '@/components/ui/Shimmer';

// Renders instantly while event detail data loads (Next.js Suspense boundary).

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-40 h-16 border-b border-stone-200 bg-white/95 backdrop-blur-md" />

      {/* Hero */}
      <div className="relative h-72 w-full overflow-hidden bg-stone-200 md:h-96">
        <Shimmer className="h-full w-full rounded-none" />
        {/* Gradient overlay consistent with real page */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8 md:px-8">
          <Shimmer className="mb-2 h-4 w-24 rounded-full opacity-60" />
          <Shimmer className="h-8 w-3/4 max-w-xl rounded-lg opacity-70" />
          <Shimmer className="mt-2 h-5 w-1/2 max-w-sm rounded opacity-60" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Tabs row */}
            <div className="flex gap-6 border-b border-stone-200 pb-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Shimmer key={i} className="h-8 w-16 rounded" />
              ))}
            </div>

            {/* Content block */}
            <div className="space-y-3">
              <Shimmer className="h-4 w-full rounded" />
              <Shimmer className="h-4 w-full rounded" />
              <Shimmer className="h-4 w-5/6 rounded" />
              <Shimmer className="h-4 w-4/5 rounded" />
              <Shimmer className="mt-4 h-4 w-full rounded" />
              <Shimmer className="h-4 w-3/4 rounded" />
            </div>

            {/* Zone grid placeholder */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <Shimmer className="h-3 w-3 rounded-full" />
                    <Shimmer className="h-4 w-36 rounded" />
                  </div>
                  <Shimmer className="h-3 w-full rounded mb-2" />
                  <Shimmer className="h-6 w-28 rounded mt-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar sticky CTA */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft">
              <Shimmer className="h-5 w-32 rounded mb-4" />
              <div className="space-y-3 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Shimmer className="h-4 w-28 rounded" />
                    <Shimmer className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
              <Shimmer className="h-12 w-full rounded-xl" />
              <Shimmer className="mt-3 h-4 w-40 mx-auto rounded" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
