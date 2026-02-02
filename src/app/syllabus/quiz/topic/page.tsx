'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Search, BookOpen, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { syllabusData } from '@/data/syllabusData';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from "sonner"; // Assuming toast is available or use existing import

const UNIT_COLORS = [
    'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white',
    'bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white',
    'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
    'bg-yellow-50 text-yellow-600 border-yellow-100 group-hover:bg-yellow-600 group-hover:text-white',
    'bg-lime-50 text-lime-600 border-lime-100 group-hover:bg-lime-600 group-hover:text-white',
    'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-600 group-hover:text-white',
    'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    'bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-600 group-hover:text-white',
    'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white',
    'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-600 group-hover:text-white',
];

export default function TopicSelectionPage() {
    const router = useRouter();
    const { language } = useSettingsStore();

    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Prepare Unit Data
    const units = Object.entries(syllabusData.units).map(([key, unit], index) => {
        // @ts-ignore
        const title = language === 'hi' ? unit.title : unit.title_en;
        // @ts-ignore
        const topics = language === 'hi' ? unit.topics : (unit.topics_en || unit.topics);
        
        return {
            id: key,
            index: index + 1,
            title,
            topics: topics
        };
    });

    const handleTopicClick = (unitId: string, topicId: number) => {
        // Placeholder for navigation
        console.log("Selected", unitId, topicId);
        toast.info(language === 'hi' ? 'टेस्ट जल्द ही आ रहा है!' : 'Test coming soon!');
    };

    // Filter topics if inside a unit
    const currentUnit = selectedUnitId ? units.find(u => u.id === selectedUnitId) : null;
    const filteredTopics = currentUnit ? currentUnit.topics.filter((t: any) => 
        t.front.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 pt-32">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => selectedUnitId ? setSelectedUnitId(null) : router.back()}
                            className="rounded-full hover:bg-slate-200 gap-2 pl-2 pr-4"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                            {selectedUnitId && <span className="text-slate-600 font-bold">{language === 'hi' ? 'वापस जाएं' : 'Back'}</span>}
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-display">
                                {selectedUnitId && currentUnit 
                                    ? (language === 'hi' ? `यूनिट ${currentUnit.index}: विषय चुनें` : `Unit ${currentUnit.index}: Select Topic`)
                                    : (language === 'hi' ? 'यूनिट चुनें' : 'Select Unit')
                                }
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {selectedUnitId 
                                    ? (language === 'hi' ? 'क्विक टेस्ट के लिए टॉपिक चुनें' : 'Choose a topic for quick check')
                                    : (language === 'hi' ? 'शुरुआत करने के लिए एक यूनिट चुनें' : 'Select a unit to get started')
                                }
                            </p>
                        </div>
                    </div>

                    {/* Search only visible inside a unit */}
                    {selectedUnitId && (
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder={language === 'hi' ? 'टॉपिक खोजें...' : 'Search topics...'}
                                className="pl-9 bg-white shadow-sm border-slate-200 focus:border-indigo-500 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {!selectedUnitId ? (
                        /* VIEW 1: UNIT GRID */
                        <motion.div 
                            key="unit-grid"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {units.map((unit, idx) => (
                                <motion.div
                                    key={unit.id}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card 
                                        className="h-full cursor-pointer hover:shadow-xl transition-all border-l-4 group bg-white"
                                        style={{ borderLeftColor: idx % 2 === 0 ? '#4f46e5' : '#db2777' }} // Indigo or Pink accent
                                        onClick={() => setSelectedUnitId(unit.id)}
                                    >
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1 text-xs">
                                                    UNIT {unit.index}
                                                </Badge>
                                                <div className={`p-2 rounded-lg transition-colors ${UNIT_COLORS[idx % UNIT_COLORS.length]}`}>
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-lg font-bold text-slate-800 leading-snug line-clamp-2 min-h-[3rem]">
                                                {unit.title}
                                            </h3>

                                            <div className="pt-2 flex items-center text-xs text-slate-400 font-medium">
                                                <BookOpen className="w-3 h-3 mr-1.5" />
                                                {unit.topics.length} {language === 'hi' ? 'टॉपिक्स' : 'Topics'}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        /* VIEW 2: TOPIC LIST (SCROLL AREA) */
                        <motion.div
                            key="topic-list"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                             <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
                                <ScrollArea className="h-[calc(100vh-220px)]">
                                    <div className="p-4 grid gap-3 md:grid-cols-2">
                                        {filteredTopics.length > 0 ? (
                                            filteredTopics.map((topic: any, index: number) => (
                                                <motion.div 
                                                    key={topic.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    onClick={() => handleTopicClick(selectedUnitId, topic.id)}
                                                    className="
                                                        flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 
                                                        hover:bg-indigo-50 hover:border-indigo-100 cursor-pointer transition-all group
                                                    "
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center border border-indigo-50 font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                            {topic.id}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="font-semibold text-slate-700 group-hover:text-indigo-900 transition-colors line-clamp-2 leading-tight">
                                                                {topic.front}
                                                            </span>
                                                            {topic.back && (
                                                                <p className="text-xs text-slate-400 line-clamp-1 group-hover:text-indigo-400">
                                                                    {topic.back}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center py-20">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                                    <Search className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <h3 className="text-slate-900 font-medium">No topics found</h3>
                                                <p className="text-slate-500 text-sm">Try searching with a different keyword</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
