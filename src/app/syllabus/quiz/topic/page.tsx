'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft,     Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
  
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from "sonner"; 
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
 import { getSyllabusTopics } from '@/actions/getSyllabusTopics';
import { getUserTier } from '@/lib/access-control';
 
import { QuizSubNav } from '@/features/syllabus/components/QuizSubNav';
import { QuizListItem } from '@/components/QuizListItem';

interface Topic {
    id: string; // UUID from DB
    unitId: string;
    order: number;
    title: string;
    titleEn: string | null;
    description: string | null; // Back text
    descriptionEn: string | null; 
    testId?: string;
    isFree: boolean;
    isFreeAccess: boolean;
    attemptsLeft: number | null;
    maxRetries: number | null;
}

interface Unit {
    id: string; // unit_1
    index: number;
    title: string; // Fallback or fetched
    topics: Topic[];
}

export default function TopicSelectionPage() {
    const router = useRouter();
    const { language, user } = useSettingsStore();

    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [paywallOpen, setPaywallOpen] = useState(false);
    
    const [dbData, setDbData] = useState<Record<string, Topic[]> | null>(null);
    const [loading, setLoading] = useState(true);

    const hi = language === 'hi';

    // Fetch DB Data on Mount
    useEffect(() => {
        getSyllabusTopics().then((res) => {
            console.log("[TopicPage] API Response:", res);
            if (res.success && res.data) {
                setDbData(res.data as any); 
            } else {
                toast.error("Failed to load topics");
            }
            setLoading(false);
        }).catch(err => {
            console.error("[TopicPage] Fetch error:", err);
            setLoading(false);
        });
    }, []);

    // Transform DB Data to UI Units
    const units: Unit[] = dbData ? Object.entries(dbData).map(([unitId, topicsData]) => {
        const unitIndex = parseInt(unitId.replace('unit_', '')) || 0;
        return {
            id: unitId,
            index: unitIndex,
            title: hi ? `यूनिट ${unitIndex}` : `Unit ${unitIndex}`, 
            topics: topicsData.sort((a: any, b: any) => a.order - b.order).map((t: any) => ({
                id: t.id,
                unitId: t.unitId,
                order: t.order,
                title: hi ? t.title : (t.titleEn || t.title),
                titleEn: t.titleEn,
                description: hi ? t.description : (t.descriptionEn || t.description),
                descriptionEn: t.descriptionEn,
                testId: t.testId,
                isFree: t.isFree,
                isFreeAccess: t.isFreeAccess,
                attemptsLeft: t.attemptsLeft,
                maxRetries: t.maxRetries
            }))
        };
    }).sort((a,b) => a.index - b.index) : [];


    const handleTopicClick = (unitId: string, topic: Topic) => {
        const isAdmin = (user as any)?.role === 'admin';
        
        // STRICT BACKEND ACCESS: 
        // We no longer use "limit" or "order" to lock tests.
        // If the backend says it's free (isFreeAccess), it's free.
        // If it's not free, user must be Pro/Lite (handled by backend or future generic check).
        // For now, if it is NOT free access and user is NOT admin/pro, it might be locked.
        // But the user specifically asked to remove local logic. 
        // so we rely on `topic.isFreeAccess` and maybe a simple check if they have subscription.
        
        // Actually, the previous logic was determining `isLocked` based on `order`.
        // Now `isLocked` should ideally come from backend or be simple:
        // Closed if: !isFreeAccess && !hasSubscription
        
        const effectiveTier = getUserTier(user as any);
        // FIX: 'guest' is not 'free', so strict check for paid tiers needed.
        const hasActivePlan = effectiveTier === 'lite' || effectiveTier === 'pro';
        
        const isUnlocked = topic.isFreeAccess || hasActivePlan || isAdmin;
        
        if (!isUnlocked) {
            setPaywallOpen(true);
            return;
        }
        
        if (topic.testId) {
             router.push(`/syllabus/quiz/play?unitId=${unitId}&testId=${topic.testId}`);
        } else {
             toast.error("Test coming soon!");
        }
    };

    const currentUnit = selectedUnitId ? units.find(u => u.id === selectedUnitId) : null;
    const filteredTopics = currentUnit ? currentUnit.topics.filter((t) => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#fafbfc] font-sans pb-20 relative overflow-hidden">
             {/* 🎭 PREMIUM BACKGROUND BLURS */}
             <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100/30 to-transparent pointer-events-none" />
             <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute bottom-[20%] left-[-150px] w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 relative z-10 pt-32">
                
                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                     <Button 
                        key={selectedUnitId ? 'back-to-units' : 'back-to-hub'}
                        variant="ghost" 
                        onClick={() => selectedUnitId ? setSelectedUnitId(null) : router.push('/syllabus/quiz')}
                        className="group -ml-3 text-slate-500 hover:text-slate-900 hover:bg-transparent p-0"
                    >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all mr-3">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest transition-colors">
                            {selectedUnitId ? (hi ? 'यूनिट लिस्ट' : 'Back to Units') : (hi ? 'क्विज़ हब' : 'Quiz Hub')}
                        </span>
                    </Button>
                </div>

                {/* 🧭 CONSOLIDATED SUB-NAV */}
                <QuizSubNav />

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 space-y-2 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                        {selectedUnitId && currentUnit 
                            ? currentUnit.title
                            : (hi ? 'टॉपिक टेस्ट' : 'Topic Tests')
                        }
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        {selectedUnitId 
                            ? (hi ? 'क्विक टेस्ट के लिए टॉपिक चुनें' : 'Select a topic for a quick 10-question check.')
                            : (hi ? 'शुरुआत करने के लिए एक यूनिट चुनें' : 'Choose a unit to explore specific topics and tests.')
                        }
                    </p>
                </motion.div>

                {/* Search only visible inside a unit */}
                {selectedUnitId && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-full max-w-md mx-auto mb-8"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder={hi ? 'टॉपिक खोजें...' : 'Search topics...'}
                            className="h-12 pl-12 bg-white/70 backdrop-blur-md shadow-sm border-slate-200 focus:border-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                )}

                {/* Content Area */}
                <div className="space-y-4 pb-20">
                    <AnimatePresence mode="wait">
                        {!selectedUnitId ? (
                            /* VIEW 1: UNIT LIST */
                            <motion.div 
                                key="unit-list"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {units.length > 0 ? (
                                    units.map((unit, idx) => (
                                        <QuizListItem
                                            key={unit.id}
                                            index={idx}
                                            title={unit.title}
                                            questions={unit.topics.length}
                                            language={language}
                                            colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]}
                                            onClick={() => setSelectedUnitId(unit.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                                        <h3 className="text-lg font-black text-slate-900 mb-2">
                                            {hi ? 'अापकी जानकारी उपलब्ध नहीं है' : 'No units available'}
                                        </h3>
                                        <p className="text-slate-500 text-sm">{hi ? 'कृपया बाद में प्रयास करें' : 'Please check back later.'}</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* VIEW 2: TOPIC LIST */
                            <motion.div
                                key="topic-list"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {filteredTopics.length > 0 ? (
                                    filteredTopics.map((topic, index) => {
                                        const isAdmin = (user as any)?.role === 'admin';
                                        const effectiveTier = getUserTier(user as any);
                                        // FIX: 'guest' is not 'free', so strict check for paid tiers needed.
                                        const hasActivePlan = effectiveTier === 'lite' || effectiveTier === 'pro';
                                        
                                        // Lock if NOT free access AND NOT (active plan or admin)
                                        // This ensures guests only see what is explicitly marked free.
                                        const isLocked = !topic.isFreeAccess && !hasActivePlan && !isAdmin;
                                        
                                        return (
                                            <QuizListItem
                                                key={topic.id}
                                                index={index}
                                                title={topic.title}
                                                questions={10} // Standard topic test
                                                isLocked={isLocked}
                                                isFree={topic.isFree}
                                                attemptsLeft={topic.attemptsLeft}
                                                maxAttempts={topic.maxRetries}
                                                language={language}
                                                colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[index % 5]}
                                                onClick={() => handleTopicClick(selectedUnitId, topic)}
                                            />
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                                        <h3 className="text-lg font-black text-slate-900 mb-2">
                                            {hi ? 'कोई टॉपिक नहीं मिला' : 'No topics found'}
                                        </h3>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
        </div>
    );
}
