'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎛️ TEST ACCESS MANAGER — Admin ka remote control
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Ye page admin ko dikhata hai sab tests ka access status
// Toggle karo flags → DB update → cache bust → frontend pe turant change
//
// Kya control karta hai?
//   isFreeAccess → Free/Guest users ko test free me milega
//   isLiteAccess → Lite plan users ko access milega
//   isProAccess  → Pro plan users ko access milega
//
// Filter by type (FLT/UNIT/CSAT/PYQ/TOPIC) → easy management
// Bulk actions → ek click me sab FLT tests ko Lite access de do
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Shield, Zap, Crown, Users, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toggleTestAccess, bulkUpdateTestAccess } from './actions';
import { toast } from 'sonner';

// Test type ka full form aur color — admin ko samajh aaye
const TYPE_CONFIG = {
    FLT: { label: 'Full Length Test', color: 'bg-violet-100 text-violet-700', emoji: '📝' },
    UNIT: { label: 'Unit Test', color: 'bg-blue-100 text-blue-700', emoji: '📚' },
    CSAT: { label: 'CSAT', color: 'bg-amber-100 text-amber-700', emoji: '🧠' },
    PYQ: { label: 'Previous Year', color: 'bg-emerald-100 text-emerald-700', emoji: '📜' },
    TOPIC: { label: 'Topic Test', color: 'bg-rose-100 text-rose-700', emoji: '🎯' },
} as const;

type TestType = keyof typeof TYPE_CONFIG;

interface AdminTest {
    id: string;
    title: string;
    titleEn: string | null;
    type: string;
    unitId: string | null;
    slug: string;
    totalQuestions: number | null;
    isPro: boolean | null;
    isFreeAccess: boolean | null;
    isLiteAccess: boolean | null;
    isProAccess: boolean | null;
    displayOrder: number | null;
    createdAt: Date | null;
}

interface Props {
    initialTests: AdminTest[];
}

export default function TestAccessClient({ initialTests }: Props) {
    const router = useRouter();
    const [tests, setTests] = useState(initialTests);
    const [activeFilter, setActiveFilter] = useState<TestType | 'ALL'>('ALL');
    const [isPending, startTransition] = useTransition();

    // Filter tests by type
    const filteredTests = activeFilter === 'ALL' 
        ? tests 
        : tests.filter(t => t.type === activeFilter);

    // Count tests per type — filter badge me dikhta hai
    const typeCounts = tests.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Single flag toggle — ek test ka ek flag
    const handleToggle = (testId: string, field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess', currentValue: boolean) => {
        const newValue = !currentValue;
        
        // Optimistic update — UI turant update, server background me
        setTests(prev => prev.map(t => 
            t.id === testId ? { ...t, [field]: newValue } : t
        ));

        startTransition(async () => {
            try {
                await toggleTestAccess(testId, field, newValue);
                toast.success(`Access updated!`);
            } catch {
                // Revert on failure — pehle jaisa kar do
                setTests(prev => prev.map(t => 
                    t.id === testId ? { ...t, [field]: currentValue } : t
                ));
                toast.error('Update failed');
            }
        });
    };

    // Bulk action — ek type ke sab tests
    const handleBulkUpdate = (type: TestType, field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess', value: boolean) => {
        // Optimistic update
        setTests(prev => prev.map(t => 
            t.type === type ? { ...t, [field]: value } : t
        ));

        startTransition(async () => {
            try {
                await bulkUpdateTestAccess(type, field, value);
                toast.success(`All ${type} tests updated!`);
            } catch {
                // Reload fresh on failure
                router.refresh();
                toast.error('Bulk update failed');
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-6xl mx-auto p-6 space-y-6">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-slate-700" />
                                Test Access Manager
                            </h1>
                            <p className="text-sm text-slate-500">
                                Toggle karo kaun kaunsa test de sakta hai — turant reflect hoga
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        {tests.length} Tests
                    </Badge>
                </div>

                {/* ── Filter Tabs ────────────────────────────────────── */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={activeFilter === 'ALL' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('ALL')}
                        className="gap-1"
                    >
                        <Filter className="w-3 h-3" /> All ({tests.length})
                    </Button>
                    {(Object.keys(TYPE_CONFIG) as TestType[]).map(type => (
                        <Button
                            key={type}
                            variant={activeFilter === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter(type)}
                        >
                            {TYPE_CONFIG[type].emoji} {TYPE_CONFIG[type].label} ({typeCounts[type] || 0})
                        </Button>
                    ))}
                </div>

                {/* ── Bulk Actions ────────────────────────────────────── */}
                {activeFilter !== 'ALL' && (
                    <Card className="border-dashed border-2 border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-sm font-bold text-slate-600 mb-3">
                                ⚡ Bulk Action — All {TYPE_CONFIG[activeFilter].label} Tests:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" className="gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => handleBulkUpdate(activeFilter, 'isFreeAccess', true)}>
                                    <Users className="w-3 h-3" /> All Free ON
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                                    onClick={() => handleBulkUpdate(activeFilter, 'isLiteAccess', true)}>
                                    <Zap className="w-3 h-3" /> All Lite ON
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                                    onClick={() => handleBulkUpdate(activeFilter, 'isProAccess', true)}>
                                    <Crown className="w-3 h-3" /> All Pro ON
                                </Button>
                                <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
                                <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                        handleBulkUpdate(activeFilter, 'isFreeAccess', false);
                                        handleBulkUpdate(activeFilter, 'isLiteAccess', false);
                                    }}>
                                    Lock All (Pro Only)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Legend ──────────────────────────────────────────── */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 bg-white rounded-lg p-3 border">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-emerald-600" /> Free = Guest/Free users</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-blue-600" /> Lite = paid plan</span>
                    <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-amber-600" /> Pro = premium plan</span>
                    <span className="text-slate-400">| ON = access hai, OFF = locked 🔒</span>
                </div>

                {/* ── Test Cards ──────────────────────────────────────── */}
                <div className="space-y-3">
                    {filteredTests.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No tests found for this filter.
                        </div>
                    ) : (
                        filteredTests.map((test) => {
                            const typeConfig = TYPE_CONFIG[test.type as TestType] || TYPE_CONFIG.TOPIC;
                            
                            return (
                                <Card key={test.id} className={cn(
                                    "border transition-all",
                                    isPending && "opacity-70"
                                )}>
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            
                                            {/* Test Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={cn("text-xs", typeConfig.color)}>
                                                        {typeConfig.emoji} {test.type}
                                                    </Badge>
                                                    {test.unitId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {test.unitId.replace('unit_', 'U')}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-slate-400">
                                                        {test.totalQuestions || 0}Q
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-slate-900 truncate">
                                                    {test.title}
                                                </h3>
                                            </div>

                                            {/* Access Toggles — 3 switches */}
                                            <div className="flex items-center gap-6 shrink-0">
                                                {/* Free Access */}
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Free</span>
                                                    <Switch
                                                        checked={test.isFreeAccess ?? false}
                                                        onCheckedChange={() => handleToggle(test.id, 'isFreeAccess', test.isFreeAccess ?? false)}
                                                        className="data-[state=checked]:bg-emerald-500"
                                                    />
                                                </div>

                                                {/* Lite Access */}
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Lite</span>
                                                    <Switch
                                                        checked={test.isLiteAccess ?? false}
                                                        onCheckedChange={() => handleToggle(test.id, 'isLiteAccess', test.isLiteAccess ?? false)}
                                                        className="data-[state=checked]:bg-blue-500"
                                                    />
                                                </div>

                                                {/* Pro Access */}
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pro</span>
                                                    <Switch
                                                        checked={test.isProAccess ?? true}
                                                        onCheckedChange={() => handleToggle(test.id, 'isProAccess', test.isProAccess ?? true)}
                                                        className="data-[state=checked]:bg-amber-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
