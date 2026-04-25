'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';

export default function LoginPage() {
  const { openLoginModal } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    openLoginModal('login');
    router.replace('/');
  }, [openLoginModal, router]);

  return null;
}
