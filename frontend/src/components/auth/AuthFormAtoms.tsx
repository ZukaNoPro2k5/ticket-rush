'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

export const fieldClass = (err?: boolean) =>
  `h-11 w-full rounded-xl border bg-stone-50 text-sm text-stone-900 placeholder:text-stone-400
   transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2
   ${err
     ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
     : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'}`;

export function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 overflow-hidden text-xs text-rose-600"
        >
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function FormError({ message }: { message: string | null }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key="err"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SubmitBtnProps {
  submitting: boolean;
  succeeded: boolean;
  label: string;
}

export function SubmitBtn({ submitting, succeeded, label }: SubmitBtnProps) {
  const { messages } = useLocale();

  return (
    <motion.button
      type="submit"
      disabled={submitting || succeeded}
      whileTap={{ scale: 0.98 }}
      className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-amber-500 text-sm font-semibold text-white shadow-soft transition-all hover:bg-amber-600 disabled:pointer-events-none disabled:opacity-70"
    >
      <AnimatePresence mode="wait" initial={false}>
        {succeeded ? (
          <motion.span key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
            <Check className="h-4 w-4" /> {messages.auth.success}
          </motion.span>
        ) : submitting ? (
          <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {messages.auth.processing}
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
      <span className="h-px flex-1 bg-stone-200" />
      {label}
      <span className="h-px flex-1 bg-stone-200" />
    </div>
  );
}
