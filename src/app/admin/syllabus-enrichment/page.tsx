'use client';

import React from 'react';
import { syllabusData } from '@/data/syllabusData';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

export default function ExportTool() {
  // State for fetched data
  const [dbData, setDbData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch real DB data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/enrich-syllabus');
        if (res.ok) {
          const data = await res.json();
          setDbData(data.units);
        }
      } catch (err) {
        logger.error('Failed to fetch DB syllabus:', err);
        toast.error('Failed to fetch DB syllabus');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use DB data if available, else static (but static IDs are wrong now, so mostly rely on DB)
  // We'll map unitKeys from the DB Data
  const units = dbData || {}; // formatted from API

  // Sort keys (unit_1, unit_2...)
  const unitKeys = Object.keys(units).sort((a, b) => {
    const numA = parseInt(a.replace('unit_', '')) || 0;
    const numB = parseInt(b.replace('unit_', '')) || 0;
    return numA - numB;
  });

  const getUnitJson = (unitId: string) => {
    const unit = units[unitId];
    if (!unit || !unit.topics) return '[]';

    // Enriched Export Structure
    const exportData = unit.topics.map((t: any) => ({
      id: t.id, // THE KEY FOR MAPPING
      unit: unit.title || unitId,
      title_hindi: t.topic_title || '',
      title_english: t.topic_title_en || '',
    }));

    return JSON.stringify(exportData, null, 2);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  // Import Logic
  const [importJson, setImportJson] = React.useState('');
  const [adminKey, setAdminKey] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  // ... (handleUpload stays same)
  const handleUpload = async () => {
    if (!importJson || !adminKey) {
      toast.error('Please provide both JSON and Admin Secret Key');
      return;
    }

    try {
      setIsUploading(true);
      let parsed;
      try {
        // Fix trailing commas which are common in AI JSON
        const sanitized = importJson.replace(/,\s*([\]}])/g, '$1');
        parsed = JSON.parse(sanitized);
      } catch (e) {
        logger.error('JSON Parse Error:', e);
        toast.error('Invalid JSON format. Check for trailing commas or syntax errors.');
        return;
      }

      // Handle both: Array directly OR { topics: [...] }
      const payload = Array.isArray(parsed) ? { topics: parsed } : parsed;

      const res = await fetch('/api/admin/enrich-syllabus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      toast.success(data.message || 'Upload successful!');
      setImportJson(''); // Clear on success
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="font-medium text-slate-500">Loading Live Syllabus Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-32">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div>
          <h1 className="font-display mb-2 text-4xl font-black text-slate-900">Syllabus Manager</h1>
          <p className="text-slate-500">
            Export context for AI, generate content, and import it back.
          </p>
        </div>

        {/* 1. EXPORT SECTION */}
        <section className="space-y-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              1
            </span>
            <h2 className="text-2xl font-bold text-slate-800">Export Context (For AI)</h2>
          </div>

          <div className="grid gap-6">
            {unitKeys.map((unitId) => {
              const unit = units[unitId];
              const json = getUnitJson(unitId);
              const count = unit.topics.length;

              return (
                <div
                  key={unitId}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 px-6">
                    <div>
                      <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
                        {unitId.replace('_', ' ')}: {unit.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">{count} Topics</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(json, unitId)}
                      variant="outline"
                      className="gap-2 border-slate-200 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Copy size={14} /> Copy JSON
                    </Button>
                  </div>
                  <div className="bg-slate-900 p-0">
                    <pre className="custom-scrollbar h-[150px] overflow-auto p-4 font-mono text-[10px] leading-relaxed text-emerald-400">
                      {json}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. IMPORT SECTION */}
        <section className="space-y-6 border-t border-slate-200 pt-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              2
            </span>
            <h2 className="text-2xl font-bold text-slate-800">Import AI Content</h2>
          </div>

          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Admin Secret Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2 font-mono text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                placeholder="Enter the backend admin secret..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Paste AI JSON Output</label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="h-[300px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-xs transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                placeholder='[ { "id": "...", "content_hindi": { ... } } ]'
              />
              <p className="text-xs text-slate-400">
                Paste the JSON array you got from ChatGPT exactly as is.
              </p>
            </div>

            <div className="flex pt-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="h-12 w-full rounded-xl bg-emerald-600 px-8 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95 md:w-auto"
              >
                {isUploading ? 'Uploading...' : 'Upload & Enrich Syllabus'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
