'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Copy, Upload, BarChart3, Database, Sparkles, CheckCircle2, FileText, Trash2 } from 'lucide-react';
import { importMppoliceOneLinersJson, publishAllDraftMppoliceOneLiners, getMppoliceOneLinerStats, deleteSubjectOneLiners } from '@/actions/mppolice-one-liners-admin';
import { MPPOLICE_ONELINER_SUBJECTS } from '@/features/revision/constants/mppolice-one-liners';
import { MpgkUploadWizard } from './MpgkUploadWizard';
import { GeneralSubjectWizard } from './GeneralSubjectWizard';

const DEMO_JSON = `[
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भगवान बुद्ध को ज्ञान की प्राप्ति कहाँ हुई थी?",
    "stemEn": "Where did Gautama Buddha attain enlightenment?",
    "answerHi": "बोधगया",
    "answerEn": "Bodh Gaya",
    "importanceScore": 100,
    "extendedData": {
      "facts": ["बोधिवृक्ष के नीचे ध्यान; बिहार में स्थल।"],
      "factsEn": ["Meditation under the Bodhi tree; site in Bihar."],
      "memoryTip": "बोध = ज्ञान → बोधगया।",
      "memoryTipEn": "Bodh ≈ knowledge → Bodh Gaya.",
      "explanationHi": "ऐतिहासिक रूप से बुद्धत्व बोधगया (उरुवेला) में प्राप्त हुआ।",
      "explanationEn": "Tradition places enlightenment at Bodh Gaya (Uruvela)."
    }
  }
]`;

export default function OneLinerGkAdminClient() {
  const [json, setJson] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [replace, setReplace] = useState<string>('_none');
  const [pending, startTransition] = useTransition();
  const [stats, setStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    const res = await getMppoliceOneLinerStats();
    if (res.success) {
      setStats(res.stats);
    }
    setIsStatsLoading(false);
  }, []);

  const handleDeleteSubject = async (subject: string) => {
    if (!confirm(`Are you sure you want to delete ALL facts for ${subject}? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteSubjectOneLiners(subject);
      if (res.success) {
        toast.success(`Deleted all facts for ${subject}`);
        fetchStats();
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    });
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error('Copy failed');
    }
  };

  const onSubmit = () => {
    startTransition(async () => {
      const res = await importMppoliceOneLinersJson(json, {
        status,
        replaceSubject: replace === '_none' ? null : replace,
      });
      if (res.success) {
        toast.success(`Imported ${res.inserted} rows`);
        setJson('');
        fetchStats();
      } else {
        toast.error(res.error || 'Import failed');
      }
    });
  };

  const onPublishDrafts = () => {
    startTransition(async () => {
      const res = await publishAllDraftMppoliceOneLiners(null);
      if (res.success) {
        toast.success('All drafts published');
        fetchStats();
      } else {
        toast.error(res.error || 'Failed');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">GK One-Liner Bank</h1>
            <p className="mt-1 text-sm text-slate-600">
              Paste AI JSON (50 per batch).{' '}
              <Link
                href="/prompts/mppolice-one-liners-ai-batch.md"
                target="_blank"
                className="font-semibold text-emerald-700 underline"
              >
                Batch prompt (MD)
              </Link>
              {' · '}
              <Link href="/syllabus/quiz/revision/gk-one-liners" className="font-semibold text-emerald-700 underline">
                User page
              </Link>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={isStatsLoading}>
            <Loader2 className={`mr-2 h-4 w-4 ${isStatsLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>

        {/* --- STATS SECTION --- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-emerald-100 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Database className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                Total Facts
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900">
                {isStatsLoading ? '...' : stats?.total || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-blue-100 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-blue-500" />
                Published
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900">
                {isStatsLoading ? '...' : stats?.published || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-100 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FileText className="mr-2 h-3.5 w-3.5 text-amber-500" />
                Drafts
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900">
                {isStatsLoading ? '...' : stats?.draft || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-100 bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                <BarChart3 className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                Active Subjects
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {isStatsLoading ? '...' : Object.values(stats?.bySubject || {}).filter((s: any) => s.total > 0).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Tabs defaultValue="wizard" className="lg:col-span-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wizard">MPGK Gen Wizard</TabsTrigger>
              <TabsTrigger value="general">Other Subjects Wizard</TabsTrigger>
              <TabsTrigger value="importer">Standard Importer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wizard">
              <MpgkUploadWizard />
            </TabsContent>

            <TabsContent value="general">
              <GeneralSubjectWizard />
            </TabsContent>

            <TabsContent value="importer">
              <Card>
            <CardHeader>
              <CardTitle>Import JSON array</CardTitle>
              <CardDescription>
                Required: subjectTag, stemHi, answerHi. Strongly recommended: bilingual fields + extendedData for
                deep tiles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => copy(DEMO_JSON, 'Demo JSON copied')}>
                  <Copy className="mr-1 h-3 w-3" /> Copy demo JSON
                </Button>
                <Button 
                  type="button" 
                  variant="default" 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={async () => {
                    const res = await fetch('/prompts/mppolice-one-liners-ai-batch.md');
                    const text = await res.text();
                    copy(text, 'AI Prompt copied! Paste in ChatGPT/Claude.');
                  }}
                >
                  <Sparkles className="mr-1 h-3 w-3" /> Copy Generation Prompt
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href="/prompts/mppolice-one-liners-ai-batch.md" target="_blank" rel="noopener noreferrer">
                    View Prompt MD
                  </a>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>On import, rows are</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published (live immediately)</SelectItem>
                      <SelectItem value="draft">Draft (publish later)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Replace existing (optional)</Label>
                  <Select value={replace} onValueChange={setReplace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Do not delete existing</SelectItem>
                      {MPPOLICE_ONELINER_SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          Replace all in: {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>JSON array</Label>
                <Textarea
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  className="min-h-[400px] h-[60vh] max-h-[800px] overflow-y-auto font-mono text-xs shadow-inner"
                  placeholder="[ { &quot;subjectTag&quot;: &quot;General Knowledge&quot;, ... } ]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={pending || !json.trim()} onClick={onSubmit} className="bg-emerald-600">
                  {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Import
                </Button>
                <Button type="button" variant="secondary" disabled={pending} onClick={onPublishDrafts}>
                  Publish all drafts
                </Button>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Subject Breakdown</CardTitle>
              <CardDescription>Current live data distribution</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-t">
                {MPPOLICE_ONELINER_SUBJECTS.map((subject) => {
                  const sStats = stats?.bySubject?.[subject] || { total: 0, published: 0, draft: 0 };
                  return (
                    <div key={subject} className="flex items-center justify-between p-4 px-6">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{subject}</p>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-medium text-emerald-600">
                            {sStats.published} live
                          </span>
                          <span className="text-[10px] font-medium text-amber-600">
                            {sStats.draft} drafts
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                          {sStats.total}
                        </span>
                        {sStats.total > 0 && (
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => handleDeleteSubject(subject)}
                            disabled={pending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

