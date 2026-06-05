'use client';

import { useState, useEffect } from 'react';
import { MPGK_SYLLABUS_DEEP_DIVE } from '@/features/revision/constants/mpgk-syllabus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getMpgkUnitStats } from '@/actions/mppolice-one-liners-admin';

export function MpgkUploadWizard() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicStats, setTopicStats] = useState<Record<string, number>>({});

  useEffect(() => {
    getMpgkUnitStats().then((res) => {
      if (res.success && res.topicCounts) {
        setTopicStats(res.topicCounts);
      }
    });
  }, []);

  const toggleTopic = (topicEn: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicEn)) {
        return prev.filter((t) => t !== topicEn);
      }
      if (prev.length >= 4) {
        toast.error('You can select a maximum of 4 topics for one batch.');
        return prev;
      }
      return [...prev, topicEn];
    });
  };

  const copyPrompt = async () => {
    if (selectedTopics.length === 0) {
      toast.error('Please select at least 1 topic.');
      return;
    }

    const topicsList = selectedTopics.map((t, i) => `${i + 1}. ${t}`).join('\n');

    const promptText = `I need you to generate highly engaging, exam-oriented GK One-Liner facts for the MP Police / MP SI exams.
The exam context is:
- Target: MP Police Constable / MP SI
- Depth Level: Exhaustive / Core Deep-Dive

Generate 10-15 deep-dive facts per topic.
For each fact, strictly output a JSON array of objects following this EXACT structure:
[
  {
    "subjectTag": "MP GK",
    "stemHi": "[Hindi Question here?]",
    "stemEn": "[English Question here?]",
    "answerHi": "[Hindi Answer here]",
    "answerEn": "[English Answer here]",
    "importanceScore": 9,
    "sortOrder": 1,
    "extendedData": {
      "syllabusTopic": "[Insert the EXACT topic name from the list below]",
      "memoryTip": "[Write trick in Hinglish using ENGLISH ALPHABETS only. Keep it super simple. e.g. 'Adam ne sabse pehle pashu pala Hoshangabad me']",
      "memoryTipEn": "[English equivalent trick]",
      "analogy": "[Create a real-world, highly engaging analogy to explain the concept. Use Bilingual Hindi / English format]",
      "explanationHi": "[Examiner Trap in Hindi]",
      "explanationEn": "[Examiner Trap in English]",
      "related": ["MPGK", "History", "Specific Subtopic"],
      "patternConnections": [
        "🔗 [Hindi / English bilingual connection 1]",
        "🔗 [Hindi / English bilingual connection 2]"
      ],
      "pyqs": [
        {
          "exam": "MP Police Constable",
          "year": "2017",
          "question": "[Hindi / English bilingual question]",
          "answer": "[Hindi / English bilingual answer]"
        }
      ]
    }
  }
]

Please generate facts for the following selected topics:
${topicsList}

Remember: Ensure 100% accurate facts. The entire content (explanations, pyqs, connections) MUST support both Hindi and English (Bilingual). Write 'memoryTip' strictly in easy Hinglish with English letters to make it very fun and simple. For pyqs, generate exactly 3 pyqs per fact. Return ONLY valid JSON array.`;

    try {
      await navigator.clipboard.writeText(promptText);
      toast.success('Prompt copied to clipboard! Paste it into ChatGPT or Claude.');
    } catch (e) {
      toast.error('Failed to copy.');
    }
  };

  return (
    <Card className="mt-6 border-indigo-100">
      <CardHeader className="bg-indigo-50/50">
        <CardTitle className="flex items-center text-indigo-900">
          <Sparkles className="mr-2 h-5 w-5 text-indigo-600" />
          MPGK AI Generation Wizard
        </CardTitle>
        <CardDescription>
          Select up to 4 topics from the syllabus below, generate an AI prompt, and paste the returned JSON to upload.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Syllabus Selector */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">1. Select Topics (Max 4)</h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                Total Uploaded: {Object.values(topicStats).reduce((a, b) => a + b, 0)} Facts
              </span>
            </div>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-6">
                {MPGK_SYLLABUS_DEEP_DIVE.map((unit) => {
                  let unitFactCount = 0;
                  unit.chapters.forEach(c => c.micro_topics.forEach(t => unitFactCount += (topicStats[t.topic_en] || 0)));

                  return (
                    <div key={unit.unit_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-indigo-700">
                          Unit {unit.unit_id}: {unit.unit_name_en}
                        </h4>
                        {unitFactCount > 0 && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                            {unitFactCount} facts
                          </span>
                        )}
                      </div>
                      {unit.chapters.map((chapter, cIdx) => (
                        <div key={cIdx} className="ml-4 space-y-2 border-l-2 border-slate-200 pl-4">
                          <h5 className="font-semibold text-slate-800">{chapter.chapter_name_en}</h5>
                          <div className="space-y-2">
                            {chapter.micro_topics.map((topic, tIdx) => {
                              const isUploaded = topicStats[topic.topic_en] > 0;
                              return (
                                <div key={tIdx} className={cn("flex items-start space-x-2 p-2 rounded-lg transition-colors", isUploaded ? "bg-slate-50 opacity-60" : "hover:bg-slate-50")}>
                                  <input
                                    type="checkbox"
                                    id={`topic-${unit.unit_id}-${cIdx}-${tIdx}`}
                                    checked={selectedTopics.includes(topic.topic_en)}
                                    onChange={() => toggleTopic(topic.topic_en)}
                                    disabled={isUploaded || (selectedTopics.length >= 4 && !selectedTopics.includes(topic.topic_en))}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50 mt-0.5"
                                  />
                                  <Label
                                    htmlFor={`topic-${unit.unit_id}-${cIdx}-${tIdx}`}
                                    className={cn("text-xs font-medium leading-tight peer-disabled:cursor-not-allowed flex-1", isUploaded ? "line-through text-slate-400" : "text-slate-700")}
                                  >
                                    {topic.topic_en}
                                  </Label>
                                  {isUploaded && (
                                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 bg-slate-200 px-2 py-0.5 rounded whitespace-nowrap">
                                      UPLOADED ({topicStats[topic.topic_en]})
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="text-sm font-medium text-slate-500">
              Selected: {selectedTopics.length} / 4 topics
            </div>
            <Button onClick={copyPrompt} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Copy className="mr-2 h-4 w-4" /> Generate & Copy Prompt
            </Button>
          </div>

          {/* Guidelines & Steps */}
          <div className="space-y-4 rounded-lg bg-slate-50 p-4 border h-fit">
            <h3 className="font-semibold text-slate-900">2. How to process?</h3>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-700">
              <li>Select up to 4 topics from the syllabus list.</li>
              <li>Click <strong>Generate & Copy Prompt</strong>.</li>
              <li>Open ChatGPT or Claude and paste the copied prompt.</li>
              <li>Wait for AI to generate the JSON array.</li>
              <li>Copy the JSON output and paste it into the <strong>Import JSON array</strong> box on the <em>Standard Importer</em> tab.</li>
              <li>Click <strong>Import</strong>.</li>
            </ol>
            <div className="mt-4 rounded bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-600" />
              <strong>Pro-tip:</strong> The new JSON format supports `patternConnections` to link 3-4 facts together and `pyqs` to embed previous year questions directly into the expanded view!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
