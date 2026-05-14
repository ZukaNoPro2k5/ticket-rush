import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type CardVariant = 'default' | 'muted' | 'elevated' | 'hoverable';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  default:   'bg-white border border-line shadow-soft',
  muted:     'bg-surface-50 border border-line',
  elevated:  'bg-white border border-line shadow-lift',
  hoverable: 'bg-white border border-line shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200',
};

export default function Card({ children, className, padding = true, variant = 'default' }: CardProps) {
  return (
    <div className={cn('rounded-2xl', variants[variant], padding ? 'p-5' : '', className)}>
      {children}
    </div>
  );
}
