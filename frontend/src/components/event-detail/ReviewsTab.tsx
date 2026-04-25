import { Star } from 'lucide-react';
import { DETAIL_REVIEWS, RATING_DISTRIBUTION } from '@/data/eventDetailData';

function RatingSummary() {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="font-display text-5xl font-bold text-amber-700">4.8</div>
          <div className="mt-1 flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-4 w-4 ${n <= 4 ? 'fill-amber-500 text-amber-500' : 'fill-amber-500/60 text-amber-500/60'}`}
              />
            ))}
          </div>
          <div className="mt-0.5 text-xs text-stone-500">126 đánh giá</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {RATING_DISTRIBUTION.map((r) => (
            <div key={r.s} className="flex items-center gap-3 text-xs">
              <span className="w-3 text-stone-500">{r.s}</span>
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${r.p}%` }} />
              </div>
              <span className="w-8 text-right text-stone-500">{r.p}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewsTab() {
  return (
    <div className="animate-fadeInUp space-y-4">
      <RatingSummary />

      {DETAIL_REVIEWS.map((r, i) => (
        <div key={i} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 font-bold text-amber-700">
              {r.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-stone-900">{r.name}</div>
              <div className="text-xs text-stone-500">{r.date}</div>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-3.5 w-3.5 ${n <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-stone-700">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
