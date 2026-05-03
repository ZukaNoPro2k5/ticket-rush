import { Shimmer } from '@/components/ui/Shimmer';

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Shimmer className="hidden h-64 rounded-2xl lg:block" />
        <div className="space-y-6">
          <Shimmer className="h-7 w-40 rounded" />
          <Shimmer className="h-44 rounded-2xl" />
          <Shimmer className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
