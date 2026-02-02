'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { uploadBlog } from "@/actions/blog-actions"; 
import { uploadTestFromJSON, getExistingTests } from '@/actions/admin-actions';
import { toast } from "sonner";
import { Loader2, FileJson, Upload, BookOpen, Video, FileText, CheckCircle2, Plus, Database } from "lucide-react";
import { syllabusData } from "@/data/syllabusData";

const UNITS = Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`);

export default function AdminUploadPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("blog");
    
    // Blog State
    const [blogData, setBlogData] = useState({
        title: '',
        slug: '',
        description: '',
        category: 'general',
        contentType: 'blog', // blog | vlog
        imageUrl: '',
        readingTime: 5,
        contentJson: ''
    });

    // Test State
    const [testMode, setTestMode] = useState<'new' | 'existing'>('new');
    const [existingTests, setExistingTests] = useState<{id: string, title: string, type: string, totalQuestions: number}[]>([]);
    const [topicLang, setTopicLang] = useState<'hi' | 'en'>('hi'); // Language toggle for topics
    
    const [testData, setTestData] = useState({
        type: 'TOPIC', // FLT | UNIT | TOPIC | CSAT
        title: '',
        unitId: 'unit_1',
        topicId: '', // For Topic Tests
        description: '',
        existingTestId: '',
        questionsJson: ''
    });

    useEffect(() => {
        // Fetch existing tests on mount
        getExistingTests().then(setExistingTests);
    }, []);

    // Derived: Get Topics for selected Unit
    const availableTopics = useMemo(() => {
        if (!testData.unitId) return [];
        // @ts-ignore
        const unit = syllabusData.units[testData.unitId];
        // Handle language structure differences
        if (topicLang === 'hi') {
            return unit?.topics || [];
        } else {
            return unit?.topics_en || unit?.topics || [];
        }
    }, [testData.unitId, topicLang]);

    const handleBlogChange = (e: any) => {
        const { name, value } = e.target;
        setBlogData(prev => ({ ...prev, [name]: value }));
    };

    const handleTestChange = (e: any) => {
        const { name, value } = e.target;
        setTestData(prev => ({ ...prev, [name]: value }));
    };

    // --- SUBMIT BLOG ---
    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            JSON.parse(blogData.contentJson); // Validate JSON
            const res = await uploadBlog(blogData);
            if (res.success) {
                toast.success(`${blogData.contentType === 'vlog' ? 'Vlog' : 'Blog'} uploaded!`);
                setBlogData(prev => ({ ...prev, title: '', slug: '', description: '', imageUrl: '', contentJson: '' }));
            } else {
                toast.error(res.error || "Upload failed");
            }
        } catch (err) {
            toast.error("Invalid JSON Content");
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

            if (testMode === 'new') {
                let finalTitle = testData.title;
                // Auto-generate title if Topic Test
                if (testData.type === 'TOPIC' && testData.topicId) {
                    const topic = availableTopics.find((t: any) => t.id.toString() === testData.topicId);
                    if (topic && !finalTitle) {
                         finalTitle = `Quick Check: ${topic.front}`;
                    }
                }
                
                formData.append('title', finalTitle);
                formData.append('type', testData.type);
                formData.append('unitId', testData.unitId);
                formData.append('topicId', testData.topicId); // Pass topicId
            } else {
                formData.append('existingTestId', testData.existingTestId);
            }

            const res = await uploadTestFromJSON(null, formData);
            
            if (res.success) {
                toast.success(res.message);
                setTestData(prev => ({ ...prev, questionsJson: '', title: '' }));
                // Refresh existing tests
                getExistingTests().then(setExistingTests);
            } else {
                toast.error(res.message || "Upload failed");
            }
        } catch (err: any) {
            toast.error("Invalid JSON Questions: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Upload Center</h1>
                        <p className="text-slate-500">Manage content, quizzes, and learning resources.</p>
                    </div>
                </div>

                <Tabs defaultValue="blog" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 w-full md:w-[400px] h-12 bg-white p-1 shadow-sm border">
                        <TabsTrigger value="blog" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 h-full text-base">
                            <FileText className="w-4 h-4 mr-2" /> Content (Blog/Vlog)
                        </TabsTrigger>
                        <TabsTrigger value="test" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 h-full text-base">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Tests & Quizzes
                        </TabsTrigger>
                    </TabsList>

                    {/* === BLOG / VLOG TAB === */}
                    <TabsContent value="blog">
                        <Card className="border-indigo-100 shadow-md">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50/50">
                                <CardTitle className="flex items-center gap-2 text-indigo-900">
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                    Blog & Vlog Upload
                                </CardTitle>
                                <CardDescription>Create rich articles or video lessons.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleBlogSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input name="title" value={blogData.title} onChange={handleBlogChange} required placeholder="Post Title" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug</Label>
                                            <Input name="slug" value={blogData.slug} onChange={handleBlogChange} required placeholder="unique-post-slug" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select value={blogData.contentType} onValueChange={(v) => setBlogData(p => ({...p, contentType: v}))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="blog"><div className="flex items-center"><FileText className="w-4 h-4 mr-2"/> Blog Article</div></SelectItem>
                                                    <SelectItem value="vlog"><div className="flex items-center"><Video className="w-4 h-4 mr-2"/> Vlog (Video)</div></SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={blogData.category} onValueChange={(v) => setBlogData(p => ({...p, category: v}))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General</SelectItem>
                                                    <SelectItem value="history">History</SelectItem>
                                                    <SelectItem value="geography">Geography</SelectItem>
                                                    <SelectItem value="polity">Polity</SelectItem>
                                                    <SelectItem value="strategy">Strategy</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Read Time (m)</Label>
                                            <Input type="number" name="readingTime" value={blogData.readingTime} onChange={handleBlogChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image URL</Label>
                                            <Input name="imageUrl" value={blogData.imageUrl} onChange={handleBlogChange} placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Short Description</Label>
                                        <Textarea name="description" value={blogData.description} onChange={handleBlogChange} placeholder="For card preview..." className="h-20" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex justify-between">
                                            <span>Content JSON</span>
                                            <span className="text-xs text-slate-400 font-normal">Use AI Prompt to generate</span>
                                        </Label>
                                        <Textarea 
                                            name="contentJson" 
                                            value={blogData.contentJson} 
                                            onChange={handleBlogChange} 
                                            className="font-mono text-xs h-[300px] bg-slate-50" 
                                            placeholder='[{ "type": "paragraph", "text": "..." }]'
                                            required 
                                        />
                                    </div>

                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload Content
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* === TEST UPLOAD TAB === */}
                    <TabsContent value="test">
                        <Card className="border-emerald-100 shadow-md">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-50/50">
                                <CardTitle className="flex items-center gap-2 text-emerald-900">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    Test & Quiz Upload
                                </CardTitle>
                                <CardDescription>Create new assessments or append questions to existing ones.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleTestSubmit} className="space-y-6">
                                    
                                    {/* Mode Toggle */}
                                    <RadioGroup value={testMode} onValueChange={(v) => setTestMode(v as 'new' | 'existing')} className="grid grid-cols-2 gap-4">
                                        <div className={`flex items-center space-x-2 border p-4 rounded-xl cursor-pointer transition-all ${testMode === 'new' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="new" id="new" className="text-emerald-600" />
                                            <Label htmlFor="new" className="cursor-pointer font-bold flex items-center gap-2"><Plus className="w-4 h-4"/> Create New Test</Label>
                                        </div>
                                        <div className={`flex items-center space-x-2 border p-4 rounded-xl cursor-pointer transition-all ${testMode === 'existing' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="existing" id="existing" className="text-emerald-600" />
                                            <Label htmlFor="existing" className="cursor-pointer font-bold flex items-center gap-2"><Database className="w-4 h-4"/> Add to Existing</Label>
                                        </div>
                                    </RadioGroup>

                                    {testMode === 'new' ? (
                                        <>
                                            {/* Test Type Selection */}
                                            <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                                <Label className="text-emerald-800 mb-2 block">Test Type</Label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {['TOPIC', 'UNIT', 'FLT', 'CSAT', 'PYQ'].map((type) => (
                                                        <div 
                                                            key={type}
                                                            onClick={() => setTestData(p => ({ ...p, type }))}
                                                            className={`
                                                                px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all border
                                                                ${testData.type === type 
                                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                                                    : 'bg-white text-emerald-900 border-emerald-200 hover:border-emerald-400'}
                                                            `}
                                                        >
                                                            {type === 'TOPIC' ? 'Topic Check' : type}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Dynamic Fields based on Type */}
                                                {(testData.type === 'TOPIC' || testData.type === 'UNIT') && (
                                                    <div className="space-y-2">
                                                        <Label>Select Unit</Label>
                                                        <Select value={testData.unitId} onValueChange={(v) => setTestData(p => ({...p, unitId: v, topicId: ''}))}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {UNITS.map(u => (
                                                                    <SelectItem key={u} value={u}>Unit {u.split('_')[1]}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                {testData.type === 'TOPIC' && (
                                                    <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label>Select Topic (from Syllabus)</Label>
                                                        <div className="flex bg-slate-100 rounded-md p-1">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setTopicLang('hi')}
                                                                className={`px-2 py-0.5 text-xs rounded transition-all ${topicLang === 'hi' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-500'}`}
                                                            >
                                                                हिंदी
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setTopicLang('en')}
                                                                className={`px-2 py-0.5 text-xs rounded transition-all ${topicLang === 'en' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-500'}`}
                                                            >
                                                                EN
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <Select value={testData.topicId} onValueChange={(v) => setTestData(p => ({...p, topicId: v}))}>
                                                        <SelectTrigger><SelectValue placeholder="Choose a topic..." /></SelectTrigger>
                                                        <SelectContent className="max-h-64">
                                                            {availableTopics.map((t: any) => (
                                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                                    {t.front.substring(0, 40)}...
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                )}
                                                
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input name="title" value={testData.title} onChange={handleTestChange} placeholder={testData.type === 'TOPIC' ? "Auto-generated if empty" : "Test Title"} />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>Select Existing Test</Label>
                                            <Select value={testData.existingTestId} onValueChange={(v) => setTestData(p => ({...p, existingTestId: v}))}>
                                                <SelectTrigger className="h-12 bg-white">
                                                    <SelectValue placeholder="Search or select a test..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {existingTests.length === 0 ? <SelectItem value="none" disabled>No tests found</SelectItem> : 
                                                        existingTests.map(t => (
                                                            <SelectItem key={t.id} value={t.id}>
                                                                <span className="font-medium">{t.title}</span> 
                                                                <span className="text-slate-400 text-xs ml-2">({t.type} • {t.totalQuestions} Qs)</span>
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="flex justify-between">
                                            <span>Questions JSON Array</span>
                                            <span className="text-xs text-slate-400 font-normal">Format: <code>[{`{ "questionText": "...", "options": ["A","B"], "correctAnswer": "A" }`}]</code></span>
                                        </Label>
                                        <Textarea 
                                            name="questionsJson" 
                                            value={testData.questionsJson} 
                                            onChange={handleTestChange} 
                                            className="font-mono text-xs h-[300px] bg-emerald-50/30 font-medium text-slate-700" 
                                            placeholder='[{ "questionText": "Question 1", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }]'
                                            required 
                                        />
                                    </div>

                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold shadow-emerald-200 shadow-lg" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : (testMode === 'new' ? <><Upload className="w-4 h-4 mr-2"/> Create & Upload Test</> : <><Database className="w-4 h-4 mr-2"/> Append to Test</>)}
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
