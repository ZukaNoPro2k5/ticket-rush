'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ticket, X } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore, type AuthModalMode } from '@/stores/uiStore';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function LoginModal() {
  const { isAuthenticated } = useAuthStore();
  const { loginModalOpen, loginModalMode, openLoginModal, closeLoginModal } = useUIStore();
  const tab = loginModalMode;

  useEffect(() => {
    if (isAuthenticated && loginModalOpen) setTimeout(closeLoginModal, 400);
  }, [isAuthenticated, loginModalOpen, closeLoginModal]);

  useEffect(() => {
    document.body.style.overflow = loginModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [loginModalOpen]);

  const switchTab = (next: AuthModalMode) => {
    if (next !== tab) openLoginModal(next);
  };

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-stone-900/55 backdrop-blur-sm"
            onClick={closeLoginModal}
          />

          {/* Card */}
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.28)]"
          >
            {/* Brand header */}
            <div className="flex items-center justify-between px-8 pt-6 pb-0">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.38)]">
                  <Ticket className="h-5 w-5 text-white" strokeWidth={2.5} />
                </span>
                <span className="font-display text-lg font-bold text-stone-900">TicketRush</span>
              </div>
              <button
                onClick={closeLoginModal}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="relative mt-5 flex border-b border-stone-100">
              <motion.div
                className="absolute bottom-0 h-[2px] w-1/2 rounded-full bg-amber-500"
                animate={{ left: tab === 'login' ? '0%' : '50%' }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
              {(['login', 'register'] as AuthModalMode[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                    tab === t ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>

            {/* Content slider */}
            <div className="overflow-hidden">
              <div
                className="flex w-[200%] transition-transform duration-[220ms]"
                style={{
                  transform: `translateX(${tab === 'login' ? '0%' : '-50%'})`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div className="w-1/2 px-8 pb-8 pt-6">
                  <LoginForm onSuccess={closeLoginModal} />
                </div>
                <div className="w-1/2 px-8 pb-8 pt-6">
                  <RegisterForm onSuccess={closeLoginModal} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
