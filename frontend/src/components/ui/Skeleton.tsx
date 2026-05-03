import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-stone-200/80',
        className,
      )}
      style={style}
    />
  );
}

/** A prebuilt card skeleton for event cards */
export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-soft">
      <Skeleton className="h-44 rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** A prebuilt row skeleton for ticket/booking list items */
export function TicketRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-4 shadow-soft">
      <Skeleton className="h-14 w-14 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-7 w-20 rounded-full" />
    </div>
  );
}

/** Review card skeleton */
export function ReviewCardSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="ml-auto h-3 w-20" />
      </div>
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
