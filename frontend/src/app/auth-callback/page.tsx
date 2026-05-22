'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

/**
 * This page runs inside the OAuth popup window.
 * NextAuth redirects here after the provider flow completes.
 * We read the session, send the token back to the opener via
 * postMessage, then close the popup.
 *
 * If the user somehow navigates here directly (no opener),
 * they are redirected to home.
 */
export default function AuthCallbackPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    const opener = window.opener as Window | null;

    if (status === 'authenticated' && session) {
      const backendToken = (session as { backendToken?: string }).backendToken;
      const maintenanceMode = (session as { maintenanceMode?: boolean }).maintenanceMode ?? false;
      const u = session.user as {
        id?: string | number;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        role?: 'customer' | 'admin';
      };

      if (opener) {
        opener.postMessage(
          {
            type:       'oauth-success',
            token:      backendToken ?? null,
            user: {
              id:         u.id ?? 0,
              email:      u.email ?? '',
              name:       u.name ?? '',
              role:       u.role ?? 'customer',
              avatar_url: u.image ?? null,
            },
            maintenance_mode: maintenanceMode,
          },
          window.location.origin,
        );
        window.close();
      } else {
        // Direct navigation — not inside a popup
        window.location.replace('/');
      }
      return;
    }

    if (status === 'unauthenticated') {
      if (opener) {
        opener.postMessage({ type: 'oauth-error' }, window.location.origin);
        window.close();
      } else {
        window.location.replace('/login');
      }
    }
  }, [status, session]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
        <p className="mt-4 text-sm text-stone-500">Đang xác thực…</p>
      </div>
    </div>
  );
}
