import { Shimmer } from '@/components/ui/Shimmer';

// Server-rendered Suspense fallback. Hiển thị ngay khi user click vào route,
// thay vì màn trắng trong khi Next chunk + page bundle đang load.
export default function MyTicketsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar placeholder */}
        <Shimmer className="hidden h-64 rounded-2xl lg:block" />

        <div className="space-y-6">
          <Shimmer className="h-7 w-48 rounded" />
          <div className="flex gap-2">
            {[80, 100, 80, 70].map((w, i) => (
              <Shimmer key={i} className="h-8 rounded-full" style={{ width: w }} />
            ))}
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Shimmer key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
