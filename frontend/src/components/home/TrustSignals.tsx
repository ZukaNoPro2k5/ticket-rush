'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Headphones, RotateCcw, ShieldCheck } from 'lucide-react';
import { TRUST_SIGNALS } from '@/data/uiConfig';
import { cardVariant, staggerContainer, useSectionInView } from '@/lib/motion';

const ICON_MAP: Record<string, ReactNode> = {
  'shield-check': <ShieldCheck className="h-6 w-6" />,
  'rotate-ccw':   <RotateCcw className="h-6 w-6" />,
  'headphones':   <Headphones className="h-6 w-6" />,
};

export function TrustSignals() {
  const { ref, inView } = useSectionInView();
  return (
    <section className="border-y border-stone-200 bg-white py-12">
      <motion.div
        ref={ref}
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 lg:px-8"
      >
        {TRUST_SIGNALS.map((t) => (
          <motion.div key={t.title} variants={cardVariant} className="flex items-start gap-4 rounded-2xl p-2">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700 ring-4 ring-amber-50">
              {ICON_MAP[t.icon]}
            </div>
            <div>
              <div className="font-semibold text-stone-900">{t.title}</div>
              <div className="mt-0.5 text-sm text-stone-500">{t.desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
