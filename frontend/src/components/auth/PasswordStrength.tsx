'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { passwordChecks, strengthScore } from './authUtils';
import { useLocale } from '@/components/providers/LocaleProvider';

interface Props {
  password: string;
  visible: boolean;
}

export function PasswordStrength({ password, visible }: Props) {
  const { messages } = useLocale();
  const checks = passwordChecks(password, [
    messages.auth.passwordMin,
    messages.auth.passwordUpper,
    messages.auth.passwordNumber,
  ]);
  const score = strengthScore(password);

  const strengthLabel =
    score === 1
      ? messages.auth.passwordStrengthWeak
      : score === 2
        ? messages.auth.passwordStrengthMedium
        : score === 3
          ? messages.auth.passwordStrengthStrong
          : '';
  const strengthColor =
    score <= 1 ? 'bg-rose-500' : score === 2 ? 'bg-amber-500' : 'bg-emerald-500';
  const strengthTextColor =
    score >= 3 ? 'text-emerald-600' : score >= 2 ? 'text-amber-700' : 'text-rose-600';

  return (
    <AnimatePresence>
      {visible && password && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2.5 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1 w-[50px] rounded-full transition-all duration-300 ${i < score ? strengthColor : 'bg-stone-200'}`}
                />
              ))}
            </div>
            {strengthLabel && (
              <span className={`text-[11px] font-semibold ${strengthTextColor}`}>{strengthLabel}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {checks.map((c) => (
              <span
                key={c.label}
                className={`flex items-center gap-1.5 text-[11px] transition-colors ${c.pass ? 'text-emerald-700' : 'text-stone-400'}`}
              >
                {c.pass
                  ? <Check className="h-3 w-3" />
                  : <span className="inline-block h-3 w-3 rounded-full border border-stone-300" />}
                {c.label}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
