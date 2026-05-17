'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Heart, History, LogOut, Settings, Ticket, User as UserIcon,
} from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface UserLike {
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

interface Props {
  user: UserLike;
  scrolled: boolean;
  onLogout: () => void;
}

function Avatar({ user, size, ring }: { user: UserLike; size: number; ring: string }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.full_name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${ring}`}
        style={{ height: size, width: size }}
        referrerPolicy="no-referrer"
        unoptimized
      />
    );
  }
  return (
    <span
      className={`grid place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 font-bold text-white ${ring}`}
      style={{ height: size, width: size, fontSize: size <= 28 ? 11 : 14 }}
    >
      {user.full_name.charAt(0).toUpperCase()}
    </span>
  );
}

export function UserMenu({ user, scrolled, onLogout }: Props) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { href: '/profile', icon: UserIcon, label: 'Tài khoản của tôi' },
    { href: '/saved-events', icon: Heart, label: 'Sự kiện đã lưu' },
    { href: '/my-tickets', icon: Ticket, label: 'Vé của tôi' },
    { href: '/order-history', icon: History, label: 'Lịch sử đặt vé' },
    { href: '/settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className={`flex items-center gap-2 rounded-full border px-2 py-1 transition-all
          ${scrolled ? 'border-stone-200 hover:border-stone-300 hover:bg-stone-50' : 'border-white/30 hover:bg-white/10'}`}
      >
        <Avatar user={user} size={28} ring="ring-2 ring-white/60" />
        <span className={`hidden max-w-[120px] truncate text-sm font-medium md:inline ${scrolled ? 'text-stone-800' : 'text-white'}`}>
          {user.full_name.split(' ').pop()}
        </span>
        <ChevronDown
          className={`hidden h-3.5 w-3.5 transition-transform md:inline ${open ? 'rotate-180' : ''} ${scrolled ? 'text-stone-500' : 'text-white/70'}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3.5">
              <Avatar user={user} size={40} ring="ring-2 ring-white" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">{user.full_name}</p>
                <p className="truncate text-xs text-stone-500">{user.email}</p>
              </div>
            </div>

            <div className="p-1.5">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100"
                >
                  <item.icon className="h-4 w-4 text-stone-500" /> {item.label}
                </Link>
              ))}
              <div className="my-1 h-px bg-stone-100" />
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
