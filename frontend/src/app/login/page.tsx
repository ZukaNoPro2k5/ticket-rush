'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function LoginPage() {
  const router = useRouter();
  const { messages } = useLocale();
  return (
    <AuthLayout
      title={messages.auth.loginTitle}
      subtitle={messages.auth.loginSubtitle}
      footer={<>{messages.auth.noAccount} <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-800">{messages.auth.register}</Link></>}
    >
      <LoginForm
        onSuccess={(result) => {
          if (!result) return router.replace('/');
          const { user, maintenance_mode } = result;
          if (user.role === 'admin') router.replace('/admin');
          else if (maintenance_mode) router.replace('/maintenance');
          else router.replace('/');
        }}
      />
    </AuthLayout>
  );
}
