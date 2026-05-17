'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import api from '@/lib/api/client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Thiếu mã đặt lại mật khẩu');
      return;
    }
    if (password !== confirm) {
      toast.error('Mật khẩu nhập lại chưa khớp');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Đặt lại mật khẩu thành công');
    } catch {
      toast.error('Liên kết không hợp lệ hoặc đã hết hạn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Mật khẩu mới cần ít nhất 8 ký tự, có chữ hoa và chữ số."
      footer={<Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">Về đăng nhập</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu mới"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Nhập lại mật khẩu"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
        <button
          disabled={submitting || done}
          className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {done ? 'Đã cập nhật' : submitting ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}
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
