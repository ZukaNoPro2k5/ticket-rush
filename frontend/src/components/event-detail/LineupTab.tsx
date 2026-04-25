import { DETAIL_LINEUP } from '@/data/eventDetailData';

export function LineupTab() {
  return (
    <div className="animate-fadeInUp rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
      <h2 className="font-display text-xl font-bold">Chương trình chi tiết</h2>
      <ol className="mt-5 space-y-5 border-l-2 border-amber-200 pl-6">
        {DETAIL_LINEUP.map((item, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white ring-4 ring-white">
              {i + 1}
            </span>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">{item.time}</div>
            <h3 className="mt-0.5 font-semibold text-stone-900">{item.title}</h3>
            <p className="mt-0.5 text-sm text-stone-600">{item.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
