'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { messages } = useLocale();
  return (
    <AuthLayout
      title={messages.auth.registerTitle}
      subtitle={messages.auth.registerSubtitle}
      footer={<>{messages.auth.haveAccount} <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">{messages.auth.login}</Link></>}
    >
      <RegisterForm
        onSuccess={(result) => {
          if (!result) return router.replace('/onboarding');
          const { user, maintenance_mode } = result;
          if (user.role === 'admin') router.replace('/admin');
          else if (maintenance_mode) router.replace('/maintenance');
          else router.replace('/onboarding');
        }}
      />
    </AuthLayout>
  );
}
