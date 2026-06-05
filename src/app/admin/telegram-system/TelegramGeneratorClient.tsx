'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { sendTelegramBotMessage } from './actions';
import { toast } from 'sonner';
import { Send, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';

const MCQ_PROMPT = `Generate highly engaging MP Police 2026 GK MCQs in Hindi.
Follow this EXACT structure to ensure perfect Telegram HTML parsing:

1. A relevant, inspiring quote at the beginning (Prefix with > to make it a blockquote)
2. Use HTML \`<b>\` tags for bolding instead of markdown \`**\` if possible, or follow the pattern exactly.
3. Use <b>━━━━━━━━━━━━━━━━━━━━━━━</b> for dividers. Do not use <pre> or triple backticks.

Pattern:
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>
🏆 <b>MP POLICE CONSTABLE MASTER SERIES</b>
📅 <b>Day 002 | General Knowledge</b>
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>

> 💡 <i>"वर्दी का सपना पसीने से सींचा जाता है। आज की मेहनत ही कल आपके कंधों पर सितारे सजाएगी।"</i>

<b>प्रश्न 1: मध्य प्रदेश का राज्य वृक्ष कौन-सा है?</b>
A) नीम
B) बरगद
C) वट वृक्ष
D) साल

✅ <b>सही उत्तर: C) वट वृक्ष</b>

> 💡 <b>Explanation:</b> यह बरगद की एक प्रजाति है जो राज्य में प्रचुर मात्रा में पाई जाती है।

<b>━━━━━━━━━━━━━━━━━━━━━━━</b>

<b>प्रश्न 2: खजुराहो के मंदिर किस जिले में स्थित हैं?</b>
A) सतना
B) छतरपुर
C) पन्ना
D) टीकमगढ़

✅ <b>सही उत्तर: B) छतरपुर</b>

> 💡 <b>Explanation:</b> चंदेल राजाओं द्वारा निर्मित ये मंदिर अपनी वास्तुकला के लिए विश्व प्रसिद्ध हैं।

<b>━━━━━━━━━━━━━━━━━━━━━━━</b>

At the end, always include exactly this footer (including the blockquote style at the very end):
🔗 <b>Quick Access:</b>
👉 <a href="https://mppolice.zenscroll.app/syllabus">MP Police Syllabus Tracker</a>
👉 <a href="https://mppolice.zenscroll.app/free-quiz">MP Police Free Quiz</a>

> 👮 <i>हर सही उत्तर एक कदम है...</i>
> 🛡 <i>वर्दी की ओर बढ़ता हुआ कदम!</i>`;

const ONE_LINER_PROMPT = `Generate highly engaging MP Police 2026 GK One-Liners in Hindi.
Follow this EXACT structure to ensure perfect Telegram HTML parsing:

1. A relevant, inspiring quote at the beginning (Prefix with > to make it a blockquote)
2. Use HTML \`<b>\` tags for bolding instead of markdown \`**\` if possible, or follow the pattern exactly.
3. Use <b>━━━━━━━━━━━━━━━━━━━━━━━</b> for dividers. Do not use <pre> or triple backticks.

Pattern:
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>
🏆 <b>🔥 MPGK MASTER SERIES #02</b>
📅 <b>Day 002 | FIRST IN MP (एक पंक्ति में)</b>
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>

> 💡 <i>"सफलता एक दिन में नहीं मिलती, लेकिन ठान लो तो एक दिन जरूर मिलती है।"</i>

📌 <b>MP के प्रथम मुख्यमंत्री</b>
➡️ पं. रविशंकर शुक्ल

📌 <b>MP की प्रथम महिला राज्यपाल</b>
➡️ सरला ग्रेवाल

📌 <b>MP की प्रथम महिला मुख्यमंत्री</b>
➡️ उमा भारती

> 🧠 <b>Quick Revision:</b>
> 
> ✅ प्रथम मुख्यमंत्री → रविशंकर शुक्ल
> ✅ प्रथम महिला राज्यपाल → सरला ग्रेवाल
> ✅ प्रथम महिला मुख्यमंत्री → उमा भारती

<b>━━━━━━━━━━━━━━━━━━━━━━━</b>

> 🔥 <b>Latest MP Police Trend:</b>
> 
> MPGK का Weightage लगातार बढ़ रहा है।
> Daily MPGK Revision = Extra Score Advantage

<b>━━━━━━━━━━━━━━━━━━━━━━━</b>

At the end, always include exactly this footer (including the blockquote style at the very end):
🔗 <b>Quick Access:</b>
👉 <a href="https://mppolice.zenscroll.app/">MP Police Preparation</a>
👉 <a href="https://mppolice.zenscroll.app/free-quiz">MP Police Free Quiz</a>

> 👮 <i>जो रोज़ थोड़ा-थोड़ा पढ़ता है...</i>
> 🏆 <i>वही एक दिन वर्दी पहनता है!</i>`;

export default function TelegramGeneratorClient() {
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<'mcq' | 'oneliner' | null>(null);

  const handleCopyPrompt = (type: 'mcq' | 'oneliner') => {
    const promptToCopy = type === 'mcq' ? MCQ_PROMPT : ONE_LINER_PROMPT;
    navigator.clipboard.writeText(promptToCopy);
    setCopiedPrompt(type);
    toast.success('Prompt copied to clipboard! Paste it in ChatGPT.');
    setTimeout(() => setCopiedPrompt(null), 3000);
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to publish');
      return;
    }

    setIsPublishing(true);
    try {
      const result = await sendTelegramBotMessage(content);
      if (result.success) {
        toast.success('Message sent to Telegram successfully!');
        setContent(''); // clear after success
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Telegram Content Automator</h1>
        <p className="text-slate-500 mt-2">Generate and push premium formatted content to your Telegram Channel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Prompts */}
        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100/50">
              <CardTitle className="text-lg text-indigo-900">1. AI Content Prompts</CardTitle>
              <CardDescription>Copy these prompts and paste them into ChatGPT/Claude to generate perfectly formatted content.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* MCQ Prompt */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                  <span className="font-semibold text-slate-700 text-sm">MCQ Format Prompt</span>
                  <Button 
                    size="sm" 
                    variant={copiedPrompt === 'mcq' ? 'default' : 'outline'}
                    className={copiedPrompt === 'mcq' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => handleCopyPrompt('mcq')}
                  >
                    {copiedPrompt === 'mcq' ? <><CheckCircle2 className="w-4 h-4 mr-2"/> Copied</> : <><Copy className="w-4 h-4 mr-2"/> Copy Prompt</>}
                  </Button>
                </div>
                <div className="p-4 bg-white">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono line-clamp-4">{MCQ_PROMPT}</pre>
                </div>
              </div>

              {/* One-Liner Prompt */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                  <span className="font-semibold text-slate-700 text-sm">One-Liner Format Prompt</span>
                  <Button 
                    size="sm" 
                    variant={copiedPrompt === 'oneliner' ? 'default' : 'outline'}
                    className={copiedPrompt === 'oneliner' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => handleCopyPrompt('oneliner')}
                  >
                    {copiedPrompt === 'oneliner' ? <><CheckCircle2 className="w-4 h-4 mr-2"/> Copied</> : <><Copy className="w-4 h-4 mr-2"/> Copy Prompt</>}
                  </Button>
                </div>
                <div className="p-4 bg-white">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono line-clamp-4">{ONE_LINER_PROMPT}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Publisher */}
        <div>
          <Card className="border-blue-100 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100/50">
              <CardTitle className="text-lg text-blue-900">2. Push to Telegram</CardTitle>
              <CardDescription>Paste the AI generated text here. It will be parsed to Telegram HTML and sent instantly.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              <Textarea
                placeholder="Paste the generated content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[300px] [field-sizing:fixed] overflow-y-auto resize-none font-mono text-sm leading-relaxed"
              />
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handlePublish} 
                  disabled={isPublishing || !content.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  size="lg"
                >
                  {isPublishing ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send to Telegram</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
