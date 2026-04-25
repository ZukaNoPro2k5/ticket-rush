'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Newspaper, Tag, Ticket } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  CalendarDropdown, ExploreDropdown, LangSwitcher, MobileDrawer, UserMenu,
} from './navbar/index';
import type { NavbarVariant } from './navbar/constants';

export function Navbar({ variant = 'overlay' }: { variant?: NavbarVariant }) {
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const [scrolled, setScrolled] = useState(variant === 'solid');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (variant === 'solid') return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  const handleLogout = () => {
    clearAuth();
  };

  const shellCls = scrolled
    ? 'bg-white/85 backdrop-blur-md shadow-soft border-b border-stone-200/70'
    : 'bg-transparent';
  const linkCls = scrolled ? 'text-stone-700 hover:text-stone-900' : 'text-white/90 hover:text-white';
  const logoCls = scrolled ? 'text-stone-900' : 'text-white';

  const isActive = (href: string) =>
    href !== '#' && (pathname === href || (href !== '/' && pathname.startsWith(href)));

  const positionCls = variant === 'overlay' ? 'fixed' : 'sticky';

  return (
    <header className={`${positionCls} inset-x-0 top-0 z-40 transition-all duration-300 ${shellCls}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 lg:h-20 lg:px-8">
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-2 font-display text-xl font-bold ${logoCls}`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white shadow-lift">
            <Ticket className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span>TicketRush</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <ExploreDropdown isActive={isActive('/events')} scrolled={scrolled} linkCls={linkCls} />
          <CalendarDropdown linkCls={linkCls} />

          <Link
            href="/promotions"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${isActive('/promotions') ? (scrolled ? 'text-amber-700 bg-amber-50' : 'text-white bg-white/10') : linkCls}`}
          >
            <Tag className="h-4 w-4" /> Ưu đãi
          </Link>

          <Link
            href="/news"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${isActive('/news') ? (scrolled ? 'text-amber-700 bg-amber-50' : 'text-white bg-white/10') : linkCls}`}
          >
            <Newspaper className="h-4 w-4" /> Tin tức
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          <LangSwitcher scrolled={scrolled} linkCls={linkCls} />

          {isAuthenticated && user ? (
            <UserMenu user={user} scrolled={scrolled} onLogout={handleLogout} />
          ) : (
            <button
              onClick={() => openLoginModal('login')}
              className="hidden rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift sm:inline-flex sm:items-center"
            >
              Đăng nhập
            </button>
          )}

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            className={`grid h-10 w-10 place-items-center rounded-lg lg:hidden ${linkCls}`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={() => openLoginModal('login')}
        onLogout={handleLogout}
      />
    </header>
  );
}
