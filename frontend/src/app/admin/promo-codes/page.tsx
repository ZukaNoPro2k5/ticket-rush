'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronDown, Loader2, Plus, Search, Tag, TicketPercent, TrendingUp, Users2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProtectedRoute } from '@/components/providers';
import api from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { fadeUp, staggerContainer } from '@/lib/motion';
import EmptyState from '@/components/ui/EmptyState';

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
            className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-sm"
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

  // Derived stats
  const totalUsed   = codes.reduce((s, c) => s + c.used_count, 0);
  const totalLeft   = codes.reduce((s, c) => s + (c.max_uses != null ? Math.max(0, c.max_uses - c.used_count) : 0), 0);
  const activeCount = codes.filter((c) => promoStatus(c).label === 'Đang mở').length;

  type Tab = 'all' | 'active' | 'expired' | 'upcoming';
  const [tab, setTab] = useState<Tab>('all');
  const TAB_LABELS: Record<Tab, string> = {
    all: 'Tất cả', active: 'Đang hoạt động', expired: 'Hết hạn', upcoming: 'Sắp diễn ra',
  };

  const tabFiltered = useMemo(() => {
    const base = filtered;
    if (tab === 'all')      return base;
    if (tab === 'active')   return base.filter((c) => promoStatus(c).label === 'Đang mở');
    if (tab === 'expired')  return base.filter((c) => promoStatus(c).label === 'Hết hạn');
    if (tab === 'upcoming') return base.filter((c) => promoStatus(c).label === 'Sắp tới');
    return base;
  }, [filtered, tab]);

  return (
    <ProtectedRoute requireAdmin>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            Tạo mã mới
          </button>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Tổng mã',        value: loading ? '…' : String(codes.length),         icon: Tag,           iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
            { label: 'Đang hoạt động', value: loading ? '…' : String(activeCount),           icon: TicketPercent, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Tổng lượt dùng', value: loading ? '…' : totalUsed.toLocaleString(),   icon: Users2,        iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
            { label: 'Còn lại',        value: loading ? '…' : totalLeft.toLocaleString(),   icon: TrendingUp,    iconBg: 'bg-violet-50',  iconColor: 'text-violet-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-soft">
              <span className={`inline-flex rounded-xl p-2 ${s.iconBg}`}>
                <s.icon className={`h-4 w-4 ${s.iconColor}`} />
              </span>
              <p className="mt-3 text-2xl font-bold tabular-nums text-stone-900">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filter tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
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

          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  tab === t
                    ? 'bg-stone-900 text-white'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900',
                )}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Card grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-stone-100" />
            ))}
          </div>
        ) : tabFiltered.length === 0 ? (
          <EmptyState
            variant="promos"
            headline={search ? 'Không tìm thấy mã nào' : 'Chưa có mã giảm giá'}
            subtext={search ? 'Thử từ khóa khác.' : 'Nhấn "Tạo mã mới" để bắt đầu.'}
            action={!search ? (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                <Plus className="h-4 w-4" />
                Tạo mã đầu tiên
              </button>
            ) : undefined}
            className="rounded-2xl border border-stone-200 bg-white shadow-soft"
          />
        ) : (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tabFiltered.map((p) => {
              const status = promoStatus(p);
              const usagePct = p.max_uses ? Math.min(100, (p.used_count / p.max_uses) * 100) : 0;
              const nearFull = p.max_uses && p.used_count / p.max_uses >= 0.9;
              return (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  {/* Ticket-stub left stripe */}
                  <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-amber-400" />
                  {/* Card top */}
                  <div className="flex items-start justify-between pl-6 pr-5 pt-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                        <Tag className="h-4 w-4 text-amber-600" />
                      </span>
                      <div>
                        <p className="font-mono text-sm font-bold tracking-widest text-stone-900">{p.code}</p>
                        <p className="text-xs text-stone-400">
                          {p.event_id
                            ? (events.find((e) => e.id === p.event_id)?.title ?? `Event #${p.event_id}`)
                            : 'Tất cả sự kiện'}
                        </p>
                      </div>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', status.style)}>
                      {status.label}
                    </span>
                  </div>

                  {/* Discount value — big */}
                  <div className="pl-6 pr-5 pt-4">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400">Giảm giá</p>
                    <p className="mt-0.5 text-3xl font-bold tabular-nums leading-none text-stone-900">
                      {formatDiscount(p)}
                    </p>
                  </div>

                  {/* Usage progress */}
                  <div className="pl-6 pr-5 pt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-stone-500">Đã dùng</span>
                      <span className="font-semibold tabular-nums text-stone-700">
                        {p.used_count}{p.max_uses != null ? `/${p.max_uses}` : ''}
                      </span>
                    </div>
                    {p.max_uses != null ? (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', nearFull ? 'bg-red-400' : 'bg-amber-400')}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400">Không giới hạn</p>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="mt-4 space-y-1 border-t border-stone-100 pl-6 pr-5 py-3 text-xs text-stone-500">
                    <div className="flex justify-between">
                      <span>Hiệu lực</span>
                      <span className="font-medium text-stone-700">
                        {formatDate(p.starts_at)} → {formatDate(p.expires_at)}
                      </span>
                    </div>
                    {p.min_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Đơn tối thiểu</span>
                        <span className="font-medium text-stone-700">{p.min_amount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="mt-auto flex items-center justify-between border-t border-stone-100 pl-6 pr-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(p)}
                        title={p.is_active ? 'Tắt mã' : 'Bật mã'}
                        className={cn(
                          'relative h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                          p.is_active ? 'bg-amber-400' : 'bg-stone-200',
                        )}
                      >
                        <span className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
                          p.is_active ? 'left-4' : 'left-0.5',
                        )} />
                      </button>
                      <span className="text-xs text-stone-400">{p.is_active ? 'Đang bật' : 'Đã tắt'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.code)}
                        disabled={deletingId === p.id}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                      >
                        {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Vô hiệu hóa'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

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
