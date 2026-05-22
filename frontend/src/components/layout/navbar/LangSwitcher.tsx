'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { NAVBAR_LANGUAGES, type NavbarLang } from './constants';

interface Props {
  scrolled: boolean;
  linkCls: string;
}

export function LangSwitcher({ scrolled, linkCls }: Props) {
  const [open, setOpen] = useState(false);
  const { locale, messages, setLocale } = useLocale();
  const lang: NavbarLang = locale;

  return (
    <div className="relative hidden lg:block">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-label={messages.nav.language}
        className={`flex h-10 items-center gap-1 rounded-full px-2.5 text-sm font-medium transition-colors ${linkCls} ${scrolled ? 'hover:bg-stone-100' : 'hover:bg-white/10'}`}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{lang}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-stone-200 bg-white p-1 shadow-lift"
          >
            {NAVBAR_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
                  ${lang === l.code ? 'bg-amber-50 font-semibold text-amber-800' : 'text-stone-700 hover:bg-stone-100'}`}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1 text-left">{l.label}</span>
                {lang === l.code && <Check className="h-4 w-4 text-amber-700" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
