import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Loading Test Analysis...</h2>
            <p className="text-slate-500 text-sm">Fetching your detailed report and AI insights.</p>
        </div>
    );
}
