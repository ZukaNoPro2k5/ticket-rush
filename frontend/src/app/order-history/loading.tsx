import { Shimmer } from '@/components/ui/Shimmer';

export default function OrderHistoryLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Shimmer className="hidden h-64 rounded-2xl lg:block" />
        <div className="space-y-6">
          <Shimmer className="h-7 w-56 rounded" />
          <div className="flex gap-2">
            {[80, 110, 100, 70].map((w, i) => (
              <Shimmer key={i} className="h-8 rounded-full" style={{ width: w }} />
            ))}
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Shimmer key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
