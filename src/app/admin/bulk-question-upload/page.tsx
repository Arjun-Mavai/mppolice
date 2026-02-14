'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadTopicTestQuestions } from '@/actions/uploadTopicTests';
import { getSyllabusTopics } from '@/actions/getSyllabusTopics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the shape of our DB topic
interface DbTopic {
  id: string;
  unitId: string;
  title: string;
  titleEn: string | null;
  // other fields...
}

export default function UploadTopicTests() {
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [jsonInput, setJsonInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  // DB Data State
  const [dbData, setDbData] = useState<Record<string, DbTopic[]>>({});
  const [loading, setLoading] = useState(true);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSyllabusTopics();
        if (res.success && res.data) {
          setDbData(res.data);
          // Set default unit to the first one available
          const units = Object.keys(res.data).sort(sortUnits);
          if (units.length > 0) setSelectedUnit(units[0]);
        } else {
          toast.error('Failed to load syllabus topics.');
        }
      } catch (err) {
        toast.error('Error connecting to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sort helper for Units (unit_1, unit_2...)
  const sortUnits = (a: string, b: string) => {
    const numA = parseInt(a.replace('unit_', '')) || 0;
    const numB = parseInt(b.replace('unit_', '')) || 0;
    return numA - numB;
  };

  const unitKeys = Object.keys(dbData).sort(sortUnits);
  const currentTopics = selectedUnit ? dbData[selectedUnit] : [];

  // Generate Context JSON
  const generateContextJson = () => {
    if (!currentTopics || currentTopics.length === 0) return '[]';

    const contextData = {
      unitId: selectedUnit,
      topics: currentTopics.map((t) => ({
        topicId: t.id, // THE REAL DB ID
        title: t.title, // Hindi
        titleEn: t.titleEn || '', // English
      })),
    };

    return JSON.stringify(contextData, null, 2);
  };

  const handleCopyContext = () => {
    navigator.clipboard.writeText(generateContextJson());
    toast.success('Correct DB Context Copied!');
  };

  const handleUpload = async () => {
    if (!jsonInput.trim()) return toast.error('Paste JSON first');
    if (!adminKey) return toast.error('Admin Key required');

    try {
      setIsUploading(true);

      let parsedData;
      try {
        const sanitized = jsonInput.replace(/,\s*([\]}])/g, '$1'); // clean trailing commas
        parsedData = JSON.parse(sanitized);
      } catch (e) {
        setIsUploading(false);
        return toast.error('Invalid JSON format');
      }

      // Send to server
      const result = await uploadTopicTestQuestions(parsedData, adminKey);

      if (result.success) {
        toast.success(result.message);
        setJsonInput('');
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error('Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Syllabus Data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-32 font-sans">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="mb-2 text-3xl font-black text-slate-900">Topic Tests Bulk Upload</h1>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
              DB SYNCED
            </span>
          </div>
          <p className="text-slate-500">
            Source of Truth: <strong>syllabus_topics</strong> table.
          </p>
        </div>

        {/* STEP 1: Context Generator */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-800">Generate DB Context</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Select Unit from DB
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                {unitKeys.map((u) => (
                  <option key={u} value={u}>
                    {u.toUpperCase()} ({dbData[u]?.length} Topics)
                  </option>
                ))}
              </select>

              <Alert className="border-blue-100 bg-blue-50">
                <AlertTitle className="text-blue-800">Why Use This?</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed text-blue-700/80">
                  This fetches the <strong>REAL IDs</strong> from your database (syllabus_topics).
                  If you use old IDs, data mapping will fail. Always copy fresh context before
                  generating questions with AI.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  JSON Preview
                </label>
                <Button
                  onClick={handleCopyContext}
                  size="sm"
                  variant="outline"
                  className="h-8 gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Copy size={14} /> Copy Context
                </Button>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4">
                <pre className="custom-scrollbar h-[200px] overflow-auto font-mono text-[10px] text-emerald-400">
                  {generateContextJson()}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 2: Upload */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-800">Upload AI JSON</h2>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin Secret Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full max-w-sm rounded-lg border px-4 py-2"
            />
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste the AI response here..."
              className="h-[300px] w-full rounded-xl border bg-slate-50 p-4 font-mono text-xs"
            />
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="h-12 w-full rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              {isUploading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
