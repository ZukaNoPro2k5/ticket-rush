'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api/client';

interface ProfileData { has_password: boolean; }

function PasswordStrength({ password }: { password: string }) {
  const hasLen  = password.length >= 8;
  const hasCap  = /[A-Z]/.test(password);
  const hasNum  = /[0-9]/.test(password);
  const score   = [hasLen, hasCap, hasNum].filter(Boolean).length;
  if (!password) return null;
  const labels  = ['Yếu', 'Trung bình', 'Mạnh'];
  const colors  = ['bg-rose-400', 'bg-amber-400', 'bg-emerald-500'];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-stone-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score === 3 ? 'text-emerald-600' : score === 2 ? 'text-amber-600' : 'text-rose-500'}`}>
        {labels[score - 1] ?? ''}
      </p>
    </div>
  );
}

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT_EXPO } },
};

function PasswordInput({
  label, value, onChange, placeholder, error,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-600">
        <Lock className="h-3.5 w-3.5" /> {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm text-stone-900 outline-none transition-colors
            placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400/50
            ${error ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white hover:border-stone-300 focus:border-amber-400'}`}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ success: boolean; data: ProfileData }>('/users/me')
      .then(({ data }) => setHasPassword(data.data.has_password))
      .catch(() => setHasPassword(true)); // assume has password on error
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.current) e.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (form.next.length < 8) e.next = 'Mật khẩu tối thiểu 8 ký tự';
    else if (!/[A-Z]/.test(form.next)) e.next = 'Cần ít nhất 1 chữ hoa';
    else if (!/[0-9]/.test(form.next)) e.next = 'Cần ít nhất 1 chữ số';
    if (form.confirm !== form.next) e.confirm = 'Mật khẩu xác nhận không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put('/users/me/password', {
        current_password: form.current,
        new_password: form.next,
      });
      toast.success('Đã đổi mật khẩu thành công');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code;
      if (msg === 'WRONG_PASSWORD') {
        setErrors({ current: 'Sai mật khẩu hiện tại' });
      } else {
        toast.error('Đổi mật khẩu thất bại, thử lại sau');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Cài đặt</h1>
          <p className="mt-1 text-sm text-stone-500">Bảo mật tài khoản của bạn</p>
        </div>

        {/* Change password */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-soft">
          <div className="flex items-center gap-2.5 border-b border-stone-100 px-6 py-4">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-stone-900">Đổi mật khẩu</h2>
          </div>

          {hasPassword === null ? (
            <div className="flex justify-center px-6 py-10">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            </div>
          ) : hasPassword === false ? (
            <div className="px-6 py-8 text-center">
              <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">Tài khoản OAuth</p>
              <p className="mt-1 text-xs text-stone-400">
                Tài khoản của bạn đăng nhập qua Google/Facebook.<br />
                Bạn không cần đặt mật khẩu riêng.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <PasswordInput
                label="Mật khẩu hiện tại"
                value={form.current}
                onChange={v => setForm(f => ({ ...f, current: v }))}
                placeholder="••••••••"
                error={errors.current}
              />
              <div>
                <PasswordInput
                  label="Mật khẩu mới"
                  value={form.next}
                  onChange={v => setForm(f => ({ ...f, next: v }))}
                  placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
                  error={errors.next}
                />
                <PasswordStrength password={form.next} />
              </div>
              <PasswordInput
                label="Xác nhận mật khẩu mới"
                value={form.confirm}
                onChange={v => setForm(f => ({ ...f, confirm: v }))}
                placeholder="••••••••"
                error={errors.confirm}
              />
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
                >
                  {loading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <ShieldCheck className="h-4 w-4" />
                  }
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </AccountLayout>
  );
}
