import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass, Heart, History, LogOut, Newspaper, Search, Tag, Ticket,
  User as UserIcon, X,
} from 'lucide-react';
import { CATEGORIES } from '@/data/uiConfig';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { NAVBAR_LANGUAGES } from './constants';

interface UserLike {
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: UserLike | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function MobileDrawer({
  open, onClose, isAuthenticated, user, onLogin, onLogout,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { locale, messages, setLocale } = useLocale();
  const mainLinks = [
    { href: '/events', icon: Compass, label: messages.nav.explore },
    { href: '/promotions', icon: Tag, label: messages.nav.promotions },
    { href: '/news', icon: Newspaper, label: messages.nav.news },
  ];
  const userLinks = [
    { href: '/profile', icon: UserIcon, label: messages.nav.account },
    { href: '/saved-events', icon: Heart, label: messages.nav.savedEvents },
    { href: '/my-tickets', icon: Ticket, label: messages.nav.myTickets },
    { href: '/order-history', icon: History, label: messages.nav.orderHistory },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/events?search=${encodeURIComponent(trimmed)}` : '/events');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white p-6 shadow-lift overflow-y-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-bold">{messages.nav.menu}</span>
              <button
                onClick={onClose}
                aria-label={messages.common.close}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2">
              <Search className="h-4 w-4 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={messages.nav.searchEvents}
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </form>

            <nav className="space-y-1 text-sm font-medium">
              {mainLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-stone-700 hover:bg-stone-100"
                >
                  <l.icon className="h-5 w-5 text-stone-500" /> {l.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-stone-200" />
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {messages.nav.eventCategories}
              </p>
              {CATEGORIES.map((c) => (
                <Link
                  key={c.key}
                  href={`/events?category=${c.key}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-stone-700 hover:bg-stone-100"
                >
                  <i className={`${c.icon} w-5 text-stone-500`} aria-hidden /> {messages.categories[c.key]}
                </Link>
              ))}
            </nav>

            <div className="mt-4 grid grid-cols-2 gap-2" aria-label={messages.nav.language}>
              {NAVBAR_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLocale(item.code)}
                  aria-pressed={locale === item.code}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    locale === item.code
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span aria-hidden>{item.flag}</span> {item.code.toUpperCase()}
                </button>
              ))}
            </div>

            {!isAuthenticated ? (
              <div className="mt-6">
                <button
                  onClick={() => { onClose(); onLogin(); }}
                  className="block w-full rounded-full bg-amber-500 py-2.5 text-center text-sm font-semibold text-white shadow-soft hover:bg-amber-600"
                >
                  {messages.nav.login}
                </button>
              </div>
            ) : user ? (
              <div className="mt-6">
                <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.full_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{user.full_name}</p>
                    <p className="truncate text-xs text-stone-500">{user.email}</p>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {userLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100"
                    >
                      <l.icon className="h-5 w-5 text-stone-500" /> {l.label}
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => { onClose(); onLogout(); }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> {messages.nav.logout}
                </button>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
