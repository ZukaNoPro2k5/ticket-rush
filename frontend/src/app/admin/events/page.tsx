'use client';

import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  XCircle,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/providers';
import {
  changeEventStatus,
  createEvent,
  listEvents,
  listSeatZonesTolerant,
  updateEvent,
  type EventFormPayload,
} from '@/lib/api/events';
import type { Event, EventCategory, EventStatus, SeatZone } from '@/types';

type CategoryFilter = EventCategory | 'all';

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: 'music', label: 'Âm nhạc' },
  { value: 'stage', label: 'Sân khấu' },
  { value: 'sports', label: 'Thể thao' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Khác' },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đang bán' },
  { value: 'completed', label: 'Đã kết thúc' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS_BADGES: Record<EventStatus, string> = {
  draft: 'bg-stone-100 text-stone-700',
  published: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const EMPTY_FORM: EventFormPayload = {
  title: '',
  description: '',
  category: 'music',
  venue: '',
  event_date: '',
  poster_url: '',
};

function toDateTimeLocal(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toApiDate(value: string): string {
  return new Date(value).toISOString();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatVnd(value: number | null | undefined): string {
  if (!value) return 'Chưa có giá';
  return `${value.toLocaleString('vi-VN')}đ`;
}

function statusLabel(status: EventStatus): string {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

function categoryLabel(category: EventCategory): string {
  return CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? category;
}

export default function AdminEventsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminEventsWorkspace />
    </ProtectedRoute>
  );
}

function AdminEventsWorkspace() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<EventStatus>('draft');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Event | null>(null);
  const [form, setForm] = useState<EventFormPayload>(EMPTY_FORM);

  const selectedLocked = !!selected && selected.status !== 'draft';

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listEvents({
        status,
        category: category === 'all' ? undefined : category,
        search: search.trim() || undefined,
        page: 1,
        limit: 50,
        sort: 'created_at',
        order: 'desc',
      });
      setEvents(result.events);
    } catch {
      setEvents([]);
      toast.error('Không thể tải danh sách sự kiện admin.');
    } finally {
      setLoading(false);
    }
  }, [category, search, status]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const stats = useMemo(() => {
    const totalSeats = events.reduce((sum, event) => sum + (event.total_seats ?? 0), 0);
    const availableSeats = events.reduce((sum, event) => sum + (event.available_seats ?? 0), 0);
    return {
      total: events.length,
      totalSeats,
      availableSeats,
    };
  }, [events]);

  const startCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (event: Event) => {
    setSelected(event);
    setForm({
      title: event.title,
      description: event.description ?? '',
      category: event.category,
      venue: event.venue,
      event_date: toDateTimeLocal(event.event_date),
      poster_url: event.poster_url ?? '',
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedLocked) {
      toast.error('Chỉ sự kiện nháp mới được chỉnh sửa.');
      return;
    }
    if (!form.title.trim() || !form.venue.trim() || !form.event_date) {
      toast.error('Vui lòng nhập đủ tên, địa điểm và thời gian.');
      return;
    }

    const payload: EventFormPayload = {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      category: form.category,
      venue: form.venue.trim(),
      event_date: toApiDate(form.event_date),
      poster_url: form.poster_url?.trim() || undefined,
    };

    setSaving(true);
    try {
      if (selected) {
        const updated = await updateEvent(selected.id, payload);
        setSelected(updated);
        toast.success('Đã cập nhật sự kiện.');
      } else {
        const created = await createEvent(payload);
        setSelected(created);
        setStatus('draft');
        toast.success('Đã tạo sự kiện nháp.');
      }
      await loadEvents();
    } catch {
      toast.error('Không thể lưu sự kiện. Kiểm tra dữ liệu và thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (event: Event, nextStatus: Exclude<EventStatus, 'draft'>) => {
    setSaving(true);
    try {
      await changeEventStatus(event.id, nextStatus);
      toast.success(`Đã chuyển trạng thái sang ${statusLabel(nextStatus)}.`);
      await loadEvents();
      if (selected?.id === event.id) setSelected(null);
    } catch {
      toast.error('Không thể chuyển trạng thái sự kiện.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/events" className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              TicketRush Admin
            </Link>
            <h1 className="mt-1 font-display text-2xl font-bold text-stone-900">Quản lý sự kiện</h1>
            <p className="mt-1 text-sm text-stone-500">Tạo, chỉnh nháp, publish, hủy hoặc kết thúc sự kiện.</p>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" /> Tạo sự kiện
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Số sự kiện" value={stats.total.toLocaleString('vi-VN')} />
            <MetricCard label="Tổng ghế" value={stats.totalSeats.toLocaleString('vi-VN')} />
            <MetricCard label="Ghế còn trống" value={stats.availableSeats.toLocaleString('vi-VN')} />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc địa điểm"
                  className="h-10 w-full rounded-full border border-stone-200 pl-9 pr-3 text-sm outline-none focus:border-amber-500"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="h-10 rounded-full border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryFilter)}
                className="h-10 rounded-full border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
              >
                <option value="all">Tất cả danh mục</option>
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => void loadEvents()}
                className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 hover:border-stone-400"
                aria-label="Tải lại"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải sự kiện...
              </div>
            ) : events.length === 0 ? (
              <div className="py-16 text-center text-sm text-stone-500">Không có sự kiện phù hợp bộ lọc.</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    selected={selected?.id === event.id}
                    saving={saving}
                    onEdit={() => startEdit(event)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <EventFormPanel
            form={form}
            selected={selected}
            selectedLocked={selectedLocked}
            saving={saving}
            onSubmit={handleSubmit}
            onChange={setForm}
            onCreateNew={startCreate}
          />
          <SeatZonesPanel event={selected} />
        </aside>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-stone-900">{value}</div>
    </div>
  );
}

function EventRow({
  event,
  selected,
  saving,
  onEdit,
  onStatusChange,
}: {
  event: Event;
  selected: boolean;
  saving: boolean;
  onEdit: () => void;
  onStatusChange: (event: Event, nextStatus: Exclude<EventStatus, 'draft'>) => void;
}) {
  return (
    <div className={`p-4 transition-colors ${selected ? 'bg-amber-50/60' : 'hover:bg-stone-50'}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-stone-900">{event.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGES[event.status]}`}>
              {statusLabel(event.status)}
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
              {categoryLabel(event.category)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(event.event_date)}
            </span>
            <span>{event.venue}</span>
            <span>{formatVnd(event.min_price)} - {formatVnd(event.max_price)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-stone-400"
          >
            <Eye className="h-3.5 w-3.5" /> Xem
          </Link>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-stone-400"
          >
            <Edit3 className="h-3.5 w-3.5" /> Chỉnh
          </button>
          {event.status === 'draft' && (
            <button
              disabled={saving}
              onClick={() => onStatusChange(event, 'published')}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Publish
            </button>
          )}
          {event.status === 'published' && (
            <>
              <button
                disabled={saving}
                onClick={() => onStatusChange(event, 'completed')}
                className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Clock className="h-3.5 w-3.5" /> Kết thúc
              </button>
              <button
                disabled={saving}
                onClick={() => onStatusChange(event, 'cancelled')}
                className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" /> Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EventFormPanel({
  form,
  selected,
  selectedLocked,
  saving,
  onSubmit,
  onChange,
  onCreateNew,
}: {
  form: EventFormPayload;
  selected: Event | null;
  selectedLocked: boolean;
  saving: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (next: EventFormPayload) => void;
  onCreateNew: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-900">
            {selected ? 'Chi tiết sự kiện' : 'Tạo sự kiện nháp'}
          </h2>
          {selectedLocked && <p className="mt-1 text-xs text-amber-700">Sự kiện đã publish/kết thúc nên form bị khóa.</p>}
        </div>
        {selected && (
          <button type="button" onClick={onCreateNew} className="text-xs font-semibold text-amber-700 hover:text-amber-800">
            Tạo mới
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AdminField label="Tên sự kiện">
          <input
            value={form.title}
            disabled={selectedLocked}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-500 disabled:bg-stone-50"
          />
        </AdminField>
        <AdminField label="Mô tả">
          <textarea
            value={form.description}
            disabled={selectedLocked}
            rows={4}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500 disabled:bg-stone-50"
          />
        </AdminField>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Danh mục">
            <select
              value={form.category}
              disabled={selectedLocked}
              onChange={(e) => onChange({ ...form, category: e.target.value as EventCategory })}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-500 disabled:bg-stone-50"
            >
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Thời gian">
            <input
              type="datetime-local"
              value={form.event_date}
              disabled={selectedLocked}
              onChange={(e) => onChange({ ...form, event_date: e.target.value })}
              className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-500 disabled:bg-stone-50"
            />
          </AdminField>
        </div>
        <AdminField label="Địa điểm">
          <input
            value={form.venue}
            disabled={selectedLocked}
            onChange={(e) => onChange({ ...form, venue: e.target.value })}
            className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-500 disabled:bg-stone-50"
          />
        </AdminField>
        <AdminField label="Poster URL">
          <input
            value={form.poster_url}
            disabled={selectedLocked}
            onChange={(e) => onChange({ ...form, poster_url: e.target.value })}
            className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-500 disabled:bg-stone-50"
          />
        </AdminField>
      </div>

      <button
        type="submit"
        disabled={saving || selectedLocked}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-white shadow-soft hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {selected ? 'Lưu thay đổi' : 'Tạo sự kiện nháp'}
      </button>
    </form>
  );
}

function AdminField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">{label}</span>
      {children}
    </label>
  );
}

function SeatZonesPanel({ event }: { event: Event | null }) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(false);
  const [zones, setZones] = useState<SeatZone[]>([]);
  const [message, setMessage] = useState('Chọn một sự kiện để xem cấu hình khu ghế.');

  useEffect(() => {
    if (!event) {
      setAvailable(false);
      setZones([]);
      setMessage('Chọn một sự kiện để xem cấu hình khu ghế.');
      return;
    }

    setLoading(true);
    listSeatZonesTolerant(event.id)
      .then((result) => {
        setAvailable(result.available);
        setZones(result.zones);
        setMessage(result.message ?? '');
      })
      .catch(() => {
        setAvailable(false);
        setZones([]);
        setMessage('Không thể tải cấu hình khu ghế.');
      })
      .finally(() => setLoading(false));
  }, [event]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-amber-600" />
        <h2 className="font-display text-lg font-bold text-stone-900">Cấu hình khu ghế</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang kiểm tra API khu ghế...
        </div>
      ) : !event ? (
        <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">{message}</div>
      ) : !available ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {message || 'Backend seat-zones chưa sẵn sàng. UI được giữ ở trạng thái disabled để không làm lỗi trang.'}
          </div>
          <DisabledZoneForm />
        </div>
      ) : zones.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">Sự kiện này chưa có khu ghế.</div>
          <DisabledZoneForm />
        </div>
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => (
            <div key={zone.id} className="rounded-xl border border-stone-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: zone.color }} />
                  <span className="font-semibold text-stone-800">{zone.name}</span>
                </div>
                <span className="text-sm font-semibold text-amber-700">{formatVnd(zone.price)}</span>
              </div>
              <div className="mt-1 text-xs text-stone-500">
                {zone.total_rows} hàng × {zone.total_cols} ghế
              </div>
            </div>
          ))}
          <DisabledZoneForm />
        </div>
      )}
    </div>
  );
}

function DisabledZoneForm() {
  return (
    <div className="grid gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 opacity-70">
      <div className="grid gap-3 sm:grid-cols-2">
        <input disabled placeholder="Tên zone" className="h-10 rounded-lg border border-stone-200 px-3 text-sm" />
        <input disabled placeholder="Giá vé" className="h-10 rounded-lg border border-stone-200 px-3 text-sm" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input disabled placeholder="Màu" className="h-10 rounded-lg border border-stone-200 px-3 text-sm" />
        <input disabled placeholder="Số hàng" className="h-10 rounded-lg border border-stone-200 px-3 text-sm" />
        <input disabled placeholder="Số cột" className="h-10 rounded-lg border border-stone-200 px-3 text-sm" />
      </div>
      <button disabled className="rounded-full bg-stone-200 py-2 text-sm font-semibold text-stone-400">
        Tạo khu ghế khi backend sẵn sàng
      </button>
    </div>
  );
}
