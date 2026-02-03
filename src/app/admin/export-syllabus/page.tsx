"use client";

import React from 'react';
import { syllabusData } from '@/data/syllabusData';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

   
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
            console.error(err);
            toast.error("Failed to fetch DB syllabus");
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
  const unitKeys = Object.keys(units).sort((a,b) => {
      const numA = parseInt(a.replace('unit_', '')) || 0;
      const numB = parseInt(b.replace('unit_', '')) || 0;
      return numA - numB;
  });

  const getUnitJson = (unitId: string) => {
      const unit = units[unitId];
      if (!unit || !unit.topics) return "[]";
      
      // Enriched Export Structure
      const exportData = unit.topics.map((t: any) => ({
          id: t.id, // THE KEY FOR MAPPING
          unit: unit.title || unitId, 
          title_hindi: t.topic_title || "",
          title_english: t.topic_title_en || ""
      }));

      return JSON.stringify(exportData, null, 2);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  // Import Logic
  const [importJson, setImportJson] = React.useState("");
  const [adminKey, setAdminKey] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  // ... (handleUpload stays same)
  const handleUpload = async () => {
    if (!importJson || !adminKey) {
        toast.error("Please provide both JSON and Admin Secret Key");
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
            console.error(e);
            toast.error("Invalid JSON format. Check for trailing commas or syntax errors.");
            return;
        }

        // Handle both: Array directly OR { topics: [...] }
        const payload = Array.isArray(parsed) ? { topics: parsed } : parsed;

        const res = await fetch('/api/admin/enrich-syllabus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': adminKey
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");

        toast.success(data.message || "Upload successful!");
        setImportJson(""); // Clear on success
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsUploading(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 font-medium">Loading Live Syllabus Data...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-32">
        <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black font-display text-slate-900 mb-2">Syllabus Manager</h1>
                <p className="text-slate-500">Export context for AI, generate content, and import it back.</p>
            </div>

            {/* 1. EXPORT SECTION */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    <h2 className="text-2xl font-bold text-slate-800">Export Context (For AI)</h2>
                </div>

                <div className="grid gap-6">
                    {unitKeys.map((unitId) => {
                        const unit = units[unitId];
                        const json = getUnitJson(unitId);
                        const count = unit.topics.length;

                        return (
                            <div key={unitId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between p-4 px-6 bg-slate-50 border-b border-slate-100">
                                    <div>
                                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{unitId.replace('_', ' ')}: {unit.title}</h3>
                                        <p className="text-slate-400 text-xs mt-0.5">{count} Topics</p>
                                    </div>
                                    <Button 
                                        onClick={() => copyToClipboard(json, unitId)} 
                                        variant="outline"
                                        className="gap-2 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"
                                    >
                                        <Copy size={14} /> Copy JSON
                                    </Button>
                                </div>
                                <div className="p-0 bg-slate-900">
                                    <pre className="text-[10px] text-emerald-400 font-mono h-[150px] overflow-auto custom-scrollbar p-4 leading-relaxed">
                                        {json}
                                    </pre>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* 2. IMPORT SECTION */}
            <section className="space-y-6 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    <h2 className="text-2xl font-bold text-slate-800">Import AI Content</h2>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Admin Secret Key</label>
                        <input 
                            type="password" 
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            className="w-full max-w-md px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-sm"
                            placeholder="Enter the backend admin secret..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Paste AI JSON Output</label>
                        <textarea 
                            value={importJson}
                            onChange={(e) => setImportJson(e.target.value)}
                            className="w-full h-[300px] px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-xs bg-slate-50"
                            placeholder='[ { "id": "...", "content_hindi": { ... } } ]'
                        />
                        <p className="text-xs text-slate-400">Paste the JSON array you got from ChatGPT exactly as is.</p>
                    </div>

                    <div className="flex pt-2">
                        <Button 
                            onClick={handleUpload} 
                            disabled={isUploading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
                        >
                            {isUploading ? "Uploading..." : "Upload & Enrich Syllabus"}
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    </div>
  );
}
