import { DashboardSkeleton } from '@/features/analytics/components/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans">
      <div className="mx-auto max-w-7xl space-y-8 px-6">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
