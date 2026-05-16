'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import type { ApiResponse, Gender, User } from '@/types';
import { AccountCard, AccountLayout } from '@/components/account/AccountLayout';
import { useAuthStore } from '@/stores/authStore';

type UserProfile = Omit<User, 'avatar_url'> & { avatar_url?: string | null };

const genderLabels: Record<Gender, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    gender: '' as Gender | '',
    birth_date: '',
  });

  useEffect(() => {
    let mounted = true;
    api
      .get<ApiResponse<UserProfile>>('/users/me')
      .then((res) => {
        const profile = res.data.data;
        if (!mounted || !profile) return;
        setForm({
          full_name: profile.full_name ?? '',
          phone: profile.phone ?? '',
          gender: profile.gender ?? '',
          birth_date: profile.birth_date?.slice(0, 10) ?? '',
        });
      })
      .catch(() => toast.error('Không thể tải thông tin tài khoản'))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || undefined,
        gender: form.gender || undefined,
        birth_date: form.birth_date || undefined,
      };
      const res = await api.put<ApiResponse<UserProfile>>('/users/me', payload);
      const updated = res.data.data;

      if (token && updated) {
        setAuth(token, {
          id: updated.id,
          email: updated.email,
          full_name: updated.full_name,
          role: updated.role,
          avatar_url: currentUser?.avatar_url ?? updated.avatar_url ?? null,
        });
      }

      toast.success('Đã cập nhật tài khoản');
    } catch {
      toast.error('Không thể cập nhật tài khoản');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout
      title="Tài khoản của tôi"
      description="Quản lý thông tin cá nhân dùng cho đặt vé và nhận vé."
    >
      <AccountCard>
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-lg bg-stone-100" />
            <div className="h-10 animate-pulse rounded-lg bg-stone-100" />
            <div className="h-10 animate-pulse rounded-lg bg-stone-100" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-stone-700">Họ tên</span>
              <input
                value={form.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                required
                minLength={2}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-stone-700">Email</span>
              <input
                value={currentUser?.email ?? ''}
                disabled
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-stone-700">Số điện thoại</span>
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-stone-700">Giới tính</span>
              <select
                value={form.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              >
                <option value="">Chưa chọn</option>
                {Object.entries(genderLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-stone-700">Ngày sinh</span>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => updateField('birth_date', e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </AccountCard>
    </AccountLayout>
  );
}
