'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays, LineChart, LayoutDashboard, Newspaper, PanelLeft,
  Receipt, Settings, Sparkles, Tag, Users, Zap, CreditCard, Mail
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils/cn';
import Topbar from '@/components/admin/Topbar';

const NAV_MAIN: { href: string; label: string; icon: React.ElementType; exact?: boolean }[] = [
  { href: '/admin',             label: 'Tổng quan',       icon: LayoutDashboard, exact: true },
  { href: '/admin/events',      label: 'Sự kiện',         icon: CalendarDays },
  { href: '/admin/bookings',    label: 'Đặt vé',          icon: Receipt },
  { href: '/admin/posts',       label: 'Bài đăng',        icon: Newspaper },
  { href: '/admin/promo-codes', label: 'Mã giảm giá',     icon: Tag },
  { href: '/admin/users',       label: 'Người dùng',      icon: Users },
];

const NAV_SECONDARY = [
  { href: '/admin/analytics', label: 'Phân tích',        icon: LineChart },
  { href: '/admin/reports',   label: 'Báo cáo tự động',  icon: Sparkles },
  { href: '/admin/payments',  label: 'Thanh toán',       icon: CreditCard },
  { href: '/admin/mail',      label: 'Tùy chỉnh mail',   icon: Mail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const { user, isAuthenticated, clearAuth, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/');
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  const initials =
    user?.full_name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? 'A';

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <aside className={cn(
        'relative z-10 flex h-full shrink-0 flex-col bg-stone-900 transition-all duration-300',
        collapsed ? 'w-[52px]' : 'w-56',
      )}>

        {/* Top: logo + toggle — hover icon to reveal toggle */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-stone-800 px-3">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display text-sm font-bold text-white">
                Ticket<span className="text-amber-400">Rush</span>
              </span>
            </Link>
          )}
          {/* When expanded: plain toggle button */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Thu gọn"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-white/5 hover:text-stone-200"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          {/* When collapsed: icon that becomes toggle on hover */}
          {collapsed && (
            <div className="group mx-auto relative flex h-8 w-8 items-center justify-center">
              {/* App icon — hidden on hover */}
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-amber-500 transition-opacity duration-150 group-hover:opacity-0">
                <Zap className="h-4 w-4 text-white" />
              </div>
              {/* Toggle button — shown on hover */}
              <button
                onClick={() => setCollapsed(false)}
                title="Mở rộng"
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-700 opacity-0 transition-opacity duration-150 group-hover:opacity-100 text-stone-200"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 overflow-y-auto px-1.5 py-2">
          {/* Main items */}
          <div className="space-y-0.5">
            {NAV_MAIN.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    'relative flex h-9 items-center rounded-lg px-2.5 text-sm font-medium transition-all duration-150',
                    collapsed ? 'justify-center' : 'gap-3',
                    active
                      ? 'bg-amber-500/15 text-white'
                      : 'text-stone-400 hover:bg-white/5 hover:text-stone-200',
                  )}
                >
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-amber-400" />
                  )}
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-amber-400')} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-stone-800" />

          {/* Secondary items */}
          <div className="space-y-0.5">
            {NAV_SECONDARY.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    'relative flex h-9 items-center rounded-lg px-2.5 text-sm font-medium transition-all duration-150',
                    collapsed ? 'justify-center' : 'gap-3',
                    active
                      ? 'bg-amber-500/15 text-white'
                      : 'text-stone-400 hover:bg-white/5 hover:text-stone-200',
                  )}
                >
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-amber-400" />
                  )}
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-amber-400')} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
