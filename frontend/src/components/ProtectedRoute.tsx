'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (requireAdmin && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isAuthenticated, user, requireAdmin, router]);

  if (!isAuthenticated) return null;
  if (requireAdmin && user?.role !== 'admin') return null;

  return <>{children}</>;
}
