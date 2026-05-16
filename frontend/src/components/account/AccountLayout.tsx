'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, Settings, Ticket, User as UserIcon } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/providers';
import { useAuthStore } from '@/stores/authStore';

const accountLinks = [
  { href: '/profile', label: 'Tài khoản của tôi', icon: UserIcon },
  { href: '/my-tickets', label: 'Vé của tôi', icon: Ticket },
  { href: '/order-history', label: 'Lịch sử đặt vé', icon: History },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

interface AccountLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AccountLayout({ title, description, children }: AccountLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-stone-50">
        <Navbar variant="solid" />

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr] lg:px-8">
          <aside className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">{user?.full_name ?? 'TicketRush'}</p>
                <p className="truncate text-xs text-stone-500">{user?.email ?? 'customer'}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {accountLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section>
            <div className="mb-5">
              <h1 className="font-display text-2xl font-bold text-stone-950">{title}</h1>
              <p className="mt-1 text-sm text-stone-500">{description}</p>
            </div>
            {children}
          </section>
        </section>

        <Footer />
      </main>
    </ProtectedRoute>
  );
}

export function AccountCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      {children}
    </div>
  );
}

export function AccountEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
      <p className="font-semibold text-stone-900">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );
}
