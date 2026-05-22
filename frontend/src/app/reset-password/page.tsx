'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useLocale } from '@/components/providers/LocaleProvider';
import api from '@/lib/api/client';

function ResetPasswordForm() {
  const { messages } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(messages.auth.resetTokenMissing);
      return;
    }
    if (password !== confirm) {
      toast.error(messages.auth.resetMismatch);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success(messages.auth.resetSuccess);
    } catch {
      toast.error(messages.auth.resetInvalid);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={messages.auth.resetTitle}
      subtitle={messages.auth.resetSubtitle}
      footer={<Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">{messages.auth.backToLogin}</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={messages.auth.newPassword}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={messages.auth.repeatPassword}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
        <button
          disabled={submitting || done}
          className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {done ? messages.auth.passwordUpdated : submitting ? messages.auth.passwordUpdating : messages.account.updatePassword}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
