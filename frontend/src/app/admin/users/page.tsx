'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Users as UsersIcon } from 'lucide-react';
import { fadeUp } from '@/lib/motion';
import EmptyState from '@/components/ui/EmptyState';
import api from '@/lib/api/client';

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const AVATAR_COLORS = [
  'bg-amber-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Debounce search input by 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    try {
      const { data } = await api.get<{
        success: boolean;
        data: { users: UserRow[]; pagination: Pagination };
      }>(`/admin/users?${params}`);
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch {
      // stay with previous
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        {loading ? (
          <div className="divide-y divide-stone-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-8 w-8 animate-pulse rounded-full bg-stone-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 animate-pulse rounded bg-stone-100" />
                  <div className="h-3 w-32 animate-pulse rounded bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            variant="users"
            headline="Không tìm thấy người dùng"
            subtext="Thử từ khóa khác."
          />
        ) : (
          <div className="divide-y divide-stone-100">
            {/* Table head */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
              <span>Họ tên</span>
              <span>Email</span>
              <span>Vai trò</span>
              <span>Ngày đăng ký</span>
            </div>
            {users.map(u => (
              <div
                key={u.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center gap-2 px-5 py-3.5 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${avatarColor(u.full_name)} text-[10px] font-bold text-white`}>
                    {initials(u.full_name)}
                  </div>
                  <span className="truncate text-sm font-medium text-stone-900">{u.full_name}</span>
                </div>
                <span className="truncate text-sm text-stone-500">{u.email}</span>
                <span>
                  {u.role === 'admin' ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/60">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
                      User
                    </span>
                  )}
                </span>
                <span className="text-xs text-stone-400">{formatDate(u.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-stone-400">
            Trang {pagination.page} / {pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
              disabled={page >= pagination.total_pages}
              className="rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
