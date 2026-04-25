'use client';

import Link from 'next/link';
import { ChevronRight, Search, X } from 'lucide-react';

interface Props {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSubmit: () => void;
  hasQuery: boolean;
  onClear: () => void;
}

export function EventsSearchHero({
  searchInput, onSearchInputChange, onSubmit, hasQuery, onClear,
}: Props) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-stone-900 text-white">
      <div className="absolute inset-0 bg-mesh-warm opacity-90" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-stone-300">
          <Link href="/" className="hover:text-white">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-500" />
          <span className="text-white">Sự kiện</span>
        </nav>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Khám phá sự kiện</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-300 md:text-base">
          Hơn 1,200 sự kiện đang mở bán — từ concert, workshop, đến thể thao. Lọc theo sở thích và đặt vé chỉ trong 30 giây.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="mt-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md"
        >
          <Search className="ml-2 h-5 w-5 text-white/70" />
          <input
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Nhập tên sự kiện, nghệ sĩ, địa điểm… rồi nhấn Enter"
            className="flex-1 bg-transparent text-white placeholder:text-white/60 outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { onSearchInputChange(''); if (hasQuery) onClear(); }}
              aria-label="Xóa từ khóa"
              className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600"
          >
            Tìm kiếm
          </button>
        </form>
      </div>
    </section>
  );
}
