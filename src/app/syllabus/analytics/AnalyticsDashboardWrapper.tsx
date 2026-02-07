'use client';

import dynamic from 'next/dynamic';

const AnalyticsDashboardClient = dynamic(
    () => import('./AnalyticsDashboardClient'),
    { 
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }
);

export default function AnalyticsDashboardWrapper({ analytics }: { analytics: any }) {
    return <AnalyticsDashboardClient analytics={analytics} />;
}
