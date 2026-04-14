'use client';

import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { uploadBlog } from '@/actions/blog-actions';
import { uploadTestFromJSON, getExistingTests } from '@/actions/admin-actions';
import { toast } from 'sonner';
import { Loader2, Upload, BookOpen, FileText, CheckCircle2, Plus, Database, Copy, Sparkles, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import {
  MPPOLICE_SECTION_IDS,
  getMppoliceFlattenedTopics,
  getMppoliceTopicsForSection,
  getSectionLabel,
  findTopicById,
} from '@/data/mppoliceSyllabus';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger } from '@/lib/logger';
import { Switch } from '@/components/ui/switch';
import { QuestionImageUploadHelper } from '@/app/admin/content-manager/QuestionImageUploadHelper';
import { ContentManagerUploadGuide } from '@/app/admin/content-manager/ContentManagerUploadGuide';
import { getErrorMessage } from '@/lib/errors';

export default function AdminUploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('blog');

  // Blog State
  const [blogData, setBlogData] = useState({
    imageUrl: '',
    contentJson: '',
  });

  // Test State
  const [testMode, setTestMode] = useState<'new' | 'existing'>('new');
  const [existingTests, setExistingTests] = useState<
    { id: string; title: string; type: string; totalQuestions: number }[]
  >([]);
  const [topicLang, setTopicLang] = useState<'hi' | 'en'>('hi'); // Language toggle for section labels

  const [strictBilingual, setStrictBilingual] = useState(false);
  const [collectionTag, setCollectionTag] = useState('');
  const [manualUiBucket, setManualUiBucket] = useState('');

  const [testData, setTestData] = useState({
    type: 'TOPIC', // FLT | UNIT | TOPIC | CSAT | MISC
    title: '',
    titleEn: '',
    unitId: 'sec_gk_reasoning',
    topicId: '', // For Topic Tests
    subjectTag: '', // MISC type ke liye subject tag
    description: '',
    existingTestId: '',
    questionsJson: '',
  });

  // Prompt Generator State
  const [promptBucket, setPromptBucket] = useState('');
  const [promptTopicId, setPromptTopicId] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const allFlattenedTopics = useMemo(() => getMppoliceFlattenedTopics(), []);
  
  const filteredPromptTopics = useMemo(() => {
    if (!promptBucket) return [];
    return allFlattenedTopics.filter(t => t.uiBucket === promptBucket);
  }, [promptBucket, allFlattenedTopics]);

  const generateAIPrompt = () => {
    if (!promptTopicId) {
      toast.error('Select a topic first');
      return;
    }
    const topic = allFlattenedTopics.find(t => t.id === promptTopicId);
    if (!topic) return;

    const subjectName = topic.uiBucket.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    const prompt = `TASK: Build 10 MCQs for MP Police Constable Paper I.
CONTENT TYPE: TOPIC drill (10 Questions Chapter-wise)
SUBJECT: ${subjectName}
TOPIC / CHAPTER: ${topic.front} (${topic.frontEn || topic.front})
SYLLABUS TOPIC ID (for admin): ${topic.id}

CONSTRAINTS:
- Difficulty: Exam level (Standard MP Police Constable)
- Every MCQ must include full extendedData.explanation (gk_science/math_quant/reasoning stream + bilingual *En fields)
- Strictly 10 questions only.
- Include one trap or common mistake where applicable.

Return valid JSON of exactly 10 question objects.`;
    
    setGeneratedPrompt(prompt);
    toast.success('Prompt generated!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  useEffect(() => {
    // Fetch existing tests on mount
    getExistingTests().then(setExistingTests);
  }, []);

  // Derived: Get Topics for selected Unit
  const availableTopics = useMemo(() => {
    if (!testData.unitId) return [];
    return getMppoliceTopicsForSection(testData.unitId);
  }, [testData.unitId]);

  const handleBlogChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestData((prev) => ({ ...prev, [name]: value }));
  };

  // --- SUBMIT BLOG ---
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate JSON structure
      let parsed = JSON.parse(blogData.contentJson);

      // If AI returns an array, take the first element
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          toast.error('JSON array is empty. Please provide valid content.');
          setIsLoading(false);
          return;
        }
        parsed = parsed[0]; // Take first element
      }

      if (!parsed.metadata || !parsed.content) {
        toast.error("Invalid JSON: Must contain 'metadata' and 'content' keys.");
        setIsLoading(false);
        return;
      }

      const { metadata, content } = parsed;

      // Validate metadata fields
      if (!metadata.title || !metadata.slug || !metadata.category) {
        toast.error('Missing required metadata: title, slug, or category.');
        setIsLoading(false);
        return;
      }

      // Validate content structure
      if (!content.hi || !content.en) {
        toast.error("Content must have both 'hi' and 'en' keys.");
        setIsLoading(false);
        return;
      }

      const res = await uploadBlog({
        imageUrl: blogData.imageUrl,
        contentJson: JSON.stringify(parsed), // Pass the extracted object
      });

      if (res.success) {
        toast.success(`${metadata.type === 'vlog' ? 'Vlog' : 'Blog'} uploaded successfully!`);
        setBlogData({
          imageUrl: '',
          contentJson: '',
        });
      } else {
        toast.error(res.error || 'Upload failed');
      }
    } catch (err) {
      logger.error('Blog Upload Failed:', err);
      toast.error('Invalid JSON format. Please check the structure.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUBMIT TEST ---
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate JSON first
      JSON.parse(testData.questionsJson);

      const formData = new FormData();
      formData.append('mode', testMode);
      formData.append('jsonData', testData.questionsJson);
      formData.append('strictBilingual', strictBilingual ? 'true' : 'false');

      if (testMode === 'new') {
        let finalTitle = testData.title;
        let finalTitleEn = testData.titleEn;
        // Auto-generate titles if Topic Test (Hindi-ish + English); JSON testTitle* still wins on server if form empty
        if (testData.type === 'TOPIC' && testData.topicId) {
          const topic = availableTopics.find((t) => t.id === testData.topicId);
          if (topic) {
            if (!finalTitle.trim()) {
              finalTitle = `त्वरित चेक: ${topic.front}`;
            }
            if (!finalTitleEn.trim()) {
              finalTitleEn = `Quick check: ${topic.frontEn || topic.front}`;
            }
          }
        }

        formData.append('title', finalTitle);
        formData.append('titleEn', finalTitleEn);
        formData.append('type', testData.type);
        formData.append('unitId', testData.unitId);
        formData.append('topicId', testData.topicId);
        if (collectionTag.trim()) {
          formData.append('collectionTag', collectionTag.trim());
        }
        const topicMeta = testData.topicId ? findTopicById(testData.topicId) : undefined;
        let resolvedBucket =
          testData.type === 'TOPIC' && topicMeta
            ? topicMeta.uiBucket
            : manualUiBucket || '';
        const miscBucketMap: Record<string, string> = {
          'General Knowledge': 'general_knowledge',
          'General Science': 'general_science',
          'Logical Reasoning': 'logical_reasoning',
          'Quantitative Aptitude': 'quantitative_aptitude',
          'MP General Knowledge': 'mp_general_knowledge',
        };
        if (testData.type === 'MISC' && testData.subjectTag && miscBucketMap[testData.subjectTag]) {
          resolvedBucket = miscBucketMap[testData.subjectTag];
        }
        if (resolvedBucket) {
          formData.append('uiBucket', resolvedBucket);
        }
        // MISC type ke liye subject tag bhi bhejo
        if (testData.type === 'MISC' && testData.subjectTag) {
          formData.append('subjectTag', testData.subjectTag);
        }
      } else {
        formData.append('existingTestId', testData.existingTestId);
      }

      const res = await uploadTestFromJSON(null, formData);

      if (res.success) {
        toast.success(res.message);
        setTestData((prev) => ({ ...prev, questionsJson: '', title: '' }));
        // Refresh existing tests
        getExistingTests().then(setExistingTests);
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err: unknown) {
      toast.error('Invalid JSON Questions: ' + getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Upload Center
            </h1>
            <p className="text-slate-500">Manage content, quizzes, and learning resources.</p>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">
              <span className="font-semibold text-emerald-800">MP Police tests:</span>{' '}
              <a
                href="/docs/mp-police-content-upload.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
              >
                Upload guide (types, tags, PYP / mock / 100-Q)
              </a>
              {' · '}
              <a
                href="/docs/mp-police-gemini-upload-walkthrough.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
              >
                Gemini steps (copy / paste / har type)
              </a>
              {' · '}
              <a
                href="/demo/mppolice-demo-questions.json"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
              >
                Demo JSON (5Q + image stub)
              </a>
              {' · '}
              <a
                href="/demo/upload/INDEX.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
              >
                Har type: 2Q demos (PYQ/FLT/TOPIC/UNIT/MISC/CSAT)
              </a>
              {' · '}
              <a
                href="/prompts/mppolice-ai-master.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
              >
                AI prompts (bulk + explanations)
              </a>
              {' · '}
              <a
                href="/docs/mp-police-syllabus-reference"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
              >
                Syllabus topic IDs
              </a>
            </p>
          </div>
        </div>

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <span className="font-semibold">Question / option images (Uploadthing):</span> pehle upar wala{' '}
          <strong>Tests &amp; Quizzes</strong> tab kholo — file picker usi tab ke andar,{' '}
          <strong>Questions JSON</strong> se thoda upar, dashed border wale card mein dikhega. Blog tab mein
          ye nahi hai.
        </p>

        <Tabs
          defaultValue="blog"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid h-12 w-full grid-cols-2 border bg-white p-1 shadow-sm md:w-[400px]">
            <TabsTrigger
              value="blog"
              className="h-full text-base data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
            >
              <FileText className="mr-2 h-4 w-4" /> Content (Blog/Vlog)
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="h-full text-base data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Tests & Quizzes
            </TabsTrigger>
          </TabsList>

          {/* === BLOG / VLOG TAB === */}
          <TabsContent value="blog">
            <Card className="border-indigo-100 shadow-md">
              <CardHeader className="border-b border-indigo-50/50 bg-gradient-to-r from-indigo-50 to-white">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Blog & Vlog Upload
                </CardTitle>
                <CardDescription>Create rich articles or video lessons.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleBlogSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Image URL (Optional)</Label>
                    <Input
                      name="imageUrl"
                      value={blogData.imageUrl}
                      onChange={handleBlogChange}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-slate-400">Cover image for the blog post</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>AI-Generated JSON (with Metadata + Content)</span>
                      <div className="flex gap-2">
                        <span className="text-xs font-normal text-slate-400">
                          Format: <code>{`{ "metadata": {...}, "content": {...} }`}</code>
                        </span>
                        <a
                          href="/prompts/blog_generation.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-500 hover:underline"
                        >
                          View Prompt
                        </a>
                      </div>
                    </Label>
                    <Textarea
                      name="contentJson"
                      value={blogData.contentJson}
                      onChange={handleBlogChange}
                      className="h-[400px] bg-slate-50 font-mono text-xs"
                      placeholder='{ "metadata": { "title": "...", "slug": "...", "description": "...", "category": "...", "readingTime": 5, "type": "blog" }, "content": { "hi": [...], "en": [...] } }'
                      required
                    />
                    <p className="text-[10px] text-slate-400">
                      Paste the complete JSON response from the AI generator. It should include both
                      metadata and bilingual content.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Blog
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TEST UPLOAD TAB === */}
          <TabsContent value="test">
            <Card className="border-emerald-100 shadow-md">
              <CardHeader className="border-b border-emerald-50/50 bg-gradient-to-r from-emerald-50 to-white">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Test & Quiz Upload
                </CardTitle>
                <CardDescription className="space-y-1">
                  <span className="block">
                    Create new assessments or append questions to existing ones. Follow the MP Police
                    guide so `examType`, tags, and buckets stay consistent.
                  </span>
                  <span className="block text-emerald-900/90">
                    <a
                      href="/docs/mp-police-content-upload.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      Read MP Police upload guide
                    </a>
                    {' · '}
                    <a
                      href="/docs/mp-police-gemini-upload-walkthrough.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      Gemini walkthrough
                    </a>
                    {' — '}
                    <a
                      href="/demo/mppolice-demo-questions.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      demo 5Q JSON
                    </a>
                    {' · '}
                    <a
                      href="/demo/upload/INDEX.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      type-wise 2Q demos
                    </a>
                    {' · '}
                    <a
                      href="/prompts/mppolice-ai-master.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      AI master prompt
                    </a>
                    {' · '}
                    <a
                      href="/docs/mp-police-syllabus-reference"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      Syllabus topic IDs
                    </a>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                 {/* 🚀 AI PROMPT GENERATOR SECTION */}
                 <div className="mb-10 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-6">
                    <div className="mb-4 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-lg">
                             <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div>
                             <h4 className="text-sm font-black tracking-tight text-emerald-900 uppercase">Chapter-wise Prompt Generator</h4>
                             <p className="text-[10px] font-medium text-emerald-600">Generate a perfect AI prompt for 10-question drills</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Subject Strip</Label>
                          <Select value={promptBucket} onValueChange={setPromptBucket}>
                             <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Subject" />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="general_knowledge">General Knowledge</SelectItem>
                                <SelectItem value="general_science">General Science</SelectItem>
                                <SelectItem value="logical_reasoning">Logical Reasoning</SelectItem>
                                <SelectItem value="quantitative_aptitude">Quantitative Aptitude</SelectItem>
                                <SelectItem value="mp_general_knowledge">MP General Knowledge</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>

                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Chapter / Topic</Label>
                          <Select 
                            value={promptTopicId} 
                            onValueChange={setPromptTopicId}
                            disabled={!promptBucket}
                          >
                             <SelectTrigger className="bg-white">
                                <SelectValue placeholder={!promptBucket ? "Select subject first" : "Select Topic"} />
                             </SelectTrigger>
                             <SelectContent>
                                <ScrollArea className="h-64">
                                   {filteredPromptTopics.map((t) => (
                                     <SelectItem key={t.id} value={t.id}>
                                       {t.front.slice(0, 50)}{t.front.length > 50 ? '...' : ''}
                                     </SelectItem>
                                   ))}
                                </ScrollArea>
                             </SelectContent>
                          </Select>
                       </div>

                       <div className="flex items-end">
                          <Button 
                            type="button"
                            onClick={generateAIPrompt}
                            className="w-full bg-emerald-700 font-bold hover:bg-emerald-800"
                            disabled={!promptTopicId}
                          >
                             Generate Prompt
                          </Button>
                       </div>
                    </div>

                    {generatedPrompt && (
                       <div className="mt-6 space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">AI Prompt (Copy & Paste to Gemini/GPT)</span>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => copyToClipboard(generatedPrompt)}
                               className="h-7 border-emerald-200 bg-white px-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"
                             >
                                <Copy className="mr-1 h-3 w-3" /> Copy Prompt
                             </Button>
                          </div>
                          <div className="relative">
                             <pre className="max-h-[150px] overflow-y-auto rounded-xl border border-emerald-100 bg-white p-4 text-[11px] leading-relaxed text-slate-700 shadow-inner">
                                {generatedPrompt}
                             </pre>
                             <div className="absolute right-3 bottom-3 animate-pulse">
                               <ArrowRight className="h-4 w-4 text-emerald-400" />
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                <form onSubmit={handleTestSubmit} className="space-y-6">
                  {/* Mode Toggle */}
                  <RadioGroup
                    value={testMode}
                    onValueChange={(v) => setTestMode(v as 'new' | 'existing')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div
                      className={`flex cursor-pointer items-center space-x-2 rounded-xl border p-4 transition-all ${testMode === 'new' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <RadioGroupItem value="new" id="new" className="text-emerald-600" />
                      <Label
                        htmlFor="new"
                        className="flex cursor-pointer items-center gap-2 font-bold"
                      >
                        <Plus className="h-4 w-4" /> Create New Test
                      </Label>
                    </div>
                    <div
                      className={`flex cursor-pointer items-center space-x-2 rounded-xl border p-4 transition-all ${testMode === 'existing' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <RadioGroupItem value="existing" id="existing" className="text-emerald-600" />
                      <Label
                        htmlFor="existing"
                        className="flex cursor-pointer items-center gap-2 font-bold"
                      >
                        <Database className="h-4 w-4" /> Add to Existing
                      </Label>
                    </div>
                  </RadioGroup>

                  {testMode === 'new' ? (
                    <>
                      {/* Test Type Selection */}
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                        <Label className="mb-2 block text-emerald-800">Test Type</Label>
                        <div className="flex flex-wrap gap-2">
                          {['TOPIC', 'UNIT', 'FLT', 'CSAT', 'PYQ', 'MISC'].map((type) => (
                            <div
                              key={type}
                              onClick={() => setTestData((p) => ({ ...p, type }))}
                              className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                                testData.type === type
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                  : 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400'
                              } `}
                            >
                              {type === 'TOPIC' ? 'Topic Check' : type === 'MISC' ? 'Free Quiz' : type}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Dynamic Fields based on Type */}
                        {(testData.type === 'TOPIC' || testData.type === 'UNIT' || testData.type === 'MISC') && (
                          <div className="space-y-2">
                            <Label>Select Unit</Label>
                            <Select
                              value={testData.unitId}
                              onValueChange={(v) =>
                                setTestData((p) => ({ ...p, unitId: v, topicId: '' }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MPPOLICE_SECTION_IDS.map((u) => (
                                  <SelectItem key={u} value={u}>
                                    {getSectionLabel(u, topicLang === 'hi' ? 'hi' : 'en')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {testData.type === 'TOPIC' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Select Topic (from Syllabus)</Label>
                              <div className="flex rounded-md bg-slate-100 p-1">
                                <button
                                  type="button"
                                  onClick={() => setTopicLang('hi')}
                                  className={`rounded px-2 py-0.5 text-xs transition-all ${topicLang === 'hi' ? 'bg-white font-bold text-indigo-600 shadow' : 'text-slate-500'}`}
                                >
                                  हिंदी
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTopicLang('en')}
                                  className={`rounded px-2 py-0.5 text-xs transition-all ${topicLang === 'en' ? 'bg-white font-bold text-indigo-600 shadow' : 'text-slate-500'}`}
                                >
                                  EN
                                </button>
                              </div>
                            </div>
                            <Select
                              value={testData.topicId}
                              onValueChange={(v) => setTestData((p) => ({ ...p, topicId: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a topic..." />
                              </SelectTrigger>
                              <SelectContent>
                                <ScrollArea className="h-64">
                                  {availableTopics.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                      {(t.front || '').slice(0, 72)}
                                      {(t.front || '').length > 72 ? '…' : ''}
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {testData.type === 'MISC' && (
                          <div className="space-y-2">
                            <Label>Subject Tag (Filter me dikhega)</Label>
                            <Select
                              value={testData.subjectTag}
                              onValueChange={(v) => setTestData((p) => ({ ...p, subjectTag: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Subject choose karo..." />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  'General Knowledge',
                                  'General Science',
                                  'Logical Reasoning',
                                  'Quantitative Aptitude',
                                  'MP General Knowledge',
                                ].map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Title (Hindi / primary)</Label>
                          <Input
                            name="title"
                            value={testData.title}
                            onChange={handleTestChange}
                            placeholder={
                              testData.type === 'TOPIC'
                                ? 'Optional — topic se auto (या JSON में testTitle)'
                                : 'Test title'
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title (English)</Label>
                          <Input
                            name="titleEn"
                            value={testData.titleEn}
                            onChange={handleTestChange}
                            placeholder={
                              testData.type === 'TOPIC'
                                ? 'Optional — topic se auto (या JSON में testTitleEn)'
                                : 'English title (optional)'
                            }
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>Select Existing Test</Label>
                      <Select
                        value={testData.existingTestId}
                        onValueChange={(v) => setTestData((p) => ({ ...p, existingTestId: v }))}
                      >
                        <SelectTrigger className="h-12 bg-white">
                          <SelectValue placeholder="Search or select a test..." />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-[300px]">
                            {existingTests.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No tests found
                              </SelectItem>
                            ) : (
                              existingTests.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  <span className="font-medium">{t.title}</span>
                                  <span className="ml-2 text-xs text-slate-400">
                                    ({t.type} • {t.totalQuestions} Qs)
                                  </span>
                                </SelectItem>
                              ))
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {testMode === 'new' && (
                    <ContentManagerUploadGuide
                      testType={testData.type}
                      unitId={testData.unitId}
                      topicId={testData.topicId}
                    />
                  )}

                  {testMode === 'new' && (
                    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <Label htmlFor="strict-bi">Strict bilingual</Label>
                          <p className="text-xs text-slate-500">
                            Require Hindi + English question text for every row
                          </p>
                        </div>
                        <Switch
                          id="strict-bi"
                          checked={strictBilingual}
                          onCheckedChange={setStrictBilingual}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Collection tag (optional)</Label>
                        <Input
                          value={collectionTag}
                          onChange={(e) => setCollectionTag(e.target.value)}
                          placeholder="e.g. pyp, memory, full-tests"
                        />
                      </div>
                      {testData.type !== 'TOPIC' && (
                        <div className="space-y-2">
                          <Label>Primary UI bucket (PYQ hub tabs)</Label>
                          <Select
                            value={manualUiBucket || '_none'}
                            onValueChange={(v) => setManualUiBucket(v === '_none' ? '' : v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Any / not set</SelectItem>
                              <SelectItem value="general_knowledge">General Knowledge</SelectItem>
                              <SelectItem value="general_science">General Science</SelectItem>
                              <SelectItem value="logical_reasoning">Logical Reasoning</SelectItem>
                              <SelectItem value="quantitative_aptitude">Quantitative Aptitude</SelectItem>
                              <SelectItem value="mp_general_knowledge">MP General Knowledge</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  <QuestionImageUploadHelper />

                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>Questions JSON Array</span>
                      <div className="flex gap-2">
                        <span className="text-xs font-normal text-slate-400">
                          Format:{' '}
                          <code>
                            [{`{ "questionText":"…","options":[{"id":"1","text":"…","text_en":"…"}],"correctAnswer":"1" }`}]
                          </code>
                        </span>
                        {testData.type === 'MISC' && (
                          <a
                            href="/prompts/free_quiz_generation.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-500 hover:underline"
                          >
                            View Prompt
                          </a>
                        )}
                      </div>
                    </Label>
                    <Textarea
                      name="questionsJson"
                      value={testData.questionsJson}
                      onChange={handleTestChange}
                      className="h-[300px] bg-emerald-50/30 font-mono text-xs font-medium text-slate-700"
                      placeholder='[{ "questionText": "Question 1", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }]'
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 animate-spin" />
                    ) : testMode === 'new' ? (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Create & Upload Test
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" /> Append to Test
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
