'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Brain, Copy, Database, Loader2, RefreshCcw, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type DraftSubjectRow = {
  subject: string;
  draftCount: number;
};

type DraftTopicRow = {
  topicId: string;
  topicTitle: string;
  subject: string;
  draftCount: number;
};

type JobRow = {
  id: string;
  uploadedBy: string | null;
  totalRecords: number | null;
  successCount: number | null;
  failureCount: number | null;
  status: 'pending' | 'processed' | 'failed' | null;
  errorReport: unknown;
  createdAt: string | null;
};

type BootstrapPayload = {
  generatedAt: string;
  chunk?: {
    fromYear: number;
    toYear: number;
    chunkSize: number;
    chunkIndex: number;
    totalChunks: number;
    totalQuestionsInRange: number;
    questionsInChunk: number;
    topicsPerSubject: number;
  };
  summary: {
    totalPyqQuestionsScanned: number;
    questionsWithExplanation: number;
    subjectsFound: number;
  };
  sourceQuestions?: Array<{
    questionId: string;
    testId: string;
    testTitle: string;
    year: number;
    subject: string;
    questionText: string;
    explanation: string | null;
  }>;
  subjectTopicContext: Array<{
    subject: string;
    topicCandidates: Array<{
      topic: string;
      count: number;
      sampleQuestionIds: string[];
      sampleExplanations: string[];
    }>;
  }>;
  aiInputTemplate: unknown;
  suggestedPrompt: string;
};

const prettyJson = (value: unknown) => JSON.stringify(value, null, 2);

export default function PYQInsightsAdminClient() {
  const [importJson, setImportJson] = useState('');
  const [importMode, setImportMode] = useState<'upsert' | 'append'>('upsert');
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    job_id?: string;
    topics_upserted?: number;
    facts_staged?: number;
    errors?: number;
    warnings_count?: number;
  } | null>(null);

  const [publishScope, setPublishScope] = useState<'all' | 'subject' | 'topic'>('all');
  const [publishSubject, setPublishSubject] = useState('');
  const [topicIdsCsv, setTopicIdsCsv] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedCount, setPublishedCount] = useState<number | null>(null);

  const [yearsCsv, setYearsCsv] = useState('');
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeResult, setRecomputeResult] = useState<{
    rows_written: number;
    years_refreshed: number[];
  } | null>(null);

  const [draftBySubject, setDraftBySubject] = useState<DraftSubjectRow[]>([]);
  const [draftByTopic, setDraftByTopic] = useState<DraftTopicRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapData, setBootstrapData] = useState<BootstrapPayload | null>(null);
  const [fromYear, setFromYear] = useState('2020');
  const [toYear, setToYear] = useState(String(new Date().getFullYear()));
  const [chunkSize, setChunkSize] = useState('120');
  const [chunkIndex, setChunkIndex] = useState('1');
  const [topicsPerSubject, setTopicsPerSubject] = useState('20');
  const [completedChunks, setCompletedChunks] = useState<number[]>([]);

  const parsedTopicIds = useMemo(
    () =>
      topicIdsCsv
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    [topicIdsCsv]
  );

  const trackerKey = useMemo(
    () => `pyq-chunk-progress:${fromYear}:${toYear}:${chunkSize}:${topicsPerSubject}`,
    [fromYear, toYear, chunkSize, topicsPerSubject]
  );

  const currentChunkNumber = useMemo(() => {
    const n = Number(chunkIndex);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  }, [chunkIndex]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(trackerKey);
      const parsed = raw ? (JSON.parse(raw) as number[]) : [];
      setCompletedChunks(parsed.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b));
    } catch {
      setCompletedChunks([]);
    }
  }, [trackerKey]);

  const persistCompletedChunks = useCallback(
    (next: number[]) => {
      const normalized = [...new Set(next)].sort((a, b) => a - b);
      setCompletedChunks(normalized);
      localStorage.setItem(trackerKey, JSON.stringify(normalized));
    },
    [trackerKey]
  );

  const markCurrentChunkDone = () => {
    persistCompletedChunks([...completedChunks, currentChunkNumber]);
    toast.success(`Chunk ${currentChunkNumber} marked done`);
  };

  const loadDraftMeta = useCallback(async () => {
    const response = await fetch('/api/admin/pyq-insights/publish', { method: 'GET' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch draft summary');
    setDraftBySubject(data.draft_by_subject || []);
    setDraftByTopic(data.draft_by_topic || []);
  }, []);

  const loadJobs = useCallback(async () => {
    const response = await fetch('/api/admin/pyq-insights/jobs', { method: 'GET' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch jobs');
    setJobs(data.jobs || []);
  }, []);

  const loadMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      await Promise.all([loadDraftMeta(), loadJobs()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load admin insights data');
    } finally {
      setLoadingMeta(false);
    }
  }, [loadDraftMeta, loadJobs]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const handleImport = async () => {
    if (!importJson.trim()) {
      toast.error('Paste JSON payload first');
      return;
    }

    setImporting(true);
    setImportSummary(null);
    try {
      const parsed = JSON.parse(importJson);
      const response = await fetch('/api/admin/pyq-insights/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0',
          mode: importMode,
          publish: publishImmediately,
          records: Array.isArray(parsed) ? parsed : parsed.records,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Import failed');

      setImportSummary({
        job_id: data.job_id,
        topics_upserted: data.summary?.topics_upserted,
        facts_staged: data.summary?.facts_staged,
        errors: data.summary?.errors,
        warnings_count: data.summary?.warnings_count,
      });
      if (bootstrapData?.chunk?.chunkIndex === currentChunkNumber) {
        persistCompletedChunks([...completedChunks, currentChunkNumber]);
      }
      toast.success('Import processed successfully');
      await loadMeta();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishedCount(null);
    try {
      const payload: {
        publish_scope: 'all' | 'subject' | 'topic';
        subject?: string;
        topic_ids?: string[];
      } = { publish_scope: publishScope };
      if (publishScope === 'subject') payload.subject = publishSubject;
      if (publishScope === 'topic') payload.topic_ids = parsedTopicIds;

      const response = await fetch('/api/admin/pyq-insights/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Publish failed');

      setPublishedCount(data.published_count ?? 0);
      toast.success(`Published ${data.published_count ?? 0} facts`);
      await loadMeta();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      const years = yearsCsv
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value));

      const response = await fetch('/api/admin/pyq-insights/recompute-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ years: years.length > 0 ? years : undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Recompute failed');

      setRecomputeResult({
        rows_written: data.rows_written ?? 0,
        years_refreshed: data.years_refreshed ?? [],
      });
      toast.success('Trend recompute completed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Recompute failed');
    } finally {
      setRecomputing(false);
    }
  };

  const handleBootstrap = async () => {
    setBootstrapLoading(true);
    try {
      const params = new URLSearchParams({
        fromYear,
        toYear,
        chunkSize,
        chunkIndex,
        topicsPerSubject,
      });
      const response = await fetch(`/api/admin/pyq-insights/bootstrap-existing?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bootstrap failed');
      setBootstrapData(data);
      toast.success('Existing PYQ context generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bootstrap failed');
    } finally {
      setBootstrapLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">PYQ Insights Admin</h1>
          <p className="text-sm text-slate-500">
            Import AI facts, publish draft insights, and recompute topic trends.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadMeta()} disabled={loadingMeta}>
          {loadingMeta ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid h-11 w-full grid-cols-5">
          <TabsTrigger value="bootstrap">Bootstrap</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="bootstrap">
          <Card>
            <CardHeader>
              <CardTitle>Bootstrap from Existing PYQ Data</CardTitle>
              <CardDescription>
                Generate subject/topic context from current PYQ questions + explanations so you can prompt AI immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <div className="space-y-1">
                  <Label>From Year</Label>
                  <Input value={fromYear} onChange={(e) => setFromYear(e.target.value)} placeholder="2020" />
                </div>
                <div className="space-y-1">
                  <Label>To Year</Label>
                  <Input value={toYear} onChange={(e) => setToYear(e.target.value)} placeholder="2025" />
                </div>
                <div className="space-y-1">
                  <Label>Chunk Size</Label>
                  <Input value={chunkSize} onChange={(e) => setChunkSize(e.target.value)} placeholder="120" />
                </div>
                <div className="space-y-1">
                  <Label>Chunk Index</Label>
                  <Input value={chunkIndex} onChange={(e) => setChunkIndex(e.target.value)} placeholder="1" />
                </div>
                <div className="space-y-1">
                  <Label>Topics/Subject</Label>
                  <Input
                    value={topicsPerSubject}
                    onChange={(e) => setTopicsPerSubject(e.target.value)}
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleBootstrap} disabled={bootstrapLoading}>
                  {bootstrapLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                  Generate Existing Context
                </Button>
                {bootstrapData && (
                  <Badge variant="secondary">
                    {bootstrapData.summary.subjectsFound} subjects • {bootstrapData.summary.totalPyqQuestionsScanned} questions
                  </Badge>
                )}
              </div>

              {bootstrapData && (
                <>
                  {bootstrapData.chunk && (
                    <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-3 text-xs text-indigo-900">
                      <div>
                        Range: {bootstrapData.chunk.fromYear}-{bootstrapData.chunk.toYear} • Chunk{' '}
                        {bootstrapData.chunk.chunkIndex}/{bootstrapData.chunk.totalChunks} • Questions in range:{' '}
                        {bootstrapData.chunk.totalQuestionsInRange} • In this chunk:{' '}
                        {bootstrapData.chunk.questionsInChunk}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-white">
                          Done: {completedChunks.length}
                        </Badge>
                        <Badge variant="secondary" className="bg-white">
                          Remaining: {Math.max(bootstrapData.chunk.totalChunks - completedChunks.length, 0)}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={markCurrentChunkDone}>
                          Mark chunk {currentChunkNumber} done
                        </Button>
                      </div>
                      {completedChunks.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {completedChunks.map((n) => (
                            <Badge key={n} variant="outline" className="bg-white">
                              ✓ {n}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-500">Questions Scanned</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 text-xl font-black">
                        {bootstrapData.summary.totalPyqQuestionsScanned}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-500">With Explanation</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 text-xl font-black">
                        {bootstrapData.summary.questionsWithExplanation}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-500">Subjects Found</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 text-xl font-black">
                        {bootstrapData.summary.subjectsFound}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(bootstrapData.suggestedPrompt, 'AI Prompt')}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy AI Prompt
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleCopy(prettyJson(bootstrapData.aiInputTemplate), 'AI Input Template JSON')
                      }
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy AI Input Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleCopy(prettyJson(bootstrapData.sourceQuestions ?? []), 'Chunk Questions JSON')
                      }
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Chunk Questions
                    </Button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <Label>Suggested Prompt</Label>
                      <pre className="mt-2 overflow-auto rounded-lg border bg-slate-50 p-3 text-xs">
                        {bootstrapData.suggestedPrompt}
                      </pre>
                    </div>
                    <div>
                      <Label>AI Input Template</Label>
                      <pre className="mt-2 max-h-[280px] overflow-auto rounded-lg border bg-slate-50 p-3 text-xs">
                        {prettyJson(bootstrapData.aiInputTemplate)}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <Label>Subject/Topic Context Preview</Label>
                    <pre className="mt-2 max-h-[320px] overflow-auto rounded-lg border bg-slate-50 p-3 text-xs">
                      {prettyJson(bootstrapData.subjectTopicContext)}
                    </pre>
                  </div>

                  <div>
                    <Label>Chunk Questions Preview (for AI input)</Label>
                    <pre className="mt-2 max-h-[320px] overflow-auto rounded-lg border bg-slate-50 p-3 text-xs">
                      {prettyJson((bootstrapData.sourceQuestions ?? []).slice(0, 50))}
                    </pre>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" /> Import AI JSON
              </CardTitle>
              <CardDescription>
                Paste JSON payload with records. Use <code>upsert</code> to replace current drafts for topics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Import Mode</Label>
                  <Input
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value === 'append' ? 'append' : 'upsert')}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Publish Immediately?</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="publish-mode"
                      checked={publishImmediately}
                      onCheckedChange={setPublishImmediately}
                    />
                    <Label htmlFor="publish-mode" className="text-sm font-normal text-muted-foreground">
                      {publishImmediately ? 'Yes (Live)' : 'No (Draft)'}
                    </Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payload JSON</Label>
                <Textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='[{"subject":"History","topic":"Revolt 1857","facts":[...]}]'
                  className="min-h-[280px] font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                  Process Import
                </Button>
                {importSummary && (
                  <Badge variant="secondary">
                    Facts: {importSummary.facts_staged ?? 0} | Topics: {importSummary.topics_upserted ?? 0}
                  </Badge>
                )}
              </div>
              {importSummary && (
                <pre className="overflow-auto rounded-lg border bg-slate-50 p-3 text-xs">
                  {prettyJson(importSummary)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Publish Drafts</CardTitle>
                <CardDescription>Publish all drafts or scope by subject/topic IDs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Input
                    value={publishScope}
                    onChange={(e) =>
                      setPublishScope(
                        e.target.value === 'subject' || e.target.value === 'topic' ? e.target.value : 'all'
                      )
                    }
                  />
                </div>
                {publishScope === 'subject' && (
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={publishSubject}
                      onChange={(e) => setPublishSubject(e.target.value)}
                      placeholder="History"
                    />
                  </div>
                )}
                {publishScope === 'topic' && (
                  <div className="space-y-2">
                    <Label>Topic IDs (comma separated)</Label>
                    <Textarea
                      value={topicIdsCsv}
                      onChange={(e) => setTopicIdsCsv(e.target.value)}
                      className="min-h-[90px]"
                    />
                  </div>
                )}
                <Button onClick={handlePublish} disabled={publishing}>
                  {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Publish
                </Button>
                {publishedCount !== null && <Badge>Published: {publishedCount}</Badge>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Draft Summary</CardTitle>
                <CardDescription>Current draft inventory by subject.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right">Drafts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftBySubject.map((row) => (
                      <TableRow key={row.subject}>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell className="text-right">{row.draftCount}</TableCell>
                      </TableRow>
                    ))}
                    {draftBySubject.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-slate-500">
                          No drafts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-violet-600" /> Recompute Topic Trends
              </CardTitle>
              <CardDescription>
                Optional years CSV. Empty means recompute for all mapped PYQ years.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Years (comma separated)</Label>
                <Input value={yearsCsv} onChange={(e) => setYearsCsv(e.target.value)} placeholder="2021,2022,2023" />
              </div>
              <Button onClick={handleRecompute} disabled={recomputing}>
                {recomputing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Recompute Trends
              </Button>
              {recomputeResult && (
                <pre className="overflow-auto rounded-lg border bg-slate-50 p-3 text-xs">
                  {prettyJson(recomputeResult)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Import Jobs</CardTitle>
              <CardDescription>Latest import audit trail.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Failure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="max-w-[220px] truncate">{job.id}</TableCell>
                      <TableCell>{job.status ?? 'unknown'}</TableCell>
                      <TableCell>{job.totalRecords ?? 0}</TableCell>
                      <TableCell>{job.successCount ?? 0}</TableCell>
                      <TableCell>{job.failureCount ?? 0}</TableCell>
                    </TableRow>
                  ))}
                  {jobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">
                        No jobs yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Top Draft Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Drafts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draftByTopic.slice(0, 20).map((row) => (
                <TableRow key={row.topicId}>
                  <TableCell className="max-w-[300px] truncate">{row.topicTitle}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell className="text-right">{row.draftCount}</TableCell>
                </TableRow>
              ))}
              {draftByTopic.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500">
                    No draft topics available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
