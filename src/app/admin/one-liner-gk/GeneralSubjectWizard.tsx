import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MPPOLICE_ONELINER_SUBJECTS } from '@/features/revision/constants/mppolice-one-liners';
import { fetchLatestQuestionsForSubject } from '@/actions/mppolice-one-liners-admin';

export function GeneralSubjectWizard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('General Science');
  const [topicInput, setTopicInput] = useState<string>('');
  const [mode, setMode] = useState<'new' | 'enhance'>('new');
  const [existingFacts, setExistingFacts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchFacts = async () => {
    setIsFetching(true);
    const res = await fetchLatestQuestionsForSubject(selectedSubject, 10);
    if (res.success && res.facts) {
      setExistingFacts(res.facts);
      toast.success(`Fetched ${res.facts.length} latest facts to enhance`);
    } else {
      toast.error('Failed to fetch existing facts');
    }
    setIsFetching(false);
  };

  const generateAndCopyPrompt = async () => {
    if (mode === 'new' && !topicInput.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    let promptText = '';
    
    if (mode === 'new') {
      promptText = `I need you to generate highly engaging, exam-oriented GK One-Liner facts for the MP Police / MP SI exams.
The exam context is:
- Target: MP Police Constable / MP SI / Vyapam
- Depth Level: Exhaustive / Core Deep-Dive

Generate 10-15 deep-dive facts for the following specific topic:
Subject: ${selectedSubject}
Topic: ${topicInput.trim()}

For each fact, strictly output a JSON array of objects following this EXACT structure:
[
  {
    "subjectTag": "${selectedSubject}",
    "stemHi": "[Hindi Question here?]",
    "stemEn": "[English Question here?]",
    "answerHi": "[Hindi Answer here]",
    "answerEn": "[English Answer here]",
    "importanceScore": 9,
    "sortOrder": 1,
    "extendedData": {
      "syllabusTopic": "${topicInput.trim()}",
      "memoryTip": "[Write trick in Hinglish using ENGLISH ALPHABETS only. Keep it super simple. e.g. 'Vitamin A ratondhi se bachata hai']",
      "memoryTipEn": "[English equivalent trick]",
      "analogy": "[Create a real-world, highly engaging analogy to explain the concept. Use Bilingual Hindi / English format]",
      "explanationHi": "[Examiner Trap in Hindi]",
      "explanationEn": "[Examiner Trap in English]",
      "related": ["${selectedSubject}", "Important Concept"],
      "patternConnections": [
        "🔗 [Hindi / English bilingual connection 1]",
        "🔗 [Hindi / English bilingual connection 2]"
      ],
      "pyqs": [
        {
          "exam": "MP Police / Vyapam",
          "year": "2017/2022",
          "question": "[Hindi / English bilingual question]",
          "answer": "[Hindi / English bilingual answer]"
        }
      ]
    }
  }
]

Remember: Ensure 100% accurate facts. The entire content (explanations, pyqs, connections) MUST support both Hindi and English (Bilingual). Write 'memoryTip' strictly in easy Hinglish with English letters to make it very fun and simple. For pyqs, generate exactly 3 pyqs per fact. Return ONLY valid JSON array.`;
    } else {
      if (existingFacts.length === 0) {
        toast.error('Please fetch existing facts first');
        return;
      }
      promptText = `I need you to ENHANCE the following existing GK One-Liner facts for the MP Police / MP SI exams.
The exam context is:
- Target: MP Police Constable / MP SI / Vyapam
- Depth Level: Exhaustive / Core Deep-Dive

Here are ${existingFacts.length} existing facts:
${JSON.stringify(existingFacts, null, 2)}

Your task is to rewrite this array into the EXACT same JSON structure but ENHANCED with "extendedData". 
CRITICAL: You MUST preserve the exact "id" field for every fact so it updates the existing database row. 
CRITICAL: Improve the questions/answers to be more professional and clear, and ensure both Hindi and English (stemEn, answerEn) are provided.

Output EXACTLY this structure for each fact in the array:
[
  {
    "id": "[EXACT ORIGINAL ID - DO NOT CHANGE]",
    "subjectTag": "${selectedSubject}",
    "stemHi": "[Improved Hindi Question]",
    "stemEn": "[English Question]",
    "answerHi": "[Improved Hindi Answer]",
    "answerEn": "[English Answer]",
    "importanceScore": 9,
    "sortOrder": 1,
    "extendedData": {
      "syllabusTopic": "${topicInput.trim() || 'General'}",
      "memoryTip": "[Write trick in Hinglish using ENGLISH ALPHABETS only. Keep it super simple. e.g. 'Vitamin A ratondhi se bachata hai']",
      "memoryTipEn": "[English equivalent trick]",
      "analogy": "[Create a real-world, highly engaging analogy to explain the concept. Use Bilingual Hindi / English format]",
      "explanationHi": "[Examiner Trap in Hindi]",
      "explanationEn": "[Examiner Trap in English]",
      "related": ["${selectedSubject}", "Important Concept"],
      "patternConnections": [
        "🔗 [Hindi / English bilingual connection 1]",
        "🔗 [Hindi / English bilingual connection 2]"
      ],
      "pyqs": [
        {
          "exam": "MP Police / Vyapam",
          "year": "2017/2022",
          "question": "[Hindi / English bilingual question]",
          "answer": "[Hindi / English bilingual answer]"
        }
      ]
    }
  }
]

Remember: Ensure 100% accurate facts. The entire content (explanations, pyqs, connections) MUST support both Hindi and English (Bilingual). Write 'memoryTip' strictly in easy Hinglish with English letters to make it very fun and simple. For pyqs, generate exactly 3 pyqs per fact. Return ONLY valid JSON array.`;
    }

    try {
      await navigator.clipboard.writeText(promptText);
      toast.success('Expert Prompt copied to clipboard!');
    } catch (e) {
      toast.error('Failed to copy prompt');
    }
  };

  const otherSubjects = MPPOLICE_ONELINER_SUBJECTS.filter((s) => s !== 'MP GK');

  return (
    <Card className="border-indigo-100 bg-white">
      <CardHeader className="border-b bg-indigo-50/50 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-black text-indigo-900">Other Subjects Expert Wizard</CardTitle>
            <CardDescription className="font-medium text-indigo-700/70">
              Generate prompts with PYQs & Memory Tricks for Science, History, etc.
            </CardDescription>
          </div>
          <Sparkles className="h-6 w-6 text-indigo-500" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Select Subject
            </Label>
            <div className="flex flex-wrap gap-2">
              {otherSubjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    selectedSubject === s
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg max-w-fit">
            <button
              onClick={() => setMode('new')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'new' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
            >
              Generate New
            </button>
            <button
              onClick={() => setMode('enhance')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'enhance' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
            >
              Enhance Existing
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Enter specific topic (or Category)
            </Label>
            <Input
              placeholder={mode === 'enhance' ? "e.g. Fundamental Rights (Optional)" : "e.g. Vitamins & Diseases..."}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="h-12 border-slate-200 font-medium"
            />
          </div>

          {mode === 'enhance' && (
            <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <Button 
                variant="outline" 
                onClick={fetchFacts} 
                disabled={isFetching}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              >
                {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Fetch 10 Latest Facts
              </Button>
              <span className="text-sm font-bold text-slate-600">
                {existingFacts.length} facts ready to enhance
              </span>
            </div>
          )}

          <Button 
            onClick={generateAndCopyPrompt} 
            disabled={mode === 'new' ? !topicInput.trim() : existingFacts.length === 0}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Expert AI Prompt
          </Button>

          <p className="text-[11px] text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
            <strong>How it works:</strong> Type your topic, copy the prompt, paste it in ChatGPT, and paste the resulting JSON into the <strong>Standard Importer</strong> tab below. The frontend will automatically detect the new expert format and render it beautifully (Classic facts will remain unaffected).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
