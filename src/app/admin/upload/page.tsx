"use client";

import { useActionState } from 'react';
import { uploadTestFromJSON, getExistingTests } from '@/actions/admin-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const initialState = {
  success: false,
  message: '',
};

export default function AdminUploadPage() {
    const [state, formAction, isPending] = useActionState(uploadTestFromJSON, initialState);
    const [jsonStr, setJsonStr] = useState('');
    const [formatError, setFormatError] = useState('');
    const [mode, setMode] = useState<'new' | 'existing'>('new');
    const [existingTests, setExistingTests] = useState<{id: string, title: string, type: string, totalQuestions: number}[]>([]);

    useEffect(() => {
        // Fetch existing tests on mount
        getExistingTests().then(setExistingTests);
    }, []);

    const validateJson = (str: string) => {
        try {
            JSON.parse(str);
            setFormatError('');
            return true;
        } catch (e) {
            setFormatError('Invalid JSON format');
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Admin Data Ingestion</h1>
                    <p className="text-slate-500">Copy-paste the JSON from AI prompts to create or update tests.</p>
                </div>

                <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                    <form action={formAction} className="space-y-6">
                        
                        {/* Mode Selection */}
                        <div className="space-y-3">
                            <Label>Upload Mode</Label>
                            <RadioGroup defaultValue="new" name="mode" className="flex gap-4" onValueChange={(v) => setMode(v as 'new'|'existing')}>
                                <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-50">
                                    <RadioGroupItem value="new" id="mode-new" />
                                    <Label htmlFor="mode-new" className="cursor-pointer font-bold">Create New Test</Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-50">
                                    <RadioGroupItem value="existing" id="mode-existing" />
                                    <Label htmlFor="mode-existing" className="cursor-pointer font-bold">Add to Existing Test</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {mode === 'new' ? (
                            <>
                                {/* New Test Fields */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Test Title</Label>
                                    <Input 
                                        id="title" 
                                        name="title" 
                                        placeholder="e.g. MPPSC FLT 1 - 2026" 
                                        required={mode === 'new'}
                                        className="font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Test Type</Label>
                                        <Select name="type" required={mode === 'new'} defaultValue="FLT">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FLT">Full Length Test (FLT)</SelectItem>
                                                <SelectItem value="UNIT">Unit-Wise Test</SelectItem>
                                                <SelectItem value="PYQ">Previous Year Question</SelectItem>
                                                <SelectItem value="CSAT">CSAT (Paper 2)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unitId">Unit ID (If Unit Test)</Label>
                                        <Select name="unitId" defaultValue="unit_1">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({length: 10}, (_, i) => (
                                                    <SelectItem key={i} value={`unit_${i+1}`}>Unit {i+1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Existing Test Selection */
                            <div className="space-y-2">
                                <Label htmlFor="existingTestId">Select Test to Append To</Label>
                                <Select name="existingTestId" required={mode === 'existing'}>
                                    <SelectTrigger className="font-bold">
                                        <SelectValue placeholder="Choose a Test..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {existingTests.length === 0 ? (
                                            <SelectItem value="none" disabled>No tests found</SelectItem>
                                        ) : (
                                            existingTests.map(t => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    {t.title} <span className="text-slate-400 text-xs ml-2">({t.type} • {t.totalQuestions || 0} Qs)</span>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* JSON Input */}
                        <div className="space-y-2">
                            <Label htmlFor="jsonData">JSON Data Array {mode === 'existing' && <span className="text-slate-500 font-normal">(Questions will be added to above test)</span>}</Label>
                            <Textarea 
                                id="jsonData" 
                                name="jsonData" 
                                rows={10} 
                                placeholder='[ { "questionText": "..." } ]'
                                className="font-mono text-xs bg-slate-50 h-[300px] resize-y"
                                value={jsonStr}
                                onChange={(e) => {
                                    setJsonStr(e.target.value);
                                    validateJson(e.target.value);
                                }}
                                required
                            />
                            {formatError && <p className="text-xs text-red-500 font-bold">{formatError}</p>}
                        </div>

                        {/* Submit */}
                        <Button 
                            type="submit" 
                            disabled={isPending || !!formatError} 
                            className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" /> : (mode === 'new' ? "Create & Upload Test" : "Append Questions to Test")}
                        </Button>

                        {/* Feedback */}
                        {state.message && (
                            <div className={`p-4 rounded-lg font-medium text-center ${state.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {state.message}
                            </div>
                        )}

                    </form>
                </Card>
            </div>
        </div>
    );
}
