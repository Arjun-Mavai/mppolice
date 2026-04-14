'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 ADMIN PRICING — Update prices from dashboard, no deploy needed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mobile-first card layout. Changes reflect immediately on /pricing.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, IndianRupee, Save, RefreshCw, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { type PricingData, PRICING_DEFAULTS } from '@/config/pricing';
import { API } from '@/config/endpoints';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';

type ExamType = 'mppolice' | 'mppsc' | 'upsc';

const EXAMS: { id: ExamType; label: string; icon: string }[] = [
  { id: 'mppolice', label: 'MP Police', icon: '👮' },
  { id: 'mppsc', label: 'MPPSC', icon: '🏛️' },
  { id: 'upsc', label: 'UPSC', icon: '🎓' },
];

export default function AdminPricingPage() {
  const [activeExam, setActiveExam] = useState<ExamType>('mppolice');
  const [data, setData] = useState<PricingData>(PRICING_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPricing = async (exam: ExamType) => {
    setLoading(true);
    try {
      const res = await fetch(`${API.PRICING}?examType=${exam}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.pricing) setData(json.pricing);
    } catch {
      setData(PRICING_DEFAULTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing(activeExam);
  }, [activeExam]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API.PRICING, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, examType: activeExam }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(json.message || `Pricing for ${activeExam.toUpperCase()} updated!`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm bg-white';
  const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wider';

  const updateField = (key: keyof PricingData, value: string | number) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            Pricing Manager
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select exam to update its specific pricing
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPricing(activeExam)}
          disabled={loading}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* ── Exam Tabs ──────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {EXAMS.map((exam) => (
          <button
            key={exam.id}
            onClick={() => setActiveExam(exam.id)}
            disabled={loading || saving}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all',
              activeExam === exam.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <span>{exam.icon}</span>
            {exam.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm font-medium">Fetching {activeExam.toUpperCase()} Prices...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* ── Pro Plan Card ──────────────────────────────────── */}
          <div className="space-y-3 rounded-xl border-2 border-slate-800 bg-white p-4 shadow-sm md:p-6">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">👑 Pro Plan</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Current Price (₹)</label>
                <input
                  type="number"
                  value={data.proPrice}
                  onChange={(e) => updateField('proPrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Original / Strike (₹)</label>
                <input
                  type="number"
                  value={data.proOriginalPrice}
                  onChange={(e) => updateField('proOriginalPrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Validity Text</label>
                <input
                  type="text"
                  value={data.proValidityText}
                  onChange={(e) => updateField('proValidityText', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Duration (months)</label>
                <input
                  type="number"
                  value={data.proMonths}
                  onChange={(e) => updateField('proMonths', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── Upgrade Pricing Card ───────────────────────────── */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="font-bold text-slate-800">🔄 Upgrade (Lite → Pro)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Upgrade Price (₹)</label>
                <input
                  type="number"
                  value={data.upgradePrice}
                  onChange={(e) => updateField('upgradePrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Original (₹)</label>
                <input
                  type="number"
                  value={data.upgradeOriginalPrice}
                  onChange={(e) => updateField('upgradeOriginalPrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── Urgency Text ───────────────────────────────────── */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="font-bold text-slate-800">🔥 Urgency Banner</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>Students Bought</label>
                <input
                  type="number"
                  value={data.studentsBought}
                  onChange={(e) => updateField('studentsBought', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Urgency Text (En)</label>
                <input
                  type="text"
                  value={data.urgencyText}
                  onChange={(e) => updateField('urgencyText', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Urgency Text (Hindi)</label>
              <input
                type="text"
                value={data.urgencyTextHi}
                onChange={(e) => updateField('urgencyTextHi', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* ── Save Button ────────────────────────────────────── */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-12 w-full bg-slate-900 font-bold text-white shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving for {activeExam.toUpperCase()}...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save {activeExam.toUpperCase()} Pricing
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
