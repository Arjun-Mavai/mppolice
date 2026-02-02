
import { DashboardSkeleton } from "@/components/analytics/DashboardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
            <DashboardSkeleton />
        </div>
    </div>
  );
}
