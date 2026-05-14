import { cn } from '@/lib/utils/cn';

type BadgeVariant =
  | 'default' | 'success' | 'warning' | 'danger' | 'info'
  | 'active' | 'draft' | 'ended' | 'cancelled' | 'pending' | 'expired';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default:   { bg: 'bg-stone-100',  text: 'text-stone-600',   dot: 'bg-stone-400' },
  success:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  danger:    { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  info:      { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500' },
  active:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  draft:     { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-400' },
  ended:     { bg: 'bg-stone-100',  text: 'text-stone-600',   dot: 'bg-stone-400' },
  cancelled: { bg: 'bg-rose-50',    text: 'text-rose-600',    dot: 'bg-rose-400' },
  pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  expired:   { bg: 'bg-stone-100',  text: 'text-stone-500',   dot: 'bg-stone-300' },
};

const sizes = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        s.bg, s.text, sizes[size], className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', s.dot)} />}
      {children}
    </span>
  );
}
