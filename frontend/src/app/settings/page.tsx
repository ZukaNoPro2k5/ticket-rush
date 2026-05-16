'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { AccountCard, AccountLayout } from '@/components/account/AccountLayout';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setSaving(true);
    try {
      await api.put('/users/me/password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Đã đổi mật khẩu');
    } catch {
      toast.error('Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout
      title="Cài đặt"
      description="Cập nhật bảo mật tài khoản và các thiết lập cá nhân."
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <AccountCard>
          <h2 className="font-display text-lg font-bold text-stone-950">Đổi mật khẩu</h2>
          <p className="mt-1 text-sm text-stone-500">
            Mật khẩu mới cần tối thiểu 8 ký tự, có chữ hoa và chữ số.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">Mật khẩu hiện tại</span>
              <input
                type="password"
                value={form.current_password}
                onChange={(e) => updateField('current_password', e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">Mật khẩu mới</span>
              <input
                type="password"
                value={form.new_password}
                onChange={(e) => updateField('new_password', e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">Xác nhận mật khẩu mới</span>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) => updateField('confirm_password', e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400"
            >
              {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </AccountCard>

        <AccountCard>
          <h2 className="font-display text-base font-bold text-stone-950">Ghi chú</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Các thiết lập nâng cao như thông báo email hoặc phương thức thanh toán thật chưa được triển khai trong backend hiện tại.
          </p>
        </AccountCard>
      </div>
    </AccountLayout>
  );
}
