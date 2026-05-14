import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

export type EmptyVariant = 'bookings' | 'reviews' | 'events' | 'users' | 'promos' | 'generic';

interface Props {
  variant?: EmptyVariant;
  headline: string;
  subtext?: string;
  action?: ReactNode;
  className?: string;
}

function TicketSvg() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      {/* Ticket body */}
      <rect x="6" y="20" width="60" height="32" rx="5" fill="#e7e5e4" />
      {/* Notch cutouts */}
      <circle cx="6" cy="36" r="6" fill="white" />
      <circle cx="66" cy="36" r="6" fill="white" />
      {/* Dashed divider */}
      <line x1="15" y1="36" x2="57" y2="36" stroke="#a8a29e" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
      {/* Content lines */}
      <rect x="18" y="25" width="22" height="3.5" rx="1.75" fill="#d6d3d1" />
      <rect x="18" y="31" width="14" height="2.5" rx="1.25" fill="#d6d3d1" />
      <rect x="18" y="41" width="10" height="2.5" rx="1.25" fill="#d6d3d1" />
      <rect x="31" y="41" width="8" height="2.5" rx="1.25" fill="#fbbf24" opacity="0.7" />
      {/* Right barcode lines */}
      <rect x="48" y="25" width="2" height="10" rx="1" fill="#d6d3d1" />
      <rect x="52" y="25" width="1.5" height="10" rx="0.75" fill="#d6d3d1" />
      <rect x="55" y="25" width="2.5" height="10" rx="1" fill="#d6d3d1" />
    </svg>
  );
}

function StarSvg() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      {/* Speech bubble */}
      <rect x="8" y="10" width="56" height="40" rx="8" fill="#e7e5e4" />
      <path d="M20 50 L16 60 L30 54" fill="#e7e5e4" />
      {/* Star */}
      <polygon
        points="36,18 39.5,28 50,28 41.5,34.5 44.5,44.5 36,38 27.5,44.5 30.5,34.5 22,28 32.5,28"
        fill="#d6d3d1"
      />
      {/* Amber top star point accent */}
      <polygon
        points="36,18 38.1,24.6 44,24.6"
        fill="#fbbf24"
        opacity="0.6"
      />
    </svg>
  );
}

function CalendarSvg() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      {/* Calendar body */}
      <rect x="8" y="16" width="56" height="48" rx="6" fill="#e7e5e4" />
      {/* Header bar */}
      <rect x="8" y="16" width="56" height="16" rx="6" fill="#d6d3d1" />
      <rect x="8" y="24" width="56" height="8" fill="#d6d3d1" />
      {/* Pin tabs */}
      <rect x="22" y="10" width="5" height="12" rx="2.5" fill="#a8a29e" />
      <rect x="45" y="10" width="5" height="12" rx="2.5" fill="#a8a29e" />
      {/* Date cells */}
      <rect x="16" y="40" width="10" height="8" rx="2" fill="#fbbf24" opacity="0.55" />
      <rect x="31" y="40" width="10" height="8" rx="2" fill="#d6d3d1" />
      <rect x="46" y="40" width="10" height="8" rx="2" fill="#d6d3d1" />
      <rect x="16" y="52" width="10" height="8" rx="2" fill="#d6d3d1" />
      <rect x="31" y="52" width="10" height="8" rx="2" fill="#d6d3d1" />
    </svg>
  );
}

function UsersSvg() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      {/* Back person */}
      <circle cx="46" cy="22" r="10" fill="#e7e5e4" />
      <path d="M26 62c0-11.1 9-20 20-20s20 8.9 20 20" fill="#e7e5e4" />
      {/* Front person */}
      <circle cx="26" cy="26" r="12" fill="#d6d3d1" />
      <path d="M2 62c0-13.3 10.7-24 24-24s24 10.7 24 24" fill="#d6d3d1" />
      {/* Amber + badge */}
      <circle cx="54" cy="50" r="9" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" />
      <line x1="50" y1="50" x2="58" y2="50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="46" x2="54" y2="54" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PromoSvg() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      {/* Tag shape */}
      <path d="M12 12 L12 44 L36 64 L60 40 L40 16 L12 12Z" fill="#e7e5e4" />
      {/* Hole */}
      <circle cx="24" cy="24" r="5" fill="white" />
      {/* Dashed diagonal */}
      <line x1="24" y1="44" x2="44" y2="24" stroke="#a8a29e" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
      {/* Discount circles */}
      <circle cx="24" cy="44" r="4.5" fill="#d6d3d1" />
      <circle cx="44" cy="24" r="4.5" fill="#fbbf24" opacity="0.7" />
    </svg>
  );
}

function GenericSvg() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      {/* Box */}
      <rect x="12" y="18" width="48" height="44" rx="5" fill="#e7e5e4" />
      {/* Lines */}
      <rect x="20" y="30" width="32" height="3.5" rx="1.75" fill="#d6d3d1" />
      <rect x="20" y="38" width="22" height="3.5" rx="1.75" fill="#d6d3d1" />
      <rect x="20" y="46" width="16" height="3.5" rx="1.75" fill="#d6d3d1" />
      {/* Amber sparkle */}
      <circle cx="54" cy="20" r="9" fill="#fef3c7" />
      <path d="M54 14l1.2 4h4.2l-3.4 2.5 1.3 4L54 22l-3.3 2.5 1.3-4-3.4-2.5h4.2z" fill="#fbbf24" />
    </svg>
  );
}

const SVGS: Record<EmptyVariant, () => JSX.Element> = {
  bookings: TicketSvg,
  reviews:  StarSvg,
  events:   CalendarSvg,
  users:    UsersSvg,
  promos:   PromoSvg,
  generic:  GenericSvg,
};

export default function EmptyState({ variant = 'generic', headline, subtext, action, className }: Props) {
  const Svg = SVGS[variant];
  return (
    <div className={cn('flex flex-col items-center gap-3 py-16 text-center', className)}>
      <Svg />
      <div className="space-y-1">
        <p className="font-semibold text-stone-600">{headline}</p>
        {subtext && <p className="text-sm text-stone-400">{subtext}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
