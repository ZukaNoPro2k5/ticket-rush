'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Calendar, Check, Clapperboard,
  GraduationCap, ImageIcon, LayoutGrid, Layers, Link2, Loader2,
  MapPin, Maximize2, Music, Palette, Plus, Save, Sparkles, Tag, Ticket, Trash2, Trophy, Upload, Utensils, Laugh, X,
} from 'lucide-react';
import { fadeUp } from '@/lib/motion';
import api from '@/lib/api/client';
import { createEvent, updateEvent } from '@/lib/api/events';
import type {
  EventCategory,
  EventLayoutConfig,
  EventLayoutFixture,
  EventLayoutPosition,
  SeatingMode,
  SeatZone,
} from '@/types';
import type { EventFormPayload } from '@/lib/api/events';

// ── Types ──────────────────────────────────────────────────────────────────

interface SeatZoneForm {
  id?: number;        // if editing existing zone
  name: string;
  price: string;      // string for input; parse to number on submit
  color: string;
  total_rows: string;
  total_cols: string;
  capacity: string;   // for zoned / admission (maps to total_cols=capacity, total_rows=1 on save)
}

type Step = 1 | 2 | 3;

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: {
  value: EventCategory;
  label: string;
  Icon: React.ElementType;
  accent: string;
  ring: string;
}[] = [
  { value: 'music',         label: 'Âm nhạc',   Icon: Music,         accent: 'bg-rose-100 text-rose-600',       ring: 'ring-rose-200' },
  { value: 'arts',          label: 'Nghệ thuật', Icon: Palette,       accent: 'bg-sky-100 text-sky-600',         ring: 'ring-sky-200' },
  { value: 'sports',        label: 'Thể thao',   Icon: Trophy,        accent: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-200' },
  { value: 'food',          label: 'Ẩm thực',    Icon: Utensils,      accent: 'bg-teal-100 text-teal-600',       ring: 'ring-teal-200' },
  { value: 'entertainment', label: 'Giải trí',   Icon: Laugh,         accent: 'bg-purple-100 text-purple-600',   ring: 'ring-purple-200' },
  { value: 'workshop',      label: 'Hội thảo',   Icon: GraduationCap, accent: 'bg-amber-100 text-amber-600',     ring: 'ring-amber-200' },
  { value: 'stage',         label: 'Sân khấu',   Icon: Clapperboard,  accent: 'bg-orange-100 text-orange-600',   ring: 'ring-orange-200' },
  { value: 'other',         label: 'Khác',       Icon: Sparkles,      accent: 'bg-stone-100 text-stone-600',     ring: 'ring-stone-200' },
];

const ZONE_COLORS = [
  '#d97706', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e',
  '#f59e0b', '#14b8a6', '#6366f1', '#ec4899', '#84cc16',
];

const EMPTY_ZONE: SeatZoneForm = {
  name: '', price: '', color: ZONE_COLORS[0], total_rows: '', total_cols: '', capacity: '',
};

const SEATING_MODES: { value: SeatingMode; label: string; sub: string; Icon: React.ElementType; example: string }[] = [
  { value: 'seated',    label: 'Ghế ngồi', sub: 'Mỗi khách có số ghế riêng',          Icon: LayoutGrid, example: 'Rạp chiếu phim, hội thảo, sân khấu nhỏ' },
  { value: 'zoned',     label: 'Khu vực',   sub: 'Chia theo khu, không có ghế cụ thể',  Icon: Layers,     example: 'Hòa nhạc, sân vận động, festival' },
  { value: 'admission', label: 'Vào cửa',   sub: 'Vé không có chỗ ngồi cố định',     Icon: Ticket,     example: 'Triển lãm, hội chợ, sự kiện đứng' },
];

// ── Layout patterns for seated / zoned modes ────────────────────────────────────────
interface ZoneTemplate {
  name: string; color: string;
  total_rows?: string; total_cols?: string; capacity?: string;
}
type DiagramType = 'rows' | 'bands' | 'concert' | 'quadrant';
interface LayoutPattern {
  id: string; label: string; sub: string; Icon: React.ElementType;
  diagram: DiagramType; zones: ZoneTemplate[];
  savedPositions?: ZonePos[]; // for user-saved custom layouts
  savedFixtures?: CanvasFixture[];
}

interface SavedLayoutPatternDto {
  id: number;
  label: string;
  seating_mode: 'seated' | 'zoned';
  diagram: DiagramType;
  zones: ZoneTemplate[];
  positions: ZonePos[];
  fixtures: CanvasFixture[];
}

const SEATED_PATTERNS: LayoutPattern[] = [
  { id: 'stage-simple', label: 'Sân khấu nhỏ', sub: '1 khu · 96 ghế',    Icon: Clapperboard, diagram: 'rows',
    zones: [{ name: 'Khán giả', color: ZONE_COLORS[2], total_rows: '8',  total_cols: '12' }] },
  { id: 'theater-vip',  label: 'Nhà hát VIP',    sub: '2 khu · VIP + Thường', Icon: Clapperboard, diagram: 'rows',
    zones: [
      { name: 'VIP',    color: ZONE_COLORS[4], total_rows: '3',  total_cols: '20' },
      { name: 'Thường', color: ZONE_COLORS[2], total_rows: '8',  total_cols: '20' },
    ] },
  { id: 'cinema',       label: 'Rạp chiếu phim', sub: '1 khu · 216 ghế', Icon: Clapperboard, diagram: 'rows',
    zones: [{ name: 'Khán giả', color: ZONE_COLORS[3], total_rows: '12', total_cols: '18' }] },
  { id: 'conference',   label: 'Hội thảo',       sub: '2 khu sông song',    Icon: GraduationCap, diagram: 'rows',
    zones: [
      { name: 'Khu A', color: ZONE_COLORS[0], total_rows: '6', total_cols: '8' },
      { name: 'Khu B', color: ZONE_COLORS[1], total_rows: '6', total_cols: '8' },
    ] },
  { id: 'custom', label: 'Tuỳ chỉnh', sub: 'Tự thiết kế', Icon: Plus, diagram: 'rows', zones: [] },
];

const ZONED_PATTERNS: LayoutPattern[] = [
  // Concert-style: stage at top, VIP pit center, two flanking wings, standing back
  { id: 'concert',  label: 'Hòa nhạc',      sub: '4 khu · VIP + Cánh + Đứng', Icon: Music,   diagram: 'concert',
    zones: [
      { name: 'VIP',        color: '#ef4444', capacity: '500'  }, // red pit
      { name: 'Cánh trái',  color: ZONE_COLORS[0], capacity: '800'  }, // amber left
      { name: 'Cánh phải', color: ZONE_COLORS[0], capacity: '800'  }, // amber right
      { name: 'Đứng tự do', color: ZONE_COLORS[1], capacity: '2000' }, // emerald standing
    ] },
  // Stadium: 4 stand quadrants around a field
  { id: 'stadium',  label: 'Sân vận động', sub: '4 khán đài A–D',          Icon: Trophy,  diagram: 'quadrant',
    zones: [
      { name: 'Khán đài A', color: ZONE_COLORS[0], capacity: '2500' },
      { name: 'Khán đài B', color: ZONE_COLORS[2], capacity: '2500' },
      { name: 'Khán đài C', color: ZONE_COLORS[3], capacity: '2500' },
      { name: 'Khán đài D', color: ZONE_COLORS[1], capacity: '2500' },
    ] },
  // Festival: 3 price tiers in horizontal bands
  { id: 'festival', label: 'Festival',      sub: '3 khu · VIP – Standard – Free', Icon: Sparkles, diagram: 'bands',
    zones: [
      { name: 'VIP',      color: ZONE_COLORS[4], capacity: '400'  },
      { name: 'Standard', color: ZONE_COLORS[2], capacity: '1500' },
      { name: 'Free',     color: ZONE_COLORS[1], capacity: '3000' },
    ] },
  { id: 'custom', label: 'Tuỳ chỉnh', sub: 'Tự thiết kế', Icon: Plus, diagram: 'bands', zones: [] },
];

// ── Canvas zone position data ──────────────────────────────────────────────
type ZonePos = EventLayoutPosition;

const DEFAULT_ZONE_POS = { x: 5, y: 14, w: 28, h: 32 };
const MAX_SEATED_ROWS = 26;
const MAX_SEATED_COLS = 50;
const SEATED_ZONE_MAX_WIDTH = 92;
const SEATED_ZONE_PADDING_X = 2.6;
const SEATED_ZONE_PADDING_Y = 2.4;
const SEATED_ZONE_LABEL_HEIGHT = 4.2;
const SEAT_PITCH_X = (SEATED_ZONE_MAX_WIDTH - SEATED_ZONE_PADDING_X) / MAX_SEATED_COLS;
const NORMAL_CANVAS_ASPECT = 16 / 10;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function deriveSeatedZoneSize(zone: SeatZoneForm, base: ZonePos): Pick<ZonePos, 'w' | 'h'> {
  const rows = Number(zone.total_rows || 0);
  const cols = Number(zone.total_cols || 0);

  // Chưa có ma trận thì giữ kích thước mặc định để khu vẫn dễ chọn, dễ kéo.
  if (!rows || !cols) return { w: base.w, h: base.h };

  // Ghế là đơn vị đo. 50 cột chiếm trọn bề ngang cho phép,
  // ít cột hơn thì khu co đúng theo số ghế, không còn khoảng rỗng giả.
  const safeRows = clamp(rows, 1, MAX_SEATED_ROWS);
  const safeCols = clamp(cols, 1, MAX_SEATED_COLS);
  const seatPitchY = SEAT_PITCH_X * NORMAL_CANVAS_ASPECT;

  return {
    w: SEATED_ZONE_PADDING_X + safeCols * SEAT_PITCH_X,
    h: SEATED_ZONE_LABEL_HEIGHT + SEATED_ZONE_PADDING_Y + safeRows * seatPitchY,
  };
}

function fitZoneIntoCanvas(pos: ZonePos): ZonePos {
  return {
    ...pos,
    x: clamp(pos.x, 0, Math.max(0, 100 - pos.w)),
    y: clamp(pos.y, 0, Math.max(0, 100 - pos.h)),
  };
}

function getDefaultZonePos(index: number): ZonePos {
  return {
    ...DEFAULT_ZONE_POS,
    x: DEFAULT_ZONE_POS.x + (index % 3) * 32,
    y: DEFAULT_ZONE_POS.y + Math.floor(index / 3) * 38,
  };
}

function getVisibleZonePos(mode: SeatingMode, zone: SeatZoneForm, index: number, positions: ZonePos[]): ZonePos {
  const base = positions[index] ?? getDefaultZonePos(index);
  if (mode !== 'seated') return base;
  const size = deriveSeatedZoneSize(zone, base);
  return fitZoneIntoCanvas({
    ...base,
    ...size,
    x: base.x + (base.w - size.w) / 2,
  });
}

const PATTERN_POSITIONS: Record<string, ZonePos[]> = {
  'stage-simple': [{ x: 5, y: 15, w: 90, h: 78 }],
  'theater-vip':  [{ x: 5, y: 12, w: 90, h: 30 }, { x: 5, y: 44, w: 90, h: 46 }],
  'cinema':       [{ x: 5, y: 15, w: 90, h: 78 }],
  'conference':   [{ x: 5, y: 15, w: 43, h: 78 }, { x: 52, y: 15, w: 43, h: 78 }],
  'concert': [
    { x: 28, y: 12, w: 44, h: 30 },  // VIP pit
    { x:  0, y: 12, w: 26, h: 53 },  // Cánh trái
    { x: 74, y: 12, w: 26, h: 53 },  // Cánh phải
    { x:  0, y: 67, w: 100, h: 31 }, // Đứng tự do
  ],
  'stadium': [
    { x: 20, y:  0, w: 60, h: 28 }, // A (top)
    { x: 72, y: 30, w: 28, h: 40 }, // B (right)
    { x: 20, y: 72, w: 60, h: 28 }, // C (bottom)
    { x:  0, y: 30, w: 28, h: 40 }, // D (left)
  ],
  'festival': [
    { x: 0, y:  0, w: 100, h: 18 },
    { x: 0, y: 20, w: 100, h: 38 },
    { x: 0, y: 60, w: 100, h: 40 },
  ],
};

// ── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ step, totalSteps }: { step: Step; totalSteps: number }) {
  const steps = [
    { label: 'Thông tin', sub: 'Tên, địa điểm, thời gian' },
    { label: 'Khu vực ghế', sub: 'Cấu hình zones & giá' },
    { label: 'Xem trước', sub: 'Kiểm tra & lưu' },
  ];
  return (
    <div className="mb-8 flex items-start gap-0">
      {steps.slice(0, totalSteps).map((s, i) => {
        const num    = (i + 1) as Step;
        const done   = step > num;
        const active = step === num;
        return (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done   ? 'bg-amber-500 text-white'
                : active ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-400'
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : num}
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold ${active ? 'text-stone-900' : 'text-stone-400'}`}>{s.label}</p>
                <p className="hidden text-[10px] text-stone-400 sm:block">{s.sub}</p>
              </div>
            </div>
            {i < totalSteps - 1 && (
              <div className={`mx-2 mb-4 h-px flex-1 transition-colors ${done ? 'bg-amber-400' : 'bg-stone-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 — Event info ────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">{children}</span>;
}

// ── Poster field (URL or file upload) ───────────────────────────────────────

function PosterField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [tab, setTab] = React.useState<'url' | 'upload'>(value.startsWith('data:') ? 'upload' : 'url');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (typeof ev.target?.result === 'string') onChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const preview = value && (value.startsWith('http') || value.startsWith('data:'));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <FieldLabel>Poster</FieldLabel>
        <div className="flex overflow-hidden rounded-lg border border-stone-200 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex items-center gap-1 px-3 py-1 transition-colors ${
              tab === 'url' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <Link2 className="h-3 w-3" /> URL
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-1 px-3 py-1 transition-colors ${
              tab === 'upload' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <Upload className="h-3 w-3" /> Tải lên
          </button>
        </div>
      </div>

      {tab === 'url' ? (
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={value.startsWith('data:') ? '' : value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/poster.jpg"
            className="h-11 w-full rounded-xl border border-stone-200 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-11 w-full items-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 text-sm text-stone-500 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
        >
          <Upload className="h-4 w-4" />
          {value.startsWith('data:') ? 'Đổi ảnh khác' : 'Chọn ảnh từ thiết bị…'}
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {preview && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Poster preview"
            className="h-44 w-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => { onChange(''); if (fileRef.current) fileRef.current.value = ''; }}
            className="absolute right-2 top-2 rounded-lg bg-black/40 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm hover:bg-black/60"
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}


function Step1({
  form, onChange,
}: {
  form: EventFormPayload;
  onChange: (next: EventFormPayload) => void;
}) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-5">
      <div>
        <FieldLabel>Tên sự kiện <span className="text-red-400">*</span></FieldLabel>
        <input
          value={form.title}
          onChange={e => onChange({ ...form, title: e.target.value })}
          placeholder="VD: Lễ hội âm nhạc mùa hè 2025"
          className="h-11 w-full rounded-xl border border-stone-200 px-4 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div>
        <FieldLabel>Mô tả</FieldLabel>
        <textarea
          value={form.description ?? ''}
          onChange={e => onChange({ ...form, description: e.target.value })}
          rows={4}
          placeholder="Mô tả ngắn về sự kiện, chương trình nghệ sĩ, lưu ý…"
          className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Danh mục <span className="text-red-400">*</span></FieldLabel>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {CATEGORY_OPTIONS.map(({ value, label, Icon, accent, ring }) => {
              const selected = form.category === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ ...form, category: value })}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border py-3 text-[11px] font-semibold transition-all ${
                    selected
                      ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ring-2 transition-transform duration-200 group-hover:scale-105 ${
                    selected ? accent + ' ring-amber-300' : accent + ' ' + ring
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <FieldLabel>Thời gian <span className="text-red-400">*</span></FieldLabel>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={e => onChange({ ...form, event_date: e.target.value })}
                className="h-11 w-full rounded-xl border border-stone-200 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Địa điểm <span className="text-red-400">*</span></FieldLabel>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={form.venue}
                onChange={e => onChange({ ...form, venue: e.target.value })}
                placeholder="VD: Sân vận động Mỹ Đình, Hà Nội"
                className="h-11 w-full rounded-xl border border-stone-200 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>
      </div>

      <PosterField
        value={form.poster_url ?? ''}
        onChange={url => onChange({ ...form, poster_url: url })}
      />
    </motion.div>
  );
}

// ── Step 2 — Seat zones (3-mode redesign) ─────────────────────────────────

function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ZONE_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          style={{ backgroundColor: c }}
          className={`h-6 w-6 rounded-md transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-stone-900 ring-offset-1' : ''}`}
          aria-label={c}
        />
      ))}
      <input
        type="color"
        value={color}
        onChange={e => onChange(e.target.value)}
        className="h-6 w-6 cursor-pointer rounded-md border-0 p-0 outline-none"
        title="Màu tuỳ chỉnh"
      />
    </div>
  );
}

// Pattern picker component with context-aware mini diagrams
function ZoneDiagram({ diagram, zones }: { diagram: DiagramType; zones: ZoneTemplate[] }) {
  if (zones.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Plus className="h-4 w-4 text-stone-300" />
      </div>
    );
  }

  if (diagram === 'rows') {
    // Seat-row dots — bands colored by zone from front to back
    const totalZones = zones.length;
    const rowsPerZone = totalZones === 1 ? 4 : totalZones === 2 ? [2, 3] : zones.map(() => 2);
    const rows: string[] = [];
    zones.forEach((z, zi) => {
      const count = Array.isArray(rowsPerZone) ? (typeof rowsPerZone[0] === 'number' ? (rowsPerZone as number[])[zi] : 2) : rowsPerZone;
      Array.from({ length: typeof count === 'number' ? count : 2 }).forEach(() => rows.push(z.color));
    });
    return (
      <div className="flex h-full flex-col justify-center gap-[3px] px-1.5 py-1.5">
        {rows.map((color, ri) => (
          <div key={ri} className="flex gap-[2px]">
            {Array.from({ length: 8 }).map((_, ci) => (
              <div key={ci} className="h-[4px] flex-1 rounded-[1px]" style={{ backgroundColor: color }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (diagram === 'quadrant') {
    // 2×2 colored squares — each representing a stand
    return (
      <div className="grid h-full grid-cols-2 gap-[3px] p-1.5">
        {zones.slice(0, 4).map((z, zi) => (
          <div key={zi} className="rounded-[3px] flex items-center justify-center" style={{ backgroundColor: z.color }}>
            <span className="text-[7px] font-bold text-white/90">{String.fromCharCode(65 + zi)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (diagram === 'concert') {
    // Stage bar at top, VIP rectangle below it centered, flanking wings on sides, standing bar at bottom
    const [vip, left, right, standing] = zones;
    return (
      <div className="flex h-full flex-col gap-[2px] p-1.5">
        {/* Stage */}
        <div className="h-[5px] rounded-[2px] bg-stone-400" />
        {/* Middle row: left wing | VIP center | right wing */}
        <div className="flex flex-1 gap-[2px]">
          <div className="w-[30%] rounded-[2px]" style={{ backgroundColor: left?.color ?? '#d97706' }} />
          <div className="flex-1 rounded-[2px]" style={{ backgroundColor: vip?.color ?? '#ef4444' }} />
          <div className="w-[30%] rounded-[2px]" style={{ backgroundColor: right?.color ?? '#d97706' }} />
        </div>
        {/* Standing bottom */}
        <div className="h-[6px] rounded-[2px]" style={{ backgroundColor: standing?.color ?? '#10b981' }} />
      </div>
    );
  }

  // bands: proportional horizontal bands (festival default)
  return (
    <div className="flex h-full flex-col gap-[2px] p-1.5">
      {zones.map((z, zi) => (
        <div key={zi} style={{ flex: Number(z.capacity || 1), backgroundColor: z.color }} className="rounded-[2px]" />
      ))}
    </div>
  );
}

function PatternPicker({
  patterns, selectedId, onSelect,
}: {
  patterns: LayoutPattern[];
  selectedId: string | null;
  onSelect: (p: LayoutPattern) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {patterns.map(p => {
        const sel = selectedId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            className={`group flex flex-col gap-2 rounded-xl border p-2.5 text-left transition-all ${
              sel ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            {/* Mini diagram */}
            <div className={`h-12 w-full overflow-hidden rounded-lg ${p.id === 'custom' ? 'bg-stone-100' : 'bg-stone-100'}`}>
              <ZoneDiagram diagram={p.diagram} zones={p.zones} />
            </div>
            <div className="flex-1">
              <p className={`text-[11px] font-semibold leading-tight ${sel ? 'text-amber-800' : 'text-stone-700'}`}>{p.label}</p>
              <p className={`mt-0.5 text-[10px] leading-tight ${sel ? 'text-amber-500' : 'text-stone-400'}`}>{p.sub}</p>
            </div>
            {sel && <Check className="ml-auto h-3 w-3 shrink-0 text-amber-500" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Canvas fixture (stage, field, screen, podium) ─────────────────────────
type CanvasFixture = EventLayoutFixture;

const PATTERN_FIXTURES: Record<string, CanvasFixture[]> = {
  'stage-simple': [{ id: 'stage',  label: 'Sân khấu',     color: '#57534e', textColor: 'white',   pos: { x: 27, y: 0, w: 46, h: 12 } }],
  'theater-vip':  [{ id: 'stage',  label: 'Sân khấu',     color: '#57534e', textColor: 'white',   pos: { x: 24, y: 0, w: 52, h: 10 } }],
  'cinema':       [{ id: 'screen', label: 'Màn hình',      color: '#1e293b', textColor: '#94a3b8', pos: { x: 16, y: 0, w: 68, h: 9  } }],
  'conference':   [{ id: 'stage',  label: 'Bục phát biểu', color: '#57534e', textColor: 'white',   pos: { x: 35, y: 0, w: 30, h: 11 } }],
  'concert':      [{ id: 'stage',  label: 'Sân khấu',     color: '#57534e', textColor: 'white',   pos: { x: 24, y: 0, w: 52, h: 11 } }],
  'stadium':      [{ id: 'field',  label: 'Sân',           color: '#bbf7d0', textColor: '#166534', pos: { x: 20, y: 28, w: 60, h: 44 } }],
  'festival':     [{ id: 'stage',  label: 'Main Stage',    color: '#57534e', textColor: 'white',   pos: { x: 27, y: 0, w: 46, h: 17 } }],
};

// Detailed seat-grid shown inside each zone box on the seated canvas
function SeatMatrixPreview({ zone }: { zone: SeatZoneForm }) {
  const rows = Number(zone.total_rows || 0);
  const cols = Number(zone.total_cols || 0);
  if (!rows || !cols) return null;
  const safeRows = clamp(rows, 1, MAX_SEATED_ROWS);
  const safeCols = clamp(cols, 1, MAX_SEATED_COLS);

  return (
    <div className="flex w-full flex-col gap-[2px]">
      {Array.from({ length: safeRows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-[3px]">
          <span className="w-[10px] shrink-0 text-[7px] font-bold leading-none text-white/80">
            {String.fromCharCode(65 + rowIndex)}
          </span>
          <div
            className="grid min-w-0 flex-1 gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: safeCols }).map((__, colIndex) => (
              <div
                key={colIndex}
                className="aspect-square rounded-[2px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.72)' }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Unified venue canvas (seated + zoned) ─────────────────────────────────
// selectedIdx: null = nothing selected, >= 0 = zone, < 0 = fixture (-1-i)
// Click canvas background → onSelect(null) deselects.
// Resize handles: e (right), s (bottom), se (bottom-right), sw (bottom-left).
// Grid overlay + snap-to-5% available for fullscreen mode.
function VenueCanvas({
  mode, zones, positions, fixtures, selectedIdx, showGrid, snapGrid,
  onSelect, onPositionsChange, onFixturesChange,
}: {
  mode: 'seated' | 'zoned';
  zones: SeatZoneForm[]; positions: ZonePos[]; fixtures: CanvasFixture[];
  selectedIdx: number | null;
  showGrid?: boolean; snapGrid?: boolean;
  onSelect: (i: number | null) => void;
  onPositionsChange: (p: ZonePos[]) => void;
  onFixturesChange: (f: CanvasFixture[]) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const SNAP_SIZE = 5;

  type DragAct   = { type: 'drag';   kind: 'zone' | 'fix'; i: number; startX: number; startY: number; origX: number; origY: number };
  type ResizeAct = { type: 'resize'; kind: 'zone' | 'fix'; i: number; handle: 'e' | 's' | 'se' | 'sw'; startX: number; startY: number; orig: ZonePos };
  const [action, setAction] = useState<DragAct | ResizeAct | null>(null);

  const doSnap = useCallback((v: number) => snapGrid ? Math.round(v / SNAP_SIZE) * SNAP_SIZE : v, [snapGrid]);

  const getXY = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      cx: (e.clientX - rect.left) / rect.width * 100,
      cy: (e.clientY - rect.top) / rect.height * 100,
    };
  }, []);

  const getZonePos = useCallback((i: number): ZonePos => {
    return getVisibleZonePos(mode, zones[i], i, positions);
  }, [mode, positions, zones]);

  const getFixPos = (i: number): ZonePos => fixtures[i]?.pos ?? { x: 30, y: 0, w: 40, h: 10 };

  const applyPos = useCallback((kind: 'zone' | 'fix', i: number, pos: ZonePos) => {
    if (kind === 'zone') {
      const next = [...positions]; next[i] = pos; onPositionsChange(next);
    } else {
      onFixturesChange(fixtures.map((f, fi) => fi === i ? { ...f, pos } : f));
    }
  }, [positions, fixtures, onPositionsChange, onFixturesChange]);

  const startDrag = (e: React.PointerEvent, kind: 'zone' | 'fix', i: number) => {
    e.preventDefault(); e.stopPropagation();
    const { cx, cy } = getXY(e);
    const pos = kind === 'zone' ? getZonePos(i) : getFixPos(i);
    canvasRef.current!.setPointerCapture(e.pointerId);
    setAction({ type: 'drag', kind, i, startX: cx, startY: cy, origX: pos.x, origY: pos.y });
    onSelect(kind === 'zone' ? i : -1 - i);
  };

  const startResize = (e: React.PointerEvent, kind: 'zone' | 'fix', i: number, handle: ResizeAct['handle']) => {
    e.preventDefault(); e.stopPropagation();
    if (mode === 'seated' && (kind === 'zone' || fixtures[i]?.id !== 'stage')) return;
    const { cx, cy } = getXY(e);
    const pos = kind === 'zone' ? getZonePos(i) : getFixPos(i);
    canvasRef.current!.setPointerCapture(e.pointerId);
    setAction({ type: 'resize', kind, i, handle, startX: cx, startY: cy, orig: { ...pos } });
    onSelect(kind === 'zone' ? i : -1 - i);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!action) return;
    const { cx, cy } = getXY(e);
    const MIN = 6;
    if (action.type === 'drag') {
      const cur = action.kind === 'zone' ? getZonePos(action.i) : getFixPos(action.i);
      const dx = cx - action.startX, dy = cy - action.startY;
      applyPos(action.kind, action.i, {
        ...cur,
        x: doSnap(Math.max(0, Math.min(100 - cur.w, action.origX + dx))),
        y: doSnap(Math.max(0, Math.min(100 - cur.h, action.origY + dy))),
      });
    } else {
      const dx = cx - action.startX, dy = cy - action.startY;
      const { orig, handle } = action;
      let { x, w, h } = orig;
      const { y } = orig;
      if (handle === 'e')  { w = doSnap(Math.max(MIN, Math.min(100 - x, orig.w + dx))); }
      if (handle === 's')  { h = doSnap(Math.max(MIN, Math.min(100 - y, orig.h + dy))); }
      if (handle === 'se') { w = doSnap(Math.max(MIN, Math.min(100 - x, orig.w + dx))); h = doSnap(Math.max(MIN, Math.min(100 - y, orig.h + dy))); }
      if (handle === 'sw') {
        const nw = doSnap(Math.max(MIN, orig.w - dx));
        x = doSnap(Math.max(0, orig.x + orig.w - nw));
        w = doSnap(Math.max(MIN, orig.x + orig.w - x));
        h = doSnap(Math.max(MIN, Math.min(100 - y, orig.h + dy)));
      }
      applyPos(action.kind, action.i, { x, y, w, h });
    }
  };

  const handleUp = (e: React.PointerEvent) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    setAction(null);
  };

  // Giữ canvas phóng to đủ cao để ma trận tối đa 26 hàng vẫn còn khoảng thở và không bị cắt đáy.
  const aspect = '16 / 10';
  const gridBg = showGrid
    ? `repeating-linear-gradient(0deg,transparent,transparent calc(5% - 1px),rgba(99,102,241,0.12) calc(5% - 1px),rgba(99,102,241,0.12) 5%),repeating-linear-gradient(90deg,transparent,transparent calc(5% - 1px),rgba(99,102,241,0.12) calc(5% - 1px),rgba(99,102,241,0.12) 5%)`
    : undefined;

  const selFixIdx = selectedIdx !== null && selectedIdx < 0 ? -selectedIdx - 1 : null;

  const canResize = (kind: 'zone' | 'fix', i: number) =>
    mode !== 'seated' || (kind === 'fix' && fixtures[i]?.id === 'stage');

  const ResizeHandles = ({ kind, i }: { kind: 'zone' | 'fix'; i: number }) => (
    <>
      <div className="absolute -right-1.5 top-[20%] h-[60%] w-3 cursor-ew-resize rounded-full bg-white/90 shadow"
        onPointerDown={e => startResize(e, kind, i, 'e')} />
      <div className="absolute -bottom-1.5 left-[20%] h-3 w-[60%] cursor-ns-resize rounded-full bg-white/90 shadow"
        onPointerDown={e => startResize(e, kind, i, 's')} />
      <div className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full bg-white shadow ring-2 ring-amber-400"
        onPointerDown={e => startResize(e, kind, i, 'se')} />
      <div className="absolute -bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded-full bg-white shadow ring-2 ring-amber-300"
        onPointerDown={e => startResize(e, kind, i, 'sw')} />
    </>
  );

  return (
    <div
      ref={canvasRef}
      className={`relative w-full select-none overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 ${action?.type === 'drag' ? 'cursor-grabbing' : ''}`}
      style={{ aspectRatio: aspect, touchAction: 'none', backgroundImage: gridBg }}
      onPointerDown={e => { if (e.target === canvasRef.current) onSelect(null); }}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
    >
      {/* Fixtures (stage, field, screen, etc.) */}
      {fixtures.map((fix, fi) => {
        const pos = fix.pos;
        const sel = selFixIdx === fi;
        const isDragging = action?.type === 'drag' && action.kind === 'fix' && action.i === fi;
        return (
          <div
            key={fix.id}
            className={`absolute z-10 flex select-none items-center justify-center overflow-hidden rounded-xl ${
              isDragging ? 'cursor-grabbing shadow-2xl' : 'cursor-grab'
            } ${sel ? 'shadow-lg ring-2 ring-amber-400 ring-offset-1' : 'opacity-85 hover:opacity-100 hover:shadow-md'}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: `${pos.w}%`, height: `${pos.h}%`, backgroundColor: fix.color }}
            onPointerDown={e => startDrag(e, 'fix', fi)}
          >
            <span className="select-none text-[9px] font-bold uppercase tracking-widest drop-shadow"
              style={{ color: fix.textColor }}>
              {fix.label}
            </span>
            {sel && canResize('fix', fi) && <ResizeHandles kind="fix" i={fi} />}
          </div>
        );
      })}

      {/* Zones */}
      {zones.map((zone, zi) => {
        const pos = getZonePos(zi);
        const sel = selectedIdx === zi;
        const isDragging = action?.type === 'drag' && action.kind === 'zone' && action.i === zi;
        return (
          <div
            key={zi}
            className={`absolute select-none overflow-hidden rounded-xl ${
              isDragging ? 'z-20 cursor-grabbing shadow-2xl' : sel ? 'z-10 cursor-grab shadow-lg' : 'cursor-grab opacity-90 hover:opacity-100 hover:shadow-md'
            } ${sel ? 'ring-2 ring-white ring-offset-1' : ''}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: `${pos.w}%`, height: `${pos.h}%`, backgroundColor: zone.color }}
            onPointerDown={e => startDrag(e, 'zone', zi)}
          >
            {mode === 'zoned' ? (
              <div className="flex h-full flex-col items-center justify-center gap-0.5 px-1">
                <p className="text-center text-[10px] font-bold leading-tight text-white drop-shadow">
                  {zone.name || `Khu ${zi + 1}`}
                </p>
                {zone.capacity && Number(zone.capacity) > 0 && (
                  <p className="text-[8px] text-white/75">{Number(zone.capacity).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <div className="relative flex h-full flex-col items-start justify-start overflow-hidden p-[5px]">
                <div className="mb-1 flex h-3 w-full items-center gap-1 overflow-hidden">
                  <span className="truncate rounded-full bg-black/15 px-1.5 py-[1px] text-[9px] font-bold leading-tight text-white shadow-sm">
                    {zone.name || `Khu ${zi + 1}`}
                  </span>
                  {Number(zone.total_rows || 0) > 0 && Number(zone.total_cols || 0) > 0 && (
                    <span className="shrink-0 rounded-full bg-black/10 px-1 py-[1px] text-[7px] text-white/80">
                      {zone.total_rows}×{zone.total_cols}
                    </span>
                  )}
                </div>
                <SeatMatrixPreview zone={zone} />
              </div>
            )}
            {sel && canResize('zone', zi) && <ResizeHandles kind="zone" i={zi} />}
          </div>
        );
      })}

      {zones.length === 0 && fixtures.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-stone-400">Chọn mẫu hoặc thêm khu vực để bắt đầu</p>
        </div>
      )}
    </div>
  );
}

// ── Fullscreen canvas modal ────────────────────────────────────────────────
function CanvasModal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
          <span className="text-sm font-semibold text-stone-700">Chỉnh sơ đồ chỗ ngồi</span>
          <button type="button" onClick={onClose}
            className="rounded-xl p-1.5 text-stone-500 transition-colors hover:bg-stone-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function SeatZoneCreateModal({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  onClose,
  onCreate,
}: {
  rows: string;
  cols: string;
  onRowsChange: (value: string) => void;
  onColsChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  const validRows = Number(rows) >= 1 && Number(rows) <= MAX_SEATED_ROWS;
  const validCols = Number(cols) >= 1 && Number(cols) <= MAX_SEATED_COLS;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-stone-900">Tạo khu ghế</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Nhập ma trận ban đầu để khu có kích thước ngay từ lúc tạo. Bạn vẫn chỉnh lại được ở panel bên phải.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Hàng (1–26)</FieldLabel>
            <input
              autoFocus
              type="number"
              min="1"
              max={MAX_SEATED_ROWS}
              value={rows}
              onChange={e => onRowsChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && validRows && validCols) onCreate(); }}
              placeholder="8"
              className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <FieldLabel>Cột (1–50)</FieldLabel>
            <input
              type="number"
              min="1"
              max={MAX_SEATED_COLS}
              value={cols}
              onChange={e => onColsChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && validRows && validCols) onCreate(); }}
              placeholder="14"
              className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50">
            Huỷ
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={!validRows || !validCols}
            className="rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tạo khu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Zone config panel (right sidebar) ─────────────────────────────────────
function ZoneConfigPanel({
  mode, zone, index, onChange, onRemove,
}: {
  mode: 'seated' | 'zoned'; zone: SeatZoneForm; index: number;
  onChange: (z: SeatZoneForm) => void; onRemove: () => void;
}) {
  const totalSeats = mode === 'seated'
    ? Number(zone.total_rows || 0) * Number(zone.total_cols || 0)
    : Number(zone.capacity || 0);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md" style={{ backgroundColor: zone.color }} />
          <span className="text-sm font-semibold text-stone-700">
            {zone.name || `Khu ${index + 1}`}
          </span>
          {totalSeats > 0 && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
              {totalSeats.toLocaleString()} {mode === 'seated' ? 'ghế' : 'chỗ'}
            </span>
          )}
        </div>
        <button type="button" onClick={onRemove}
          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div>
        <FieldLabel>Tên khu <span className="text-red-400">*</span></FieldLabel>
        <input
          value={zone.name} onChange={e => onChange({ ...zone, name: e.target.value })}
          placeholder={mode === 'seated' ? 'VD: VIP, Khu A, Tầng lầu…' : 'VD: Khán đài A, VIP Pit…'}
          className="h-9 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
      </div>
      <div>
        <FieldLabel>Giá vé (đ) <span className="text-red-400">*</span></FieldLabel>
        <input
          type="number" min="0" value={zone.price}
          onChange={e => onChange({ ...zone, price: e.target.value })} placeholder="500000"
          className="h-9 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
      </div>
      {mode === 'seated' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Hàng (1–26) <span className="text-red-400">*</span></FieldLabel>
              <input
                type="number" min="1" max={MAX_SEATED_ROWS} value={zone.total_rows}
                onChange={e => onChange({ ...zone, total_rows: e.target.value })} placeholder="8"
                className="h-9 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <FieldLabel>Cột (1–50) <span className="text-red-400">*</span></FieldLabel>
              <input
                type="number" min="1" max={MAX_SEATED_COLS} value={zone.total_cols}
                onChange={e => onChange({ ...zone, total_cols: e.target.value })} placeholder="14"
                className="h-9 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
          <p className="text-[11px] leading-snug text-stone-400">
            Khu ôm sát ma trận ghế. Tối đa 50 cột, kéo trên sơ đồ để đổi vị trí.
          </p>
        </div>
      )}
      {mode === 'zoned' && (
        <div>
          <FieldLabel>Sức chứa <span className="text-red-400">*</span></FieldLabel>
          <input
            type="number" min="1" value={zone.capacity}
            onChange={e => onChange({ ...zone, capacity: e.target.value })} placeholder="2000"
            className="h-9 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      )}
      <div>
        <FieldLabel>Màu nhận diện</FieldLabel>
        <ColorPicker color={zone.color} onChange={c => onChange({ ...zone, color: c })} />
      </div>
    </div>
  );
}

// Admission mode — ticket tiers as colored blocks, no seat assignment
function ZoneCardAdmission({
  zone, index, onChange, onRemove,
}: {
  zone: SeatZoneForm; index: number;
  onChange: (z: SeatZoneForm) => void; onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 p-5 space-y-4 transition-all"
      style={{ borderColor: zone.color + '60', backgroundColor: zone.color + '0d' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 rounded-md" style={{ backgroundColor: zone.color }} />
          <span className="text-sm font-semibold text-stone-700">{zone.name || `Loại vé ${index + 1}`}</span>
        </div>
        <button type="button" onClick={onRemove}
          className="rounded-lg p-1 text-stone-400 hover:bg-red-50 hover:text-red-500" aria-label="Xoá loại vé">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <FieldLabel>Tên loại vé <span className="text-red-400">*</span></FieldLabel>
          <input value={zone.name} onChange={e => onChange({ ...zone, name: e.target.value })}
            placeholder="VD: Vé thường, VIP…"
            className="h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-400" />
        </div>
        <div>
          <FieldLabel>Giá vé (đ) <span className="text-red-400">*</span></FieldLabel>
          <input type="number" min="0" value={zone.price}
            onChange={e => onChange({ ...zone, price: e.target.value })} placeholder="VD: 150000"
            className="h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-400" />
        </div>
        <div>
          <FieldLabel>Số lượng <span className="text-red-400">*</span></FieldLabel>
          <input type="number" min="1" value={zone.capacity}
            onChange={e => onChange({ ...zone, capacity: e.target.value })} placeholder="VD: 500"
            className="h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-400" />
        </div>
      </div>
      <div>
        <FieldLabel>Màu nhận diện</FieldLabel>
        <ColorPicker color={zone.color} onChange={c => onChange({ ...zone, color: c })} />
      </div>
    </div>
  );
}

function Step2({
  mode, zones, layout, onModeChange, onChange, onLayoutChange,
}: {
  mode: SeatingMode;
  zones: SeatZoneForm[];
  layout: EventLayoutConfig;
  onModeChange: (m: SeatingMode) => void;
  onChange: (zones: SeatZoneForm[]) => void;
  onLayoutChange: React.Dispatch<React.SetStateAction<EventLayoutConfig>>;
}) {
  const patternId = layout.pattern_id ?? null;
  const positions = layout.positions;
  const fixtures = layout.fixtures;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [savedPatterns, setSavedPatterns] = useState<LayoutPattern[]>([]);
  const [savingPattern, setSavingPattern] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showGrid, setShowGrid] = useState(false);
  const [snapGrid, setSnapGrid] = useState(false);
  const [showSeatZoneCreate, setShowSeatZoneCreate] = useState(false);
  const [newZoneRows, setNewZoneRows] = useState('');
  const [newZoneCols, setNewZoneCols] = useState('');

  const setPatternId = (nextPatternId: string | null) => {
    onLayoutChange((current) => ({ ...current, pattern_id: nextPatternId }));
  };
  const setPositions = (nextPositions: ZonePos[]) => {
    onLayoutChange((current) => ({ ...current, positions: nextPositions }));
  };
  const setFixtures = (nextFixtures: CanvasFixture[]) => {
    onLayoutChange((current) => ({ ...current, fixtures: nextFixtures }));
  };

  useEffect(() => {
    let mounted = true;
    api.get<{ data: SavedLayoutPatternDto[] }>('/admin/layout-patterns')
      .then((response) => {
        if (!mounted) return;
        setSavedPatterns(response.data.data.map((pattern) => ({
          id: `saved-${pattern.id}`,
          label: pattern.label,
          sub: pattern.seating_mode === 'seated'
            ? `${pattern.zones.length} khu ghế đã lưu`
            : `${pattern.zones.length} khu vực đã lưu`,
          Icon: Tag,
          diagram: pattern.diagram,
          zones: pattern.zones,
          savedPositions: pattern.positions,
          savedFixtures: pattern.fixtures,
        })));
      })
      .catch(() => {
        // Built-in patterns remain usable even if the pattern endpoint is unavailable.
      });
    return () => { mounted = false; };
  }, []);

  const handlePatternSelect = (p: LayoutPattern) => {
    setPatternId(p.id);
    const newZones = p.zones.map(t => ({
      ...EMPTY_ZONE,
      name: t.name, color: t.color,
      total_rows: t.total_rows ?? '',
      total_cols: t.total_cols ?? '',
      capacity:   t.capacity ?? '',
    }));
    onChange(newZones);
    setPositions(p.savedPositions ?? PATTERN_POSITIONS[p.id] ?? []);
    setFixtures(
      p.savedFixtures
        ? p.savedFixtures.map((fixture) => ({ ...fixture, pos: { ...fixture.pos } }))
        : PATTERN_FIXTURES[p.id]
          ? PATTERN_FIXTURES[p.id].map((fixture) => ({ ...fixture, pos: { ...fixture.pos } }))
          : [],
    );
    setSelectedIdx(newZones.length > 0 ? 0 : null);
  };

  const appendZone = (zoneOverrides: Partial<SeatZoneForm> = {}) => {
    const color = ZONE_COLORS[zones.length % ZONE_COLORS.length];
    onChange([...zones, { ...EMPTY_ZONE, color, ...zoneOverrides }]);
    setPositions([
      ...positions,
      { x: 5 + (zones.length % 3) * 32, y: 20 + Math.floor(zones.length / 3) * 40, w: 28, h: 35 },
    ]);
    setSelectedIdx(zones.length);
  };

  const addZone = () => {
    if (mode === 'seated') {
      setNewZoneRows('');
      setNewZoneCols('');
      setShowSeatZoneCreate(true);
      return;
    }
    appendZone();
  };

  const createSeatedZone = () => {
    const rows = Number(newZoneRows);
    const cols = Number(newZoneCols);
    if (rows < 1 || rows > MAX_SEATED_ROWS || cols < 1 || cols > MAX_SEATED_COLS) return;
    appendZone({ total_rows: String(rows), total_cols: String(cols) });
    setShowSeatZoneCreate(false);
    setNewZoneRows('');
    setNewZoneCols('');
  };

  const updateZone = (i: number, z: SeatZoneForm) => { const next = [...zones]; next[i] = z; onChange(next); };

  const removeZone = (i: number) => {
    onChange(zones.filter((_, idx) => idx !== i));
    setPositions(positions.filter((_, idx) => idx !== i));
    if (selectedIdx === i) setSelectedIdx(zones.length > 1 ? Math.max(0, i - 1) : null);
    else if (selectedIdx !== null && selectedIdx > i) setSelectedIdx(selectedIdx - 1);
  };

  const resetLayout = () => { setPatternId(null); onChange([]); setPositions([]); setSelectedIdx(null); setFixtures([]); };

  const savePattern = async () => {
    if (!saveName.trim() || zones.length === 0 || mode === 'admission') return;
    const total = zones.reduce((a, z) => {
      if (mode === 'seated') return a + Number(z.total_rows || 0) * Number(z.total_cols || 0);
      return a + Number(z.capacity || 0);
    }, 0);
    const patternPayload = {
      label: saveName.trim(),
      seating_mode: mode,
      diagram: mode === 'seated' ? 'rows' as const : 'bands' as const,
      zones: zones.map(z => ({
        name: z.name, color: z.color,
        total_rows: z.total_rows, total_cols: z.total_cols, capacity: z.capacity,
      })),
      positions: zones.map((zone, index) => getVisibleZonePos(mode, zone, index, positions)),
      fixtures: fixtures.map((fixture) => ({ ...fixture, pos: { ...fixture.pos } })),
    };
    setSavingPattern(true);
    try {
      const response = await api.post<{ data: SavedLayoutPatternDto }>('/admin/layout-patterns', patternPayload);
      const saved = response.data.data;
      const pat: LayoutPattern = {
        id: `saved-${saved.id}`,
        label: saved.label,
        sub: mode === 'seated'
          ? `${zones.length} khu · ${total.toLocaleString()} ghế`
          : `${zones.length} khu · ${total.toLocaleString()} chỗ`,
        Icon: Tag,
        diagram: saved.diagram,
        zones: saved.zones,
        savedPositions: saved.positions,
        savedFixtures: saved.fixtures,
      };
      setSavedPatterns((current) => [pat, ...current]);
      setPatternId(pat.id);
      setSaveName('');
      setShowSaveInput(false);
      toast.success('Đã lưu mẫu sơ đồ.');
    } catch {
      toast.error('Không thể lưu mẫu sơ đồ.');
    } finally {
      setSavingPattern(false);
    }
  };

  const selFixIdx = selectedIdx !== null && selectedIdx < 0 ? -selectedIdx - 1 : null;

  const totalCap = zones.reduce((acc, z) => {
    if (mode === 'seated') return acc + Number(z.total_rows || 0) * Number(z.total_cols || 0);
    return acc + Number(z.capacity || 0);
  }, 0);

  const addBtnLabel = mode === 'seated' ? 'Thêm khu ghế' : mode === 'zoned' ? 'Thêm khu vực' : 'Thêm loại vé';
  const summaryText = mode === 'seated'
    ? `${zones.length} khu · ${totalCap.toLocaleString()} ghế`
    : `${zones.length} khu vực · ${totalCap.toLocaleString()} chỗ`;

  const basePatterns = mode === 'seated' ? SEATED_PATTERNS : ZONED_PATTERNS;
  const allPatterns = [
    ...basePatterns,
    ...savedPatterns.filter(p =>
      mode === 'seated' ? p.diagram === 'rows' : p.diagram !== 'rows',
    ),
  ];
  const showPatternPicker = mode !== 'admission' && zones.length === 0 && patternId !== 'custom';
  const activePattern = allPatterns.find(p => p.id === patternId);

  const selFix = selFixIdx !== null ? fixtures[selFixIdx] ?? null : null;

  const zoneChips = (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-medium text-stone-400">
        {mode === 'zoned' ? 'Khu vực:' : 'Khu ghế:'}
      </span>
      {zones.map((z, i) => (
        <button key={i} type="button" onClick={() => setSelectedIdx(i)}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            selectedIdx === i ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}>
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: z.color }} />
          {z.name || `Khu ${i + 1}`}
        </button>
      ))}
      {fixtures.map((fix, fi) => (
        <button key={`fix-${fi}`} type="button" onClick={() => setSelectedIdx(-1 - fi)}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            selectedIdx === -1 - fi ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}>
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: fix.color }} />
          {fix.label}
        </button>
      ))}
    </div>
  );

  const saveInputEl = (
    <div className="flex items-center gap-2">
      {!showSaveInput ? (
        <button type="button" onClick={() => setShowSaveInput(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-stone-600">
          <Save className="h-3 w-3" /> Lưu sơ đồ này
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            autoFocus value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="Tên sơ đồ…"
            onKeyDown={e => {
              if (e.key === 'Enter') savePattern();
              if (e.key === 'Escape') { setShowSaveInput(false); setSaveName(''); }
            }}
            className="h-7 rounded-lg border border-stone-200 px-2 text-xs outline-none focus:border-amber-400"
          />
          <button type="button" onClick={savePattern} disabled={!saveName.trim() || savingPattern}
            className="rounded-lg bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-40 hover:bg-amber-600">
            {savingPattern ? 'Đang lưu…' : 'Lưu'}
          </button>
          <button type="button" onClick={() => { setShowSaveInput(false); setSaveName(''); }}
            className="text-[11px] text-stone-400 hover:text-stone-600">Huỷ</button>
        </div>
      )}
    </div>
  );

  // renderCanvasPanel: inModal = true → full-width canvas + grid/snap toolbar, no config panel
  const renderCanvasPanel = (inModal: boolean) => {
    const canvas = (
      <VenueCanvas
        mode={mode as 'seated' | 'zoned'}
        zones={zones} positions={positions} fixtures={fixtures}
        selectedIdx={selectedIdx}
        showGrid={inModal ? showGrid : false}
        snapGrid={inModal ? snapGrid : false}
        onSelect={setSelectedIdx}
        onPositionsChange={setPositions}
        onFixturesChange={setFixtures}
      />
    );

    if (inModal) {
      return (
        <div className="flex flex-col gap-3">
          {/* Fullscreen toolbar */}
          <div className="flex items-center gap-2">
            <p className="flex-1 text-sm font-semibold text-stone-700">{summaryText}</p>
            <button type="button" onClick={() => setShowGrid(g => !g)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                showGrid ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}>
              <LayoutGrid className="h-3 w-3" /> Lưới
            </button>
            <button type="button" onClick={() => setSnapGrid(s => !s)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                snapGrid ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}>
              <Link2 className="h-3 w-3" /> Căn lưới
            </button>
            <button
              type="button"
              onClick={() => {
                setFixtures([...fixtures, { id: `fix-${Date.now()}`, label: 'SÂN KHẤU', color: '#1c1c1c', textColor: '#ffffff', pos: { x: 30, y: 5, w: 40, h: 10 } }]);
                setSelectedIdx(-1 - fixtures.length);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm điểm cố định
            </button>
            <button type="button" onClick={addZone}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800">
              <Plus className="h-3.5 w-3.5" /> {addBtnLabel}
            </button>
          </div>
          {canvas}
          {zoneChips}
        </div>
      );
    }

    // Normal view: canvas + narrow config panel
    return (
      <div className="flex gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {canvas}
          {zoneChips}
          {saveInputEl}
        </div>
        <div className="w-[188px] shrink-0">
          {selFix ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-md" style={{ backgroundColor: selFix.color }} />
                  <span className="text-sm font-semibold text-stone-700">Điểm cố định</span>
                </div>
                <button type="button" onClick={() => {
                  setFixtures(fixtures.filter((_, idx) => idx !== selFixIdx));
                  setSelectedIdx(null);
                }} className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <FieldLabel>Nhãn</FieldLabel>
                <input value={selFix.label}
                  onChange={e => {
                    const next = [...fixtures];
                    next[selFixIdx!] = { ...next[selFixIdx!], label: e.target.value };
                    setFixtures(next);
                  }}
                  className="h-9 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <FieldLabel>Màu nền</FieldLabel>
                <ColorPicker color={selFix.color} onChange={c => {
                  const next = [...fixtures];
                  next[selFixIdx!] = { ...next[selFixIdx!], color: c };
                  setFixtures(next);
                }} />
              </div>
            </div>
          ) : selectedIdx !== null && selectedIdx >= 0 && zones[selectedIdx] ? (
            <ZoneConfigPanel
              mode={mode as 'seated' | 'zoned'}
              zone={zones[selectedIdx]}
              index={selectedIdx}
              onChange={z => updateZone(selectedIdx, z)}
              onRemove={() => removeZone(selectedIdx)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 p-4 text-center">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100">
                <Layers className="h-4 w-4 text-stone-400" />
              </div>
              <p className="text-xs font-semibold text-stone-500">
                {mode === 'zoned' ? 'Nhấn hoặc kéo khu vực' : 'Nhấn vào khu ghế'}
              </p>
              <p className="mt-1 text-[11px] text-stone-400">để chỉnh sửa</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-5">
      {/* Mode selector */}
      <div>
        <FieldLabel>Hình thức chỗ ngồi</FieldLabel>
        <div className="grid grid-cols-3 gap-3">
          {SEATING_MODES.map(({ value, label, sub, Icon, example }) => {
            const sel = mode === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => { onModeChange(value); onChange([]); setPatternId(null); setPositions([]); setSelectedIdx(null); setFixtures([]); }}
                className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
                  sel ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${sel ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${sel ? 'text-amber-800' : 'text-stone-700'}`}>{label}</p>
                  <p className={`mt-0.5 text-[11px] leading-snug ${sel ? 'text-amber-600' : 'text-stone-400'}`}>{sub}</p>
                  <p className={`mt-1 text-[10px] leading-snug ${sel ? 'text-amber-500' : 'text-stone-300'}`}>{example}</p>
                </div>
                {sel && <div className="mt-auto flex justify-end"><Check className="h-4 w-4 text-amber-500" /></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Admission: ticket tier cards ── */}
      {mode === 'admission' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-700">
              {zones.length === 0 ? 'Chưa có loại vé' : `${zones.length} loại vé · ${totalCap.toLocaleString()} vé`}
            </p>
            <button type="button" onClick={addZone}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800">
              <Plus className="h-3.5 w-3.5" /> {addBtnLabel}
            </button>
          </div>
          {zones.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-100 bg-stone-50 p-4">
              {zones.map((z, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: z.color }}>
                  <span>{z.name || `Loại ${i + 1}`}</span>
                  {z.capacity && Number(z.capacity) > 0 && <span className="opacity-75">×{Number(z.capacity).toLocaleString()}</span>}
                </div>
              ))}
            </div>
          )}
          <AnimatePresence>
            {zones.map((zone, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <ZoneCardAdmission zone={zone} index={i} onChange={z => updateZone(i, z)} onRemove={() => removeZone(i)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {zones.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center">
              <Ticket className="h-10 w-10 text-stone-300" />
              <div>
                <p className="font-semibold text-stone-500">Chưa có loại vé</p>
                <p className="mt-0.5 text-xs text-stone-400">Tạo các hạng vé cho sự kiện vào cửa tự do.</p>
              </div>
              <button type="button" onClick={addZone}
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600">
                <Plus className="h-3.5 w-3.5" /> {addBtnLabel}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Seated / Zoned: pattern picker → canvas editor ── */}
      {mode !== 'admission' && (
        <>
          {/* Pattern picker (empty state) */}
          {showPatternPicker && (
            <div className="rounded-2xl border-2 border-dashed border-stone-200 p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-stone-700">Chọn sơ đồ bố trí</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {mode === 'seated'
                    ? 'Bắt đầu từ mẫu có sẵn. Kích thước khu tự theo ma trận ghế, bạn chỉ cần kéo để sắp vị trí.'
                    : 'Bắt đầu từ mẫu có sẵn. Sau đó kéo để di chuyển và phóng to/thu nhỏ từng khu.'}
                </p>
              </div>
              <PatternPicker patterns={allPatterns} selectedId={patternId} onSelect={handlePatternSelect} />
            </div>
          )}

          {patternId === 'custom' && zones.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 py-12 text-center">
              <LayoutGrid className="h-9 w-9 text-stone-300" />
              <div>
                <p className="font-semibold text-stone-600">Bắt đầu từ khu đầu tiên</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {mode === 'seated'
                    ? 'Nhập ma trận ghế trước, rồi kéo để bố trí trên sơ đồ.'
                    : 'Tạo khu vực đầu tiên, rồi kéo để bố trí trên sơ đồ.'}
                </p>
              </div>
              <button type="button" onClick={addZone}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800">
                <Plus className="h-3.5 w-3.5" /> {addBtnLabel}
              </button>
            </div>
          )}

          {/* Canvas editor (header + canvas panel) */}
          {zones.length > 0 && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-stone-700">{summaryText}</p>
                  {activePattern && activePattern.id !== 'custom' && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                      {activePattern.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={resetLayout}
                    className="text-[11px] font-semibold text-amber-600 hover:underline">
                    Đổi sơ đồ
                  </button>
                  <button
                    type="button"
                    onClick={() => setFullscreen(true)}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-[11px] text-stone-500 hover:bg-stone-100"
                    title="Phóng to để chỉnh dễ hơn"
                  >
                    <Maximize2 className="h-3 w-3" /> Phóng to
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFixtures([...fixtures, { id: `fix-${Date.now()}`, label: 'SÂN KHẤU', color: '#1c1c1c', textColor: '#ffffff', pos: { x: 30, y: 5, w: 40, h: 10 } }]);
                      setSelectedIdx(-1 - fixtures.length);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Thêm điểm cố định
                  </button>
                  <button type="button" onClick={addZone}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800">
                    <Plus className="h-3.5 w-3.5" /> {addBtnLabel}
                  </button>
                </div>
              </div>
              {/* Canvas + config panel (only when not in fullscreen) */}
              {!fullscreen && renderCanvasPanel(false)}
            </>
          )}

          {/* Fullscreen modal — canvas only, full width */}
      {fullscreen && (
        <CanvasModal onClose={() => setFullscreen(false)}>
          {renderCanvasPanel(true)}
        </CanvasModal>
      )}

      {showSeatZoneCreate && mode === 'seated' && (
        <SeatZoneCreateModal
          rows={newZoneRows}
          cols={newZoneCols}
          onRowsChange={setNewZoneRows}
          onColsChange={setNewZoneCols}
          onClose={() => setShowSeatZoneCreate(false)}
          onCreate={createSeatedZone}
        />
      )}
        </>
      )}
    </motion.div>
  );
}

// ── Step 3 — Preview ───────────────────────────────────────────────────────

function Step3({
  form, zones,
}: {
  form: EventFormPayload;
  zones: SeatZoneForm[];
}) {
  const mode: SeatingMode = form.seating_mode ?? 'seated';
  const catLabel = CATEGORY_OPTIONS.find(c => c.value === form.category)?.label ?? form.category;

  const modeLabelMap: Record<SeatingMode, string> = {
    seated: 'Ghế ngồi', zoned: 'Khu vực', admission: 'Vào cửa',
  };

  const totalCap = zones.reduce((acc, z) => {
    if (mode === 'seated') return acc + Number(z.total_rows || 0) * Number(z.total_cols || 0);
    return acc + Number(z.capacity || 0);
  }, 0);

  const capLabel = mode === 'seated'
    ? `${totalCap.toLocaleString()} ghế`
    : mode === 'zoned'
    ? `${totalCap.toLocaleString()} chỗ`
    : `${totalCap.toLocaleString()} vé`;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        {form.poster_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.poster_url} alt={form.title} className="h-48 w-full object-cover" />
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">{form.title || '—'}</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  {catLabel}
                </span>
                <span className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-500">
                  {modeLabelMap[mode]}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
              {form.event_date
                ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(form.event_date))
                : '—'}
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
              {form.venue || '—'}
            </div>
          </div>

          {form.description && (
            <p className="text-sm text-stone-500 leading-relaxed">{form.description}</p>
          )}
        </div>
      </div>

      {zones.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-stone-400" />
            <p className="font-semibold text-stone-900">{zones.length} khu vực · {capLabel}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {zones.map((zone, i) => {
              const zoneCapLabel = mode === 'seated'
                ? `${Number(zone.total_rows || 0)} × ${Number(zone.total_cols || 0)} ghế`
                : mode === 'zoned'
                ? `${Number(zone.capacity || 0).toLocaleString()} chỗ`
                : `${Number(zone.capacity || 0).toLocaleString()} vé`;
              return (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-stone-100 p-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl" style={{ backgroundColor: zone.color + '20' }}>
                    <div className="flex h-full items-center justify-center">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: zone.color }} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-800">{zone.name || `Khu ${i + 1}`}</p>
                    <p className="text-xs text-stone-400">
                      {zoneCapLabel} · {zone.price ? Number(zone.price).toLocaleString('vi-VN') + 'đ' : 'Chưa có giá'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main wizard component ──────────────────────────────────────────────────

interface EventWizardProps {
  eventId?: number;
  initialForm?: EventFormPayload;
  initialZones?: SeatZone[];
}

export function EventWizard({ eventId, initialForm, initialZones = [] }: EventWizardProps) {
  const router = useRouter();
  const isEdit = !!eventId;
  const initialZoneIds = useRef(initialZones.map((zone) => zone.id));
  const affectedSeats = initialZones.reduce(
    (sum, zone) => sum + Math.max(0, Number(zone.total_seats ?? 0) - Number(zone.available_seats ?? zone.total_seats ?? 0)),
    0,
  );

  const [step,   setStep]   = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  const defaultForm: EventFormPayload = initialForm ?? {
    title: '', description: '', category: 'music', seating_mode: 'seated', venue: '', event_date: '', poster_url: '',
  };

  const [form,  setForm]  = useState<EventFormPayload>(defaultForm);
  const [zones, setZones] = useState<SeatZoneForm[]>(
    initialZones.map(z => ({
      id:         z.id,
      name:       z.name,
      price:      String(z.price),
      color:      z.color,
      total_rows: String(z.total_rows),
      total_cols: String(z.total_cols),
      capacity:   defaultForm.seating_mode === 'seated' ? '' : String(z.total_cols),
    })),
  );
  const [layout, setLayout] = useState<EventLayoutConfig>(() => initialForm?.layout_config ?? {
    pattern_id: initialZones.length > 0 ? 'custom' : null,
    positions: [],
    fixtures: [],
  });

  // Validate step 1 before proceeding
  function validateStep1(): boolean {
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.error('Tên sự kiện tối thiểu 3 ký tự.');
      return false;
    }
    if (!form.venue.trim() || form.venue.trim().length < 3) {
      toast.error('Địa điểm tối thiểu 3 ký tự.');
      return false;
    }
    if (!form.event_date) {
      toast.error('Vui lòng chọn thời gian sự kiện.');
      return false;
    }
    return true;
  }

  // Validate step 2 before proceeding
  function validateStep2(): boolean {
    const mode: SeatingMode = form.seating_mode ?? 'seated';
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      const label = mode === 'admission' ? `Loại vé ${i + 1}` : `Khu ${i + 1}`;
      if (!z.name.trim()) {
        toast.error(`${label}: Vui lòng nhập tên.`);
        return false;
      }
      if (!z.price || Number(z.price) <= 0) {
        toast.error(`${label}: Giá vé phải lớn hơn 0.`);
        return false;
      }
      if (mode === 'seated') {
        const rows = Number(z.total_rows);
        const cols = Number(z.total_cols);
        if (!z.total_rows || rows < 1 || rows > MAX_SEATED_ROWS) {
          toast.error(`${label}: Số hàng phải từ 1–${MAX_SEATED_ROWS}.`);
          return false;
        }
        if (!z.total_cols || cols < 1 || cols > MAX_SEATED_COLS) {
          toast.error(`${label}: Số cột phải từ 1–${MAX_SEATED_COLS}.`);
          return false;
        }
      } else {
        const cap = Number(z.capacity);
        if (!z.capacity || cap < 1) {
          toast.error(`${label}: Sức chứa / số lượng phải ít nhất 1.`);
          return false;
        }
      }
    }
    return true;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(3, prev + 1) as Step);
  }

  function handleBack() {
    setStep((prev) => Math.max(1, prev - 1) as Step);
  }

  async function handleSave() {
    if (!validateStep1() || !validateStep2()) {
      setStep(1);
      return;
    }

    setSaving(true);
    try {
      const baseLayoutConfig: EventLayoutConfig = (form.seating_mode ?? 'seated') === 'admission'
        ? { pattern_id: null, zone_ids: [], positions: [], fixtures: [] }
        : {
            pattern_id: layout.pattern_id ?? null,
            positions: zones.map((zone, index) => getVisibleZonePos(form.seating_mode ?? 'seated', zone, index, layout.positions)),
            fixtures: layout.fixtures.map((fixture) => ({ ...fixture, pos: { ...fixture.pos } })),
          };

      const payload: EventFormPayload = {
        title:        form.title.trim(),
        description:  form.description?.trim() || undefined,
        category:     form.category,
        seating_mode: form.seating_mode ?? 'seated',
        venue:        form.venue.trim(),
        event_date:   new Date(form.event_date).toISOString(),
        poster_url:   form.poster_url?.trim() || undefined,
        layout_config: baseLayoutConfig,
      };

      let savedId = eventId;

      if (isEdit && eventId) {
        await updateEvent(eventId, payload);
      } else {
        const created = await createEvent(payload);
        savedId = created.id;
      }

      // Create / update / delete seat zones so backend stays identical to the admin editor.
      if (savedId) {
        const seatingMode = form.seating_mode ?? 'seated';
        const currentIds = new Set(zones.flatMap((zone) => zone.id ? [zone.id] : []));
        const removedIds = initialZoneIds.current.filter((id) => !currentIds.has(id));
        for (const id of removedIds) {
          await api.delete(`/events/${savedId}/seat-zones/${id}`);
        }

        const savedZones: SeatZoneForm[] = [];
        for (const z of zones) {
          // For zoned/admission: encode capacity as total_rows=1, total_cols=capacity
          const isSeated = seatingMode === 'seated';
          const zPayload = {
            name:       z.name.trim(),
            price:      Number(z.price),
            color:      z.color,
            total_rows: isSeated ? Number(z.total_rows) : 1,
            total_cols: isSeated ? Number(z.total_cols) : Number(z.capacity),
          };

          const response = z.id
            ? await api.put<{ data: SeatZone }>(`/events/${savedId}/seat-zones/${z.id}`, zPayload)
            : await api.post<{ data: SeatZone }>(`/events/${savedId}/seat-zones`, zPayload);
          const persisted = response.data.data;
          savedZones.push({
            id: persisted.id,
            name: persisted.name,
            price: String(persisted.price),
            color: persisted.color,
            total_rows: String(persisted.total_rows),
            total_cols: String(persisted.total_cols),
            capacity: isSeated ? '' : String(persisted.total_cols),
          });
        }
        setZones(savedZones);
        initialZoneIds.current = savedZones.flatMap((zone) => zone.id ? [zone.id] : []);

        if (seatingMode !== 'admission') {
          await updateEvent(savedId, {
            layout_config: {
              ...baseLayoutConfig,
              zone_ids: savedZones.flatMap((zone) => zone.id ? [zone.id] : []),
            },
          });
        }
      }

      toast.success(isEdit ? 'Đã cập nhật sự kiện và khu vé.' : 'Đã tạo sự kiện nháp!');
      router.push('/admin/events');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
        || 'Không thể lưu. Kiểm tra lại dữ liệu và thử lại.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/admin/events" className="flex items-center gap-1.5 font-medium hover:text-stone-700">
          <ArrowLeft className="h-4 w-4" /> Sự kiện
        </Link>
        <span className="text-stone-300">/</span>
        <span className="font-semibold text-stone-800">{isEdit ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</span>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">
          {isEdit ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
        </h1>
        <p className="mt-0.5 text-sm text-stone-400">Hoàn thành 3 bước để tạo sự kiện</p>
      </div>

      {isEdit && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold">Chỉnh sửa có thể ảnh hưởng người đã đặt vé</p>
              <p className="mt-1 leading-6 text-amber-800">
                Nếu đổi thời gian, địa điểm hoặc sơ đồ ghế, hãy chủ động thông báo cho người dùng đã đặt vé trước khi lưu thay đổi.
                {affectedSeats > 0 && ` Hiện có ${affectedSeats.toLocaleString('vi-VN')} ghế đã được giữ hoặc bán.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <StepIndicator step={step} totalSteps={3} />

      {/* Step content */}
      <AnimatePresence mode="wait">
        <div key={step}>
          {step === 1 && <Step1 form={form} onChange={setForm} />}
          {step === 2 && (
            <Step2
              mode={form.seating_mode ?? 'seated'}
              zones={zones}
              layout={layout}
              onModeChange={m => setForm({ ...form, seating_mode: m })}
              onChange={setZones}
              onLayoutChange={setLayout}
            />
          )}
          {step === 3 && <Step3 form={form} zones={zones} />}
        </div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-6">
        <button
          type="button"
          onClick={step === 1 ? () => router.push('/admin/events') : handleBack}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'Huỷ' : 'Quay lại'}
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Tiếp theo <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-700"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Đang lưu…' : isEdit ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
            {!saving && <Check className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
