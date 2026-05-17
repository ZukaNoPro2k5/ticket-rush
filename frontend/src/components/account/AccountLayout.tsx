'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Ticket, Heart, History, Settings, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils/cn';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const NAV = [
  { href: '/profile',       icon: User,    label: 'Tài khoản của tôi' },
  { href: '/saved-events',  icon: Heart,   label: 'Sự kiện đã lưu' },
  { href: '/my-tickets',    icon: Ticket,  label: 'Vé của tôi' },
  { href: '/order-history', icon: History, label: 'Lịch sử đặt vé' },
  { href: '/settings',      icon: Settings, label: 'Cài đặt' },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated || !user) return null;

  return (
    <>
      <Navbar variant="solid" />
      <div className="min-h-screen bg-stone-50 pt-6 pb-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-stone-400">
          <Link href="/" className="hover:text-stone-600">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-600">{NAV.find(n => n.href === pathname)?.label ?? 'Tài khoản'}</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Sidebar */}
          <aside className="shrink-0 lg:w-64">
            {/* User card */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-soft">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-100"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-500 text-base font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">{user.full_name}</p>
                <p className="truncate text-xs text-stone-400">{user.email}</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="rounded-2xl border border-stone-200 bg-white shadow-soft overflow-hidden">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                      active
                        ? 'bg-amber-50 font-semibold text-amber-700 border-l-2 border-amber-500'
                        : 'text-stone-700 hover:bg-stone-50',
                    )}
                  >
                    <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-amber-500' : 'text-stone-400')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
