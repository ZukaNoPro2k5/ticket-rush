import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}
