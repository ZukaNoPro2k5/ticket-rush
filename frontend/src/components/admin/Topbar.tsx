'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, CreditCard, Mail, Sliders } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const PAGE_LABELS: Record<string, string> = {
  '/admin':               'Tổng quan',
  '/admin/events':        'Sự kiện',
  '/admin/bookings':      'Đặt vé',
  '/admin/posts':         'Bài đăng',
  '/admin/promo-codes':   'Mã giảm giá',
  '/admin/users':         'Người dùng',
  '/admin/analytics':     'Phân tích',
  '/admin/reports':       'Báo cáo tự động',
  '/admin/payments':      'Thanh toán',
  '/admin/mail':          'Tùy chỉnh mail',
  '/admin/operations':    'Vận hành hệ thống',
  '/admin/system-settings': 'Tùy chỉnh giao diện',
};

export default function Topbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  // Resolve page title — match exact first, then by prefix
  const pageTitle =
    PAGE_LABELS[pathname] ??
    Object.entries(PAGE_LABELS)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([k]) => pathname.startsWith(k + '/'))?.[1] ??
    'Admin';

  const initials =
    user?.full_name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? 'A';

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-6 shadow-soft">
      {/* Page title */}
      <h2 className="section-title mr-auto min-w-0 truncate">{pageTitle}</h2>

      {/* Notifications */}
      <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-100 hover:text-ink-900 transition-colors">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-white" />
      </button>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(v => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white ring-2 ring-white hover:bg-amber-600 active:scale-[0.97] transition-all"
          title={user?.full_name ?? 'Tài khoản'}
        >
          {initials}
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-line bg-white shadow-lift">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink-900 truncate">{user?.full_name}</p>
              <p className="meta-text capitalize">{user?.role}</p>
            </div>

            <div className="py-1">
              <Link
                href="/admin/payments"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <CreditCard className="h-4 w-4 text-stone-400" />
                Cổng thanh toán
              </Link>

              <Link
                href="/admin/mail"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <Mail className="h-4 w-4 text-stone-400" />
                Tùy chỉnh mail
              </Link>

              <Link
                href="/admin/system-settings"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <Sliders className="h-4 w-4 text-stone-400" />
                Tùy chỉnh giao diện
              </Link>
            </div>

            <button
              onClick={() => { clearAuth(); router.replace('/'); }}
              className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
