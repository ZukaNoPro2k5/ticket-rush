'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';

export default function RegisterPage() {
  const { openLoginModal } = useUIStore();
  const router = useRouter();
  useEffect(() => {
    openLoginModal('register');
    router.replace('/');
  }, [openLoginModal, router]);
  return null;
}
