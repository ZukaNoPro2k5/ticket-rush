'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronDown, Loader2, Pencil, Plus, Search, Tag, Trash2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProtectedRoute } from '@/components/providers';
import api from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { fadeUp, staggerContainer } from '@/lib/motion';

// ── Types ─────────────────────────────────────────────────────────────────

interface PromoCode {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  event_id: number | null;
  min_amount: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

interface EventOption { id: number; title: string }

interface FormState {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  max_uses: string;
  unlimited: boolean;
  event_id: string;
  all_events: boolean;
  min_amount: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  code: '',
  discount_type: 'percent',
  discount_value: '',
  max_uses: '',
  unlimited: false,
  event_id: '',
  all_events: true,
  min_amount: '0',
  starts_at: '',
  expires_at: '',
  is_active: true,
};

// ── Helpers ────────────────────────────────────────────────────────────────

function toLocalDatetimeInput(iso: string) {
  if (!iso) return '';
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

function toISOString(local: string) {
  if (!local) return '';
  return new Date(local).toISOString();
}

function promoStatus(p: PromoCode): { label: string; style: string } {
  const now = Date.now();
  const start = new Date(p.starts_at).getTime();
  const end = new Date(p.expires_at).getTime();
  if (!p.is_active)      return { label: 'Tắt',    style: 'bg-stone-100 text-stone-500' };
  if (now < start)       return { label: 'Sắp tới', style: 'bg-amber-50 text-amber-700' };
  if (now > end)         return { label: 'Hết hạn', style: 'bg-red-50 text-red-600' };
  if (p.max_uses !== null && p.used_count >= p.max_uses)
                         return { label: 'Hết lượt', style: 'bg-red-50 text-red-600' };
  return { label: 'Đang mở', style: 'bg-emerald-50 text-emerald-700' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatDiscount(p: PromoCode) {
  return p.discount_type === 'percent'
    ? `-${p.discount_value}%`
    : `-${p.discount_value.toLocaleString('vi-VN')}đ`;
}

// ── Slide-over Panel ───────────────────────────────────────────────────────

function PromoPanel({
  open,
  editing,
  events,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: PromoCode | null;
  events: EventOption[];
  onClose: () => void;
  onSaved: (p: PromoCode) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        code: editing.code,
        discount_type: editing.discount_type,
        discount_value: String(editing.discount_value),
        max_uses: editing.max_uses != null ? String(editing.max_uses) : '',
        unlimited: editing.max_uses === null,
        event_id: editing.event_id != null ? String(editing.event_id) : '',
        all_events: editing.event_id === null,
        min_amount: String(editing.min_amount),
        starts_at: toLocalDatetimeInput(editing.starts_at),
        expires_at: toLocalDatetimeInput(editing.expires_at),
        is_active: editing.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editing]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.starts_at || !form.expires_at) {
      toast.error('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: form.unlimited ? null : form.max_uses ? Number(form.max_uses) : null,
      event_id: form.all_events ? null : form.event_id ? Number(form.event_id) : null,
      min_amount: Number(form.min_amount) || 0,
      starts_at: toISOString(form.starts_at),
      expires_at: toISOString(form.expires_at),
      ...(editing ? { is_active: form.is_active } : {}),
    };

    setSaving(true);
    try {
      const res = editing
        ? await api.put<{ success: boolean; data: PromoCode }>(`/promo-codes/${editing.id}`, payload)
        : await api.post<{ success: boolean; data: PromoCode }>('/promo-codes', payload);
      onSaved(res.data.data);
      toast.success(editing ? 'Đã cập nhật mã giảm giá' : 'Đã tạo mã giảm giá');
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Không thể lưu mã giảm giá';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-lift"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-stone-900">
                  {editing ? 'Chỉnh sửa mã' : 'Tạo mã mới'}
                </h2>
                <p className="mt-0.5 text-xs text-stone-400">
                  {editing ? `Đang sửa: ${editing.code}` : 'Điền thông tin để tạo mã giảm giá'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-5 px-6 py-5">

                {/* Code */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Mã giảm giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => set('code', e.target.value.toUpperCase())}
                    placeholder="VD: SUMMER20"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-stone-900 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                  />
                </div>

                {/* Discount type + value */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Loại giảm giá <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {(['percent', 'fixed'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => set('discount_type', type)}
                        className={cn(
                          'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                          form.discount_type === type
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50',
                        )}
                      >
                        {type === 'percent' ? 'Phần trăm (%)' : 'Cố định (đ)'}
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-2">
                    <input
                      required
                      type="number"
                      min={0}
                      max={form.discount_type === 'percent' ? 100 : undefined}
                      value={form.discount_value}
                      onChange={(e) => set('discount_value', e.target.value)}
                      placeholder={form.discount_type === 'percent' ? 'VD: 20' : 'VD: 50000'}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 pr-12 text-sm text-stone-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400">
                      {form.discount_type === 'percent' ? '%' : 'đ'}
                    </span>
                  </div>
                </div>

                {/* Max uses */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-stone-700">Giới hạn lượt dùng</label>
                    <button
                      type="button"
                      onClick={() => set('unlimited', !form.unlimited)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                        form.unlimited
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                      )}
                    >
                      {form.unlimited && <Check className="h-3 w-3" />}
                      Không giới hạn
                    </button>
                  </div>
                  <input
                    type="number"
                    min={1}
                    disabled={form.unlimited}
                    value={form.max_uses}
                    onChange={(e) => set('max_uses', e.target.value)}
                    placeholder="VD: 100"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                  />
                </div>

                {/* Event scope */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-stone-700">Áp dụng cho</label>
                    <button
                      type="button"
                      onClick={() => set('all_events', !form.all_events)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                        form.all_events
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                      )}
                    >
                      {form.all_events && <Check className="h-3 w-3" />}
                      Tất cả sự kiện
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      disabled={form.all_events}
                      value={form.event_id}
                      onChange={(e) => set('event_id', e.target.value)}
                      className="w-full appearance-none rounded-xl border border-stone-200 px-3 py-2.5 pr-8 text-sm text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                    >
                      <option value="">Chọn sự kiện</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>

                {/* Min amount */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Đơn hàng tối thiểu
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={form.min_amount}
                      onChange={(e) => set('min_amount', e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 pr-8 text-sm text-stone-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">đ</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">Để 0 nếu không yêu cầu đơn tối thiểu</p>
                </div>

                {/* Date range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(e) => set('starts_at', e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="datetime-local"
                      value={form.expires_at}
                      onChange={(e) => set('expires_at', e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Active toggle — edit only */}
                {editing && (
                  <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-stone-700">Kích hoạt mã</p>
                      <p className="text-xs text-stone-400">Tắt để vô hiệu hóa tạm thời</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set('is_active', !form.is_active)}
                      className={cn(
                        'relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                        form.is_active ? 'bg-amber-500' : 'bg-stone-200',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                          form.is_active ? 'left-5' : 'left-0.5',
                        )}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 border-t border-stone-200 px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? 'Lưu thay đổi' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [codesRes, eventsRes] = await Promise.all([
        api.get<{ success: boolean; data: PromoCode[] }>('/promo-codes'),
        api.get<{ success: boolean; data: { events: EventOption[] } }>('/events?limit=100&sort=event_date&order=asc'),
      ]);
      setCodes(codesRes.data.data);
      setEvents(eventsRes.data.data.events ?? []);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return codes;
    return codes.filter((c) => c.code.toLowerCase().includes(q));
  }, [codes, search]);

  function openCreate() { setEditing(null); setPanelOpen(true); }
  function openEdit(p: PromoCode) { setEditing(p); setPanelOpen(true); }
  function closePanel() { setPanelOpen(false); setEditing(null); }

  function handleSaved(saved: PromoCode) {
    setCodes((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }

  async function handleDelete(id: number, code: string) {
    if (!confirm(`Xóa mã "${code}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/promo-codes/${id}`);
      setCodes((prev) => prev.filter((c) => c.id !== id));
      toast.success('Đã xóa mã giảm giá');
    } catch {
      toast.error('Không thể xóa mã này');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(p: PromoCode) {
    try {
      const res = await api.put<{ success: boolean; data: PromoCode }>(`/promo-codes/${p.id}`, {
        is_active: !p.is_active,
      });
      handleSaved(res.data.data);
      toast.success(p.is_active ? 'Đã tắt mã' : 'Đã bật mã');
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div>
        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-900">Mã giảm giá</h1>
            <p className="mt-1 text-sm text-stone-500">
              {loading ? '…' : `${codes.length} mã · ${codes.filter((c) => promoStatus(c).label === 'Đang mở').length} đang hoạt động`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            Tạo mã mới
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-stone-400 hover:text-stone-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-soft">
          {loading ? (
            <div className="space-y-0 divide-y divide-stone-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-stone-100" />
                  <div className="h-4 w-16 animate-pulse rounded-full bg-stone-100" />
                  <div className="ml-auto h-4 w-12 animate-pulse rounded-full bg-stone-100" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Tag className="h-10 w-10 text-stone-300" />
              <p className="font-medium text-stone-700">
                {search ? 'Không tìm thấy mã nào' : 'Chưa có mã giảm giá'}
              </p>
              <p className="text-sm text-stone-400">
                {search ? 'Thử tìm với từ khóa khác' : 'Nhấn "Tạo mã mới" để bắt đầu'}
              </p>
              {!search && (
                <button
                  onClick={openCreate}
                  className="mt-1 flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  <Plus className="h-4 w-4" />
                  Tạo mã đầu tiên
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table head */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] items-center gap-4 border-b border-stone-100 px-6 py-3">
                {['Mã', 'Giảm', 'Lượt dùng', 'Kết thúc', 'Trạng thái', ''].map((h) => (
                  <span key={h} className="text-xs font-semibold uppercase tracking-wide text-stone-400">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <motion.ul
                variants={staggerContainer(0.04)}
                initial="hidden"
                animate="visible"
                className="divide-y divide-stone-50"
              >
                {filtered.map((p) => {
                  const status = promoStatus(p);
                  return (
                    <motion.li
                      key={p.id}
                      variants={fadeUp}
                      className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-stone-50/60"
                    >
                      {/* Code */}
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                          <Tag className="h-4 w-4 text-amber-600" />
                        </span>
                        <div>
                          <p className="font-mono text-sm font-semibold tracking-wider text-stone-900">
                            {p.code}
                          </p>
                          <p className="text-xs text-stone-400">
                            {p.event_id
                              ? (events.find((e) => e.id === p.event_id)?.title ?? `Event #${p.event_id}`)
                              : 'Tất cả sự kiện'}
                          </p>
                        </div>
                      </div>

                      {/* Discount */}
                      <span className="text-sm font-semibold text-stone-900">{formatDiscount(p)}</span>

                      {/* Uses */}
                      <div>
                        <span className="text-sm text-stone-700">
                          {p.used_count}
                          {p.max_uses != null ? `/${p.max_uses}` : ''}
                        </span>
                        {p.max_uses != null && (
                          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                p.used_count / p.max_uses >= 0.9 ? 'bg-red-400' : 'bg-amber-400',
                              )}
                              style={{ width: `${Math.min(100, (p.used_count / p.max_uses) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Expires */}
                      <span className="text-sm text-stone-500">{formatDate(p.expires_at)}</span>

                      {/* Status + toggle */}
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', status.style)}>
                          {status.label}
                        </span>
                        <button
                          onClick={() => handleToggleActive(p)}
                          title={p.is_active ? 'Tắt mã' : 'Bật mã'}
                          className={cn(
                            'relative h-5 w-9 rounded-full transition-colors duration-200',
                            p.is_active ? 'bg-amber-400' : 'bg-stone-200',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                              p.is_active ? 'left-4' : 'left-0.5',
                            )}
                          />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.code)}
                          disabled={deletingId === p.id}
                          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          title="Xóa"
                        >
                          {deletingId === p.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </>
          )}
        </div>
      </div>

      {/* Slide-over panel */}
      <PromoPanel
        open={panelOpen}
        editing={editing}
        events={events}
        onClose={closePanel}
        onSaved={handleSaved}
      />
    </ProtectedRoute>
  );
}
