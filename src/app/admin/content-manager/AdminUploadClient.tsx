'use client';

import React, { useState, useEffect, useMemo, type ChangeEvent } from 'react';
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
import { Loader2, Upload, BookOpen, FileText, CheckCircle2, Plus, Database, Copy, Sparkles, MessageSquare, ExternalLink, ArrowRight, Zap, Layers } from 'lucide-react';
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
    isFreeAccess: false,
    isInstantMode: false,
  });

  // Prompt Generator State
  const [promptBucket, setPromptBucket] = useState('');
  const [promptMode, setPromptMode] = useState<'standard' | 'pyp' | 'subject_variety' | 'chapter_10q' | 'flt_expert'>('standard');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [miscSetNumber, setMiscSetNumber] = useState(1);

  const generateAIPrompt = () => {
    if (!promptBucket) {
      toast.error('Select a Subject Strip first to format explanation JSON');
      return;
    }

    // 1. DYNAMIC TOPIC DETECTION
    const unitLabel = getSectionLabel(testData.unitId, topicLang);
    const selectedTopic = findTopicById(testData.topicId);
    const targetTopicFull = selectedTopic 
      ? `${unitLabel}: ${selectedTopic.front}` 
      : (testData.subjectTag || unitLabel);

    // Determine the stream based on the subject/bucket
    let streamType = 'gk_science';
    let isMixed = false;
    if (promptBucket === 'logical_reasoning') streamType = 'reasoning';
    if (promptBucket === 'quantitative_aptitude') streamType = 'math_quant';
    if (promptBucket === 'auto_mixed' || promptBucket === 'mp_general_knowledge') {
      isMixed = true;
      streamType = 'auto'; // Will be detected by AI per question
    }

    const testTypeContext = testData.type === 'TOPIC' ? 'Chapter-wise Topic Test' 
                          : testData.type === 'MISC' ? 'Free Quiz / Miscellaneous Test'
                          : testData.type === 'FLT' ? 'Full Length Test (Mock / MBT)'
                          : testData.type === 'PYQ' ? 'Previous Year Paper'
                          : testData.type;

    // --- MODE SPECIFIC INSTRUCTIONS ---
    let modeInstructions = '';
    let countInstruction = '';
    let rolePersonaSnippet = '';

    if (promptMode === 'pyp') {
      rolePersonaSnippet = 'Reconstruct the provided Memory-Based paper with 100% accuracy.';
      modeInstructions = `TASK: Accurate Memory-Based Reconstruction. 
- Analyize the raw text and reconstruct it as a formal MP Police Constable Paper.
- Ensure the weightage matching VYAPAM/ESB standards.
- Maintain the original pattern strictly.`;
      countInstruction = 'Reconstruct all questions provided in the raw text.';
    } else {
      // SELF-GENERATION MODES (CHAPTER / SUBJECT / FLT)
      rolePersonaSnippet = 'Assume the role of an MP POLICE CONSTABLE EXAM EXPERT. Generate original, high-quality questions strictly based on the latest VYAPAM/ESB patterns (2023-2024).';
      
      if (promptMode === 'subject_variety') {
        let subjectGuidance = '';
        if (promptBucket === 'general_knowledge') {
          subjectGuidance = 'Focus on Indian History, Indian Geography, Indian Polity, Art & Culture, Economy, and Current Affairs. Avoid MP-specific questions here.';
        } else if (promptBucket === 'general_science') {
          subjectGuidance = 'Focus on Physics, Chemistry, Biology, and Environment/Ecology (10th/12th standard level).';
        } else if (promptBucket === 'mp_general_knowledge') {
          subjectGuidance = 'Strictly focus on MP History, MP Geography, MP Polity, MP Economy, MP Arts & Culture, and MP Current Affairs.';
        } else if (promptBucket === 'quantitative_aptitude') {
          subjectGuidance = 'Focus on Number System, Percentage, Profit/Loss, Time/Work, Speed/Distance, CI/SI, Mensuration, and basic Algebra/Geometry.';
        } else if (promptBucket === 'logical_reasoning') {
          subjectGuidance = 'Focus on Coding-Decoding, Number/Alphabet Series, Syllogism, Blood Relation, Direction, Dice, and Non-Verbal Reasoning.';
        } else {
          subjectGuidance = 'Mixed subjects from MP Police Constable syllabus.';
        }

        modeInstructions = `TASK: Subject-Wise Expert Generation (20 Questions Set).
- SUBJECT FOCUS: ${subjectGuidance}
- RESEARCH: Deeply analyze MP Police Constable patterns. Questions must be 10th/12th standard level. 
- VARIETY & UNIQUENESS: Generate exactly 20 UNIQUE questions. Make sure the questions have high variety. If the user generates this multiple times, ensure the next 20 questions are completely different so they can make 5 different tests. ${streamType === 'reasoning' ? 'Include at least 1-2 "Situation Reaction Test (SRT) / Police Ethics" questions.' : ''}
- LEVEL: Strictly MP Police Constable grade. Do not use UPSC/SSC CGL level.`;
        countInstruction = 'Generate exactly 20 high-quality original questions for the selected subject.';
      } else if (promptMode === 'chapter_10q') {
        modeInstructions = `TASK: Chapter-Wise Expert Deep Dive.
- COUNT: Generate EXACTLY 10 QUESTIONS.
- FOCUS: Cover every single subtype of this specific chapter (from basic to trap questions).`;
        countInstruction = 'Generate exactly 10 high-quality original questions.';
      } else if (promptMode === 'flt_expert') {
        modeInstructions = `TASK: Full Length Mock (100Q) / Mirror Test.
- BALANCE: 40 (GK/Reasoning) + 30 (Intellectual/Mental) + 30 (Science/Arithmetic).
- SIMULATION: Create a "Mirror Test" of a real MP Police Shift. ${promptBucket === 'auto' ? 'Use a balanced mix of all subjects.' : ''}`;
        countInstruction = 'Generate a complete balanced paper (suggest 100Q unless specified otherwise).';
      }
    }

    // Dynamic Explanation Key Mapping based on Stream
    const explanationConfig = isMixed 
      ? `DEEP EXPLANATION FORMAT (AUTO-DETECT):
For "gk_science": { "stream": "gk_science", "facts": [], "factsEn": [], "mnemonics": [], "related": [], "memoryTip": "" }
For "reasoning": { "stream": "reasoning", "chain": [], "chainEn": [], "pattern": "", "elimination": "", "memoryTip": "" }
For "math_quant": { "stream": "math_quant", "steps": [], "stepsEn": [], "shortcut": "", "trap": "", "memoryTip": "" }`
      : `MANDATORY EXPLANATION FORMAT (STREAM: ${streamType}):
${streamType === 'gk_science' ? '{ "stream": "gk_science", "facts": [], "factsEn": [], "mnemonics": [], "related": [], "memoryTip": "" }' : 
  streamType === 'reasoning' ? '{ "stream": "reasoning", "chain": [], "chainEn": [], "pattern": "", "elimination": "", "memoryTip": "" }' : 
  '{ "stream": "math_quant", "steps": [], "stepsEn": [], "shortcut": "", "trap": "", "memoryTip": "" }'}`;

    const prompt = `EXPERT PERSONA: MP Police Constable Syllabus & Exam Specialist.
${rolePersonaSnippet}

${modeInstructions}

YOUR MISSION:
1. ${countInstruction}
2. 4 Options + Correct Index (1-4).
3. Bilingual: Standard Hindi (Main) + English (Support) parallelly for both question and options.
4. DEEP EXPLANATION: Every question MUST have the "extendedData.explanation" block matching the stream patterns below.

${explanationConfig}

MANDATORY JSON FORMAT:
[
  {
    "questionText": "Question in Hindi?",
    "questionTextEn": "English version?",
    "options": ["1) Opt / Hin-Eng", "2) Opt / Hin-Eng", "3) Opt / Hin-Eng", "4) Opt / Hin-Eng"],
    "correctAnswer": "1",
    "extendedData": {
      "explanation": {
        // Correct stream properties here
      }
    }
  }
]

RULES:
- Return ONLY a valid JSON array. No markdown wrapping.
- Level: MP Police Constable (State Level). No over-complex UPSC stuff.

TARGET TOPIC/CHAPTER: ${targetTopicFull}
COUNT: ${promptMode === 'chapter_10q' ? '10' : promptMode === 'subject_variety' ? '20' : 'Manual'}

RAW TEXT (IF ANY):
<PASTE RAW TEXT BELOW IF IN PYP MODE>
`;
    
    setGeneratedPrompt(prompt);
    toast.success(`${promptMode.toUpperCase()} prompt generated for ${targetTopicFull}!`);
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

    // 🛡️ VALIDATION: If Topic mode is on, a topicId is MUST.
    if (testData.type === 'TOPIC' && !testData.topicId) {
      toast.error('❌ Syllabus Error: Selection Required', {
        description: 'Please select a specific Chapter / Topic from the syllabus dropdown below for Path A.',
      });
      return;
    }

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
        formData.append('isFreeAccess', testData.isFreeAccess ? 'true' : 'false');
        formData.append('isInstantMode', testData.isInstantMode ? 'true' : 'false');
      } else {
        formData.append('existingTestId', testData.existingTestId);
        // Same as new mode: so MBT `collection:memory` (etc.) actually persists on the row
        if (collectionTag.trim()) {
          formData.append('collectionTag', collectionTag.trim());
        }
      }

      const res = await uploadTestFromJSON(null, formData);

      if (res.success) {
        toast.success(res.message);
        
        if (testData.type === 'MISC' && testData.subjectTag) {
          const nextSet = miscSetNumber + 1;
          setMiscSetNumber(nextSet);
          setTestData((prev) => ({ 
            ...prev, 
            questionsJson: '', 
            title: `${prev.subjectTag} अभ्यास - Set ${nextSet}`,
            titleEn: `${prev.subjectTag} Practice - Set ${nextSet}`
          }));
        } else {
          setTestData((prev) => ({ ...prev, questionsJson: '', title: '' }));
        }
        
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
                  </span>
                </CardDescription>
                <CardDescription className="flex flex-col gap-2">
                  <span>
                    Upload structured JSON or raw text. Use the AI Prompt Generator below to convert
                    any text with 100% precision.
                  </span>
                  
                  {/* 🗺️ WORKFLOW HUB */}
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <WorkflowQuickLink 
                      icon={<BookOpen className="h-4 w-4" />} 
                      title="Path A: Chapter" 
                      subtitle="Self-Gen (Blue)" 
                      path="/docs/mppolice-ai-workflow-master.md#path-a-chapter-coverage-expert-mode"
                    />
                    <WorkflowQuickLink 
                      icon={<Sparkles className="h-4 w-4" />} 
                      title="Path B: Subject" 
                      subtitle="Self-Gen (Green)" 
                      path="/docs/mppolice-ai-workflow-master.md#path-b-subject-variety-expert-mode"
                    />
                    <WorkflowQuickLink 
                      icon={<Database className="h-4 w-4" />} 
                      title="Path C: PYP" 
                      subtitle="Manual (Amber)" 
                      path="/docs/mppolice-ai-workflow-master.md#path-c-pyp--memory-re-entry"
                    />
                    <WorkflowQuickLink 
                      icon={<Zap className="h-4 w-4" />} 
                      title="Path D: FLT" 
                      subtitle="Self-Gen (Rose)" 
                      path="/docs/mppolice-ai-workflow-master.md#path-d-full-length-tests-mock-expert"
                    />
                  </div>
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
                              <p className="text-[9px] font-black italic text-emerald-500 mt-0.5">
                                ✨ Select Topic/Unit below first to auto-inject in prompt.
                              </p>
                           </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                       <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-700">1. Workflow Mode</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'standard', label: 'Standard Clean', icon: FileText, color: 'bg-slate-500' },
                                { id: 'pyp', label: 'PYP (Needs Text)', icon: Database, color: 'bg-amber-600' },
                                { id: 'subject_variety', label: 'Subject Expert (Self-Gen)', icon: Sparkles, color: 'bg-emerald-600' },
                                { id: 'chapter_10q', label: 'Chapter Expert (Self-Gen)', icon: BookOpen, color: 'bg-blue-600' },
                                { id: 'flt_expert', label: 'FLT Expert (Self-Gen)', icon: Zap, color: 'bg-rose-600' },
                              ].map((mode) => (
                                <Button
                                  key={mode.id}
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                      setPromptMode(mode.id as any);
                                      if (mode.id === 'chapter_10q') setTestData(p => ({ ...p, type: 'TOPIC' }));
                                      if (mode.id === 'subject_variety') setTestData(p => ({ ...p, type: 'MISC' }));
                                      if (mode.id === 'pyp') setTestData(p => ({ ...p, type: 'PYQ' }));
                                      if (mode.id === 'flt_expert') setTestData(p => ({ ...p, type: 'FLT' }));
                                  }}
                                  className={`h-9 justify-start px-3 text-[10px] font-bold transition-all ${
                                    promptMode === mode.id 
                                      ? `border-transparent ${mode.color} text-white shadow-md` 
                                      : 'border-emerald-100 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
                                  }`}
                                >
                                  <mode.icon className="mr-2 h-3.5 w-3.5" />
                                  {mode.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-700">2. Subject Strip (Explanations)</Label>
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
                       </div>

                       <div className="flex flex-col justify-end gap-3">
                          <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm space-y-4">
                            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-900">
                              <Layers className="h-4 w-4" /> Workflow Quick Guides
                            </p>
                            
                            <div className="space-y-3">
                              {/* FLOW A */}
                              <div className="space-y-1">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black text-blue-700 uppercase">Flow A: Chapter-wise</span>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Select <strong>Chapter (10Q)</strong> + Subject → Select <strong>Topic Check</strong> → Select <strong>Topic ID</strong> → Upload. 
                                  <span className="block italic text-emerald-600 font-bold mt-1">Appears in: All strips + Subject strip.</span>
                                </p>
                              </div>

                              {/* FLOW B */}
                              <div className="space-y-1">
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700 uppercase">Flow B: Subject Variety</span>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Select <strong>Subject Variety</strong> + Subject → Select <strong>Free Quiz (MISC)</strong> → Upload.
                                  <span className="block italic text-emerald-600 font-bold mt-1">Appears in: specific Subject strip (e.g. Science).</span>
                                </p>
                              </div>

                              {/* FLOW C */}
                              <div className="space-y-1">
                                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-rose-700 uppercase">Flow C: PYP / Memory</span>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Select <strong>PYP (Memory)</strong> + Auto Mixed → Select <strong>PYQ</strong> → Upload.
                                  <span className="block italic text-emerald-600 font-bold mt-1">Appears in: PYP Dashboard / Intelligence Hub.</span>
                                </p>
                              </div>
                            </div>

                            <div className="border-t border-emerald-50 pt-3">
                               <a 
                                 href="/docs/mppolice-ai-workflow-master.md" 
                                 target="_blank" 
                                 className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-[10px] font-black text-white hover:bg-emerald-700 transition-all shadow-md"
                               >
                                 <BookOpen className="h-3 w-3" /> READ MASTER FLOW GUIDE
                               </a>
                            </div>
                          </div>

                          <Button 
                            type="button"
                            onClick={generateAIPrompt}
                            className="h-12 w-full bg-emerald-700 text-sm font-black shadow-lg hover:bg-emerald-800 transition-all active:scale-95 uppercase tracking-wide"
                            disabled={!promptBucket}
                          >
                             Generate Master AI Prompt
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
                             <div className="flex items-center gap-2">
                               {promptMode === 'subject_variety' && (
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   onClick={() => copyToClipboard("Generate 1 more set of 20 completely new and unique questions for the same subject.")}
                                   className="h-8 border-indigo-300 bg-white px-3 text-[10px] font-black text-indigo-700 shadow-sm hover:bg-indigo-50 hover:text-indigo-800"
                                 >
                                    <Copy className="mr-1.5 h-3.5 w-3.5" /> COPY NEXT SET PROMPT
                                 </Button>
                               )}
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 onClick={() => copyToClipboard(generatedPrompt)}
                                 className="h-8 border-emerald-300 bg-white px-3 text-[10px] font-black text-emerald-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-800"
                               >
                                  <Copy className="mr-1.5 h-3.5 w-3.5" /> COPY MASTER PROMPT
                               </Button>
                             </div>
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
                            <div className="flex items-center justify-between">
                              <Label>Select Unit</Label>
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
                            <Label>Select Topic (from Syllabus)</Label>
                            <Select
                              value={testData.topicId}
                              onValueChange={(v) => setTestData((p) => ({ ...p, topicId: v }))}
                            >
                              <SelectTrigger className={!testData.topicId ? "ring-2 ring-emerald-500 animate-pulse border-emerald-500" : "border-emerald-200"}>
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
                              onValueChange={(v) => {
                                // Calculate next set number from DB (existingTests)
                                let nextSet = 1;
                                const subjectTests = existingTests.filter(t => t.type === 'MISC' && t.title.includes(v));
                                if (subjectTests.length > 0) {
                                  let max = 0;
                                  subjectTests.forEach(t => {
                                    const match = t.title.match(/Set (\d+)/i);
                                    if (match && match[1]) {
                                      const num = parseInt(match[1], 10);
                                      if (num > max) max = num;
                                    }
                                  });
                                  nextSet = max + 1;
                                }

                                setMiscSetNumber(nextSet);
                                setTestData((p) => ({ 
                                  ...p, 
                                  subjectTag: v,
                                  title: `${v} अभ्यास - Set ${nextSet}`,
                                  titleEn: `${v} Practice - Set ${nextSet}`
                                }));
                              }}
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
                        
                        <div className="flex flex-row items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold text-slate-900">Free Access / Demo</Label>
                            <p className="text-xs text-slate-500">
                              Turn this ON to make the test free for everyone. Leave OFF to make it Premium (Locked).
                            </p>
                          </div>
                          <Switch
                            checked={testData.isFreeAccess}
                            onCheckedChange={(v) => setTestData((p) => ({ ...p, isFreeAccess: v }))}
                          />
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/30 p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold text-indigo-900">Enable Instant Mode</Label>
                            <p className="text-xs text-indigo-500/80">
                              Turn this ON to allow users to play this test in Instant Feedback mode.
                            </p>
                          </div>
                          <Switch
                            checked={testData.isInstantMode}
                            onCheckedChange={(v) => setTestData((p) => ({ ...p, isInstantMode: v }))}
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
                        <p className="text-[11px] leading-relaxed text-slate-600">
                          MP Police quiz hub: type <span className="font-mono font-semibold">memory</span> → MBT
                          tab (<span className="font-mono">collection:memory</span>). Leave empty or use{' '}
                          <span className="font-mono">pyp</span> / <span className="font-mono">pyq</span> for normal
                          PYP papers (not MBT). Saved on the test row as{' '}
                          <span className="font-mono">collection:yourvalue</span>.
                        </p>
                        <Input
                          value={collectionTag}
                          onChange={(e) => setCollectionTag(e.target.value)}
                          placeholder="memory | pyp | pyq | (leave empty for default PYP)"
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

function WorkflowQuickLink({ icon, title, subtitle, path }: { icon: React.ReactNode, title: string, subtitle: string, path: string }) {
  return (
    <a 
      href={path} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600 [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{title}</p>
        <p className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-500">{subtitle}</p>
      </div>
    </a>
  );
}
