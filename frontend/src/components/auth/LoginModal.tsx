'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Ticket, X } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore, type AuthModalMode } from '@/stores/uiStore';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { useLocale } from '@/components/providers/LocaleProvider';

type ModalView = 'auth' | 'forgot';

export function LoginModal() {
  const { isAuthenticated } = useAuthStore();
  const { loginModalOpen, loginModalMode, openLoginModal, closeLoginModal } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const tab = loginModalMode;
  const { messages } = useLocale();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [view, setView] = useState<ModalView>('auth');
  const [direction, setDirection] = useState<1 | -1>(1);

  const handleAuthSuccess = (result?: { user: { role: string }; maintenance_mode?: boolean }) => {
    const freshUser = useAuthStore.getState().user;
    const role = result?.user.role ?? freshUser?.role;
    
    if (role === 'admin') {
      setIsRedirecting(true);
      return router.replace('/admin');
    }
    
    closeLoginModal();
    if (result?.maintenance_mode) return router.replace('/maintenance');
    if (tab === 'register') return router.replace('/onboarding');
    if (pathname === '/login' || pathname === '/maintenance') router.replace('/');
  };

  useEffect(() => {
    if (isAuthenticated && loginModalOpen && !isRedirecting) setTimeout(closeLoginModal, 400);
  }, [isAuthenticated, loginModalOpen, closeLoginModal, isRedirecting]);

  useEffect(() => {
    if (pathname.startsWith('/admin') && loginModalOpen) {
      closeLoginModal();
      setIsRedirecting(false);
    }
  }, [pathname, loginModalOpen, closeLoginModal]);

  useEffect(() => {
    document.body.style.overflow = loginModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [loginModalOpen]);

  useEffect(() => {
    if (!loginModalOpen) {
      setView('auth');
      setDirection(1);
    }
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
                aria-label={messages.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Header state: auth tabs collapse into forgot-password title */}
            <div className="relative mt-5 min-h-[51px] overflow-hidden border-b border-stone-100">
              <AnimatePresence mode="wait" initial={false}>
                {view === 'auth' ? (
                  <motion.div
                    key="tabs"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                    className="relative flex"
                  >
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
                        {t === 'login' ? messages.auth.login : messages.auth.register}
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="forgot-title"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                    className="flex min-h-[51px] items-center justify-center"
                  >
                    <span className="text-sm font-semibold text-stone-900">{messages.auth.forgotPassword}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                {view === 'forgot' ? (
                  <motion.div
                    key="forgot"
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 18 : -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -18 : 18 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                    className="px-8 pb-8 pt-6"
                  >
                    <ForgotPasswordForm
                      onBack={() => {
                        setDirection(-1);
                        setView('auth');
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth"
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 18 : -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -18 : 18 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                    className="overflow-hidden"
                    style={{
                      opacity: isRedirecting ? 0.5 : 1,
                      pointerEvents: isRedirecting ? 'none' : 'auto',
                    }}
                  >
                    <div
                      className="flex w-[200%] transition-transform duration-[220ms]"
                      style={{
                        transform: `translateX(${tab === 'login' ? '0%' : '-50%'})`,
                        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      <div className="w-1/2 px-8 pb-8 pt-6">
                        <LoginForm
                          onSuccess={handleAuthSuccess}
                          onForgotPassword={() => {
                            setDirection(1);
                            setView('forgot');
                          }}
                        />
                      </div>
                      <div className="w-1/2 px-8 pb-8 pt-6">
                        <RegisterForm onSuccess={handleAuthSuccess} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
