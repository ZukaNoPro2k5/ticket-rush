import { cn } from '@/lib/utils/cn';

interface ShimmerProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Shimmer skeleton block — gradient sweeps left→right continuously.
 * Drop-in replacement for `animate-pulse` blocks.
 *
 * Usage:
 *   <Shimmer className="h-4 w-32 rounded-full" />
 *   <Shimmer className="aspect-[4/3] w-full rounded-2xl" />
 */
export function Shimmer({ className, style }: ShimmerProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%]',
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  );
}
