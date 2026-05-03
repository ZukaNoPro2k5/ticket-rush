import { Shimmer } from '@/components/ui/Shimmer';

export default function PromotionsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <Shimmer className="h-8 w-64 rounded" />
      <Shimmer className="mt-2 h-4 w-80 rounded" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Shimmer key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
