import { Shimmer } from '@/components/ui/Shimmer';

export function EventCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
      <Shimmer className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Shimmer className="h-3 w-16 rounded-full" />
        <Shimmer className="h-4 w-full rounded" />
        <Shimmer className="h-4 w-3/4 rounded" />
        <Shimmer className="mt-1 h-3 w-24 rounded" />
        <Shimmer className="mt-auto h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}
