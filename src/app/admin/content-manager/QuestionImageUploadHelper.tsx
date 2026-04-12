'use client';

import { useState } from 'react';
import { UploadButton } from '@/lib/uploadthing';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImagePlus, Copy } from 'lucide-react';

/**
 * Workflow: finish JSON for all text questions first. For Q#N that needs a figure,
 * upload here → paste URL into that array element (image MCQ shape below).
 * No auto-merge into 100-Q JSON (keeps importer simple and auditable).
 */
export function QuestionImageUploadHelper() {
  const [questionIndex, setQuestionIndex] = useState(1);
  const [lastUrls, setLastUrls] = useState<string[]>([]);
  const [snippet, setSnippet] = useState('');

  const buildSnippet = (urls: string[]) => {
    const main = urls[0] || '';
    if (!main) return '';
    return `// Question #${questionIndex} (0-based index ${questionIndex - 1} in array)
{
  "questionType": "image",
  "question": {
    "text": "Your question text here",
    "image": "${main}"
  },
  "options": [
    { "id": "1", "text": "", "image": "${urls[1] || 'OPTION_A_URL'}" },
    { "id": "2", "text": "", "image": "${urls[2] || 'OPTION_B_URL'}" },
    { "id": "3", "text": "", "image": "${urls[3] || 'OPTION_C_URL'}" },
    { "id": "4", "text": "", "image": "${urls[4] || 'OPTION_D_URL'}" }
  ],
  "correctOption": "2",
  "correctAnswer": "2",
  "subject": "Logical Reasoning",
  "marks": 1,
  "negativeMarks": 0
}`;
  };

  return (
    <Card className="border-dashed border-slate-300 bg-slate-50/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ImagePlus className="h-4 w-4" />
          Question / option images (Uploadthing)
        </CardTitle>
        <CardDescription className="space-y-1 text-xs leading-relaxed">
          <span className="block">
            100-Q JSON pehle text se banayein; sirf jis question me figure chahiye wahan URL paste
            karein. AI images generate nahi karta — aap diagram scan / official PDF crop karke upload
            karein.
          </span>
          <a
            href="/docs/mp-police-content-upload.md"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 underline"
          >
            Full guide
          </a>{' '}
          ·{' '}
          <a
            href="/prompts/mppolice-ai-master.md"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 underline"
          >
            AI prompts
          </a>{' '}
          · Demos:{' '}
          <a
            href="/demo/upload/INDEX.md"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 underline"
          >
            /demo/upload/
          </a>{' '}
          ·{' '}
          <a
            href="/demo/mppolice-demo-questions.json"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 underline"
          >
            5Q + image
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="q-idx">Question # (paper me)</Label>
            <Input
              id="q-idx"
              type="number"
              min={1}
              className="w-24"
              value={questionIndex}
              onChange={(e) => setQuestionIndex(Math.max(1, parseInt(e.target.value || '1', 10)))}
            />
          </div>
          <UploadButton
            endpoint="mppoliceQuestionImage"
            onClientUploadComplete={(res) => {
              const urls = res
                .map((r) => (r as { url?: string; ufsUrl?: string }).url || (r as { ufsUrl?: string }).ufsUrl)
                .filter(Boolean) as string[];
              setLastUrls(urls);
              const snip = buildSnippet(urls);
              setSnippet(snip);
              void navigator.clipboard.writeText(urls.join('\n'));
              toast.success(`${urls.length} URL(s) copied`, {
                description: 'Snippet below — paste into your JSON at the right index.',
              });
            }}
            onUploadError={(e) => {
              toast.error(e.message);
            }}
          />
        </div>

        {snippet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Template for this question slot (edit text / options)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() => {
                  void navigator.clipboard.writeText(snippet);
                  toast.success('Snippet copied');
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
            <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-[10px] leading-relaxed whitespace-pre-wrap break-all md:text-xs">
              {snippet}
            </pre>
          </div>
        )}

        {lastUrls.length > 0 && (
          <p className="text-[10px] text-slate-500">
            Raw URLs: {lastUrls.join(' | ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
