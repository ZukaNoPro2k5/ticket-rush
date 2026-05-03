import { Shimmer } from '@/components/ui/Shimmer';

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Shimmer className="h-7 w-40 rounded" />
        <Shimmer className="mt-2 h-4 w-64 rounded" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      {/* Chart */}
      <Shimmer className="h-72 rounded-2xl" />
      {/* Fill rates */}
      <Shimmer className="h-64 rounded-2xl" />
    </div>
  );
}
