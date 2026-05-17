'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import api from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Nếu email tồn tại, hướng dẫn đã được gửi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email, TicketRush sẽ gửi liên kết đặt lại nếu tài khoản tồn tại."
      footer={<Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">Quay lại đăng nhập</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <button
          disabled={submitting || sent}
          className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {sent ? 'Đã gửi hướng dẫn' : submitting ? 'Đang gửi…' : 'Gửi liên kết'}
        </button>
      </form>
    </AuthLayout>
  );
}
