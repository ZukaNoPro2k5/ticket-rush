import { useInView } from 'framer-motion';
import { useRef } from 'react';

// Shared Framer Motion tokens used across the app.
// Follow design-principles.instructions.md §4 — do NOT redefine locally.

export const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const staggerContainer = (stagger = 0.05, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE_OUT_EXPO } },
};

// Hook: trigger visibility once when element enters viewport.
export function useSectionInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return { ref, inView };
}
