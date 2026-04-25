'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Compass } from 'lucide-react';
import { CATEGORIES } from '@/data/uiConfig';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface Props {
  isActive: boolean;
  scrolled: boolean;
  linkCls: string;
}

export function ExploreDropdown({ isActive, scrolled, linkCls }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
          ${isActive ? (scrolled ? 'text-amber-700 bg-amber-50' : 'text-white bg-white/10') : linkCls}`}
      >
        <Compass className="h-4 w-4" /> Khám phá <ChevronDown className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-2 shadow-lift"
          >
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.key}
                  href={`/events?category=${c.key}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                >
                  <i className={`${c.icon} text-stone-500 w-4`} aria-hidden /> {c.label}
                </Link>
              ))}
            </div>
            <div className="mt-1 border-t border-stone-200 pt-1">
              <Link
                href="/events"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
              >
                Tất cả sự kiện <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
