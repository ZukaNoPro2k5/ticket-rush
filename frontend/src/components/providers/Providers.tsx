'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SessionProvider, useSession } from 'next-auth/react';
import { useAuthStore } from '@/stores/authStore';
import { LoginModal } from '@/components/auth/LoginModal';

/**
 * Syncs the NextAuth session (used for OAuth) into Zustand authStore.
 * Runs once per session change. No-op for credentials users (they populate
 * Zustand directly in the login/register form).
 */
function SessionSync() {
  const { data: session, status } = useSession();
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      clearAuth();
      return;
    }
    // Only sync when session has a backend token (OAuth flow) and Zustand is empty
    const backendToken = (session as { backendToken?: string } | null)?.backendToken;
    if (backendToken && !isAuthenticated && session?.user) {
      setAuth(backendToken, {
        id:         Number((session.user as { id?: string | number }).id ?? 0),
        email:      session.user.email ?? '',
        full_name:  session.user.name  ?? '',
        role:       'customer',
        avatar_url: session.user.image ?? null,
      });
    }
  }, [status, session, isAuthenticated, setAuth, clearAuth]);

  return null;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
      <LoginModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'var(--font-be-vietnam-pro)', fontSize: '14px' },
        }}
      />
    </SessionProvider>
  );
}
