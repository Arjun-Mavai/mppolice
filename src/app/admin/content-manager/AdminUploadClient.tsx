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

/**
 * Robust JSON parser that handles common LLM artifact formatting issues
 * such as markdown code wrap and unescaped control characters inside strings.
 */
const parseJSONRobust = (jsonString: string) => {
  let cleaned = jsonString.trim();
  
  // Extract JSON block from markdown or conversational text
  const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownMatch && markdownMatch[1]) {
    cleaned = markdownMatch[1].trim();
  } else {
    // Fallback: find the first { or [ and the last } or ]
    const firstBracket = cleaned.search(/[\{\[]/);
    const lastBracket = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket >= firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }

  // Pass 1: Remove trailing commas (common in AI outputs)
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    // Pass 2: Aggressive sanitization for control characters and invalid escapes
    let inString = false;
    let escape = false;
    let sanitized = '';

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const nextChar = cleaned[i + 1];

      // Toggle inString on unescaped quotes
      if (char === '"' && !escape) {
        inString = !inString;
      }

      if (inString && !escape) {
        if (char === '\\') {
          // Valid JSON escapes: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
          const validEscapes = '"\\/bfnrtu';
          if (!nextChar || !validEscapes.includes(nextChar)) {
            // Found a "naked" backslash or invalid escape (\_ \  \*)
            // Escape the backslash so it becomes a literal backslash in the string
            sanitized += '\\\\';
            continue;
          } else {
            // This is a valid escape sequence starting character
            sanitized += '\\';
            escape = true; // Next character is part of this escape sequence
            continue;
          }
        }
        
        // Handle literal control characters that might be unescaped inside strings
        if (char === '\n') { sanitized += '\\n'; continue; }
        if (char === '\r') { sanitized += '\\r'; continue; }
        if (char === '\t') { sanitized += '\\t'; continue; }
      } else if (escape) {
        // We just processed a backslash that started a valid escape
        escape = false;
      }

      sanitized += char;
    }

    try {
      return JSON.parse(sanitized);
    } catch (fallbackError: any) {
      logger.error(`Robust JSON Parse Failed. Original length: ${cleaned.length}`, fallbackError, { category: 'admin' });
      throw new Error(`Syntax Error: ${fallbackError.message}. Please verify the JSON structure.`);
    }
  }
};

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
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const generateAIPrompt = () => {
    if (!promptBucket) {
      toast.error('Select a Subject Strip first to format explanation JSON');
      return;
    }

    // Determine the stream based on the subject/bucket
    let streamType = 'gk_science';
    let isMixed = false;
    if (promptBucket === 'logical_reasoning') streamType = 'reasoning';
    if (promptBucket === 'quantitative_aptitude') streamType = 'math_quant';
    if (promptBucket === 'auto_mixed' || promptBucket === 'mp_general_knowledge') {
      isMixed = true;
      // Default fallback for mixed
      streamType = 'auto (gk_science, reasoning, or math_quant)';
    }

    const testTypeContext = testData.type === 'TOPIC' ? 'Chapter-wise Topic Test' 
                          : testData.type === 'MISC' ? 'Free Quiz / Miscellaneous Test'
                          : testData.type === 'FLT' ? 'Full Length Test (Mock / MBT)'
                          : testData.type === 'PYQ' ? 'Previous Year Paper'
                          : testData.type;

    const streamInstructions = isMixed 
      ? `5. DEEP EXPLANATION FORMAT (AUTO-DETECT): Since this is a mixed test (e.g. FLT/PYP/MBT), YOU MUST ANALYZE EACH QUESTION individually.
   - If the question is Math/Quant, strictly use stream: "math_quant"
   - If the question is Logical Reasoning, strictly use stream: "reasoning"
   - If the question is GK/Science, strictly use stream: "gk_science"
   You must provide the correct keys in the explanation depending on the stream chosen (see EXPLANATION KEY MAPPING below).`
      : `5. DEEP EXPLANATION FORMAT: Every single question MUST include the "extendedData.explanation" JSON block with stream: "${streamType}". This brings the Instant Mode to life.`;

    const explanationKeyMapping = isMixed
      ? `EXPLANATION KEY MAPPING (Based on Stream chosen):
For "gk_science":
{ "stream": "gk_science", "facts": ["Point 1 (Hi/En)", "Point 2"], "factsEn": ["Point 1 En", "Point 2 En"], "mnemonics": ["Short trick or way to remember"], "related": ["Related concept"], "memoryTip": "Friendly teacher tip (e.g. इसे हमेशा ऐसे याद रखो...)" }

For "reasoning":
{ "stream": "reasoning", "chain": ["Step 1 clear thought", "Step 2"], "chainEn": ["Step 1 En", "Step 2 En"], "pattern": "The exact logic/pattern used", "elimination": "Why 3 other options are instantly wrong", "memoryTip": "Shortcut to see this logic next time" }

For "math_quant":
{ "stream": "math_quant", "steps": ["Step 1 calculation", "Step 2"], "stepsEn": ["Step 1 metric", "Step 2"], "shortcut": "The 10-second mental math trick", "trap": "Calculative trap where students fail", "memoryTip": "Formula / Golden rule" }`
      : `MANDATORY JSON FORMAT (Array of objects):
[
  {
    "questionText": "Original Question in Hindi",
    "questionTextEn": "Original Question in English",
    "options": ["Option 1 (Hi/En)", "Option 2 (Hi/En)", "Option 3 (Hi/En)", "Option 4 (Hi/En)"],
    "correctAnswer": "1",
    "extendedData": {
      "explanation": {
        "stream": "${streamType}",
        ${streamType === 'gk_science' ? '"facts": ["Point 1 (Hi/En)", "Point 2", "Point 3"],\n        "factsEn": ["Point 1 En", "Point 2 En"],\n        "mnemonics": ["Short trick or way to remember"],\n        "related": ["Related concept"],\n        "memoryTip": "Friendly teacher tip (e.g. इसे हमेशा ऐसे याद रखो...)"' : streamType === 'reasoning' ? '"chain": ["Step 1 clear thought", "Step 2"],\n        "chainEn": ["Step 1 En", "Step 2 En"],\n        "pattern": "The exact logic/pattern used",\n        "elimination": "Why 3 other options are instantly wrong",\n        "memoryTip": "Shortcut to see this logic next time"' : '"steps": ["Step 1 calculation", "Step 2"],\n        "stepsEn": ["Step 1 metric", "Step 2"],\n        "shortcut": "The 10-second mental math trick",\n        "trap": "Calculative trap where students fail",\n        "memoryTip": "Formula / Golden rule"'}
      }
    }
  }
]`;

    const mixedMandatoryFormat = isMixed 
      ? `MANDATORY JSON FORMAT STRUCTURE:
[
  {
    "questionText": "Original Question in Hindi",
    "questionTextEn": "Original Question in English",
    "options": ["Option 1 (Hi/En)", ...],
    "correctAnswer": "1",
    "extendedData": {
      "explanation": {
        // Output properties based on the selected stream (map shown above)
      }
    }
  }
]`
      : ``;

    const prompt = `TASK: Formatter & MP Police AI Expert.
I will outline some raw questions below.

YOUR JOB:
1. Keep the ONLY questions I provide exactly the SAME (DO NOT change them, do not generate new questions unless asked).
2. Generate 4 highly relevant options matching the MP Police Constable pattern.
3. Determine the correct answer (1, 2, 3, or 4).
4. Bilingual: Ensure questionText / options are in BOTH Hindi and English appropriately.
${streamInstructions}

CONTEXT / EXAM: MP Police Constable Paper I (${testTypeContext})

VOICE (Human Coach):
- Hindi: Spoken like a teacher ("पहले देखो...", "इसका मतलब...").
- English: Natural, friendly tutor.

${explanationKeyMapping}
${mixedMandatoryFormat}

RULES:
- Return ONLY valid JSON block. NO markdown wrapping inside data, NO introductory text.
${!isMixed ? `- Follow the EXACT explanation keys for '${streamType}'.` : `- Strictly follow the Explanation Key Mapping depending on which stream you use for each question.`}

RAW QUESTIONS TO PROCESS:
<PASTE YOUR QUESTIONS HERE>
`;
    
    setGeneratedPrompt(prompt);
    toast.success('Universal JSON prompt generated!');
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
      let parsed = parseJSONRobust(blogData.contentJson);

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
      const parsedJson = parseJSONRobust(testData.questionsJson);
      const cleanJsonString = JSON.stringify(parsedJson);

      const formData = new FormData();
      formData.append('mode', testMode);
      formData.append('jsonData', cleanJsonString);
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
                 <div className="mb-10 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200">
                             <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div>
                             <h4 className="text-base font-black tracking-tight text-emerald-900 uppercase">Universal AI JSON Formatter</h4>
                             <p className="text-xs font-medium text-emerald-600">Pates your questions, output deeply synced structured JSON</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Subject Strip (Sets Explanation Format)</Label>
                          <Select value={promptBucket} onValueChange={setPromptBucket}>
                             <SelectTrigger className="border-emerald-200 bg-white shadow-sm focus:ring-emerald-500">
                                <SelectValue placeholder="Select Subject to sync explanation stream" />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="general_knowledge">General Knowledge (Facts, Mnemonics)</SelectItem>
                                <SelectItem value="general_science">General Science (Facts, Mnemonics)</SelectItem>
                                <SelectItem value="logical_reasoning">Logical Reasoning (Chain, Pattern)</SelectItem>
                                <SelectItem value="quantitative_aptitude">Quantitative Aptitude (Steps, Shortcut, Trap)</SelectItem>
                                <SelectItem value="auto_mixed">🔥 Auto-Detect Mixed (FLT / PYP / MBT)</SelectItem>
                                <SelectItem value="mp_general_knowledge">MP General Knowledge</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>

                       <div className="flex items-end">
                          <Button 
                            type="button"
                            onClick={generateAIPrompt}
                            className="w-full bg-emerald-700 font-bold shadow-md hover:bg-emerald-800 transition-all active:scale-95"
                            disabled={!promptBucket}
                          >
                             Generate Master JSON Prompt
                          </Button>
                       </div>
                    </div>

                    {generatedPrompt && (
                       <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase">AI Master Prompt (Copy to Gemini/GPT-4o)</span>
                             </div>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => copyToClipboard(generatedPrompt)}
                               className="h-8 border-emerald-300 bg-white px-3 text-[10px] font-black text-emerald-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-800"
                             >
                                <Copy className="mr-1.5 h-3.5 w-3.5" /> COPY MASTER PROMPT
                             </Button>
                          </div>
                          <div className="relative group">
                             <pre className="max-h-[220px] overflow-y-auto rounded-xl border border-emerald-200 bg-white/80 p-5 text-[11px] leading-relaxed text-slate-700 shadow-inner scrollbar-thin scrollbar-thumb-emerald-200 indent-0">
{generatedPrompt}
                             </pre>
                             <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                               <Sparkles className="h-5 w-5 text-emerald-400/50" />
                             </div>
                          </div>
                          <p className="text-[10px] text-emerald-600 font-medium italic">
                            *Just paste your raw questions at the bottom of the prompt in ChatGPT/Gemini, and it will return the perfectly synced JSON array.
                          </p>
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
                      <span className="flex items-center gap-1.5 text-emerald-900 font-black uppercase tracking-wider text-xs">
                        <Database className="h-3.5 w-3.5" /> Questions JSON Array (Bilingual + extendedData)
                      </span>
                      <div className="flex gap-2">
                        <span className="text-xs font-normal text-slate-400">
                          Format:{' '}
                          <code>
                            [{`{ "questionText":"…", "extendedData": { "explanation": { "stream": "...", ... } } }`}]
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
                      className="h-[350px] bg-emerald-50/20 font-mono text-xs font-medium text-slate-700 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder='[{ "questionText": "...", "questionTextEn": "...", "options": [...], "correctAnswer": "1", "extendedData": { "explanation": { "stream": "gk_science", "facts": ["...", "..."], "memoryTip": "..." } } }]'
                      required
                    />
                    <div className="rounded-md bg-amber-50 p-3 border border-amber-100 mt-2">
                      <p className="text-[10px] text-amber-900 leading-relaxed">
                        <span className="font-bold">Pro Tip:</span> Use the <span className="font-bold underline uppercase">extendedData.explanation</span> key with a stream (gk_science, reasoning, or math_quant) to enable the premium tutor-style "Best Explanation" rendering in Instant Mode.
                      </p>
                    </div>
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
