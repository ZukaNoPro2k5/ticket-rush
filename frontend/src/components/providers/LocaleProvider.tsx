'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  formatCurrency,
  getMessages,
  isLocale,
  localeTag,
  type Locale,
  type Messages,
} from '@/lib/i18n';

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored) && stored !== initialLocale) updateLocale(stored);
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => updateLocale(nextLocale), []);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    messages: getMessages(locale),
    setLocale,
    formatCurrency: (value) => formatCurrency(locale, value),
    formatNumber: (value) => new Intl.NumberFormat(localeTag(locale)).format(value),
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
}
