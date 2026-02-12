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
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield, Zap, Crown, Users, Filter, EyeOff, Eye, Pencil, Check, X, Hash, Calendar, RotateCcw, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toggleTestAccess, bulkUpdateTestAccess, toggleTestHidden, updateTestTitle, updateTestDisplayOrder, updateAttemptLimit, bulkUpdateMaxRetries } from './actions';
import { toast } from 'sonner';
import { revalidateSyllabus } from '@/actions/revalidate';

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
    topicId: string | null;
    slug: string;
    totalQuestions: number | null;
    isPro: boolean | null;
    isFreeAccess: boolean | null;
    isLiteAccess: boolean | null;
    isProAccess: boolean | null;
    isHidden: boolean | null;
    maxRetries: number | null;
    displayOrder: number | null;
    createdAt: Date | null;
    topicName: string | null;
    topicNameEn: string | null;
}

interface Props {
    initialTests: AdminTest[];
    initialAttemptLimits: Record<string, number | null>;
}

export default function TestAccessClient({ initialTests, initialAttemptLimits }: Props) {
    const router = useRouter();
    const [tests, setTests] = useState(initialTests);
    const [attemptLimits, setAttemptLimits] = useState(initialAttemptLimits);
    const [activeFilter, setActiveFilter] = useState<TestType | 'ALL'>('ALL');
    const [isPending, startTransition] = useTransition();
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [editOrderValue, setEditOrderValue] = useState('');
    const [editingLimit, setEditingLimit] = useState<string | null>(null);
    const [editLimitValue, setEditLimitValue] = useState('');
    const [unitFilter, setUnitFilter] = useState<string | null>(null);
    const PAGE_SIZE = 30;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Filter tests by type + unit sub-filter
    const filteredTests = (() => {
        let result = activeFilter === 'ALL' ? tests : tests.filter(t => t.type === activeFilter);
        if (unitFilter) result = result.filter(t => t.unitId === unitFilter);
        return result;
    })();

    // Get unique unitIds for TOPIC tests (for sub-filter)
    const topicUnitIds = activeFilter === 'TOPIC'
        ? [...new Set(tests.filter(t => t.type === 'TOPIC' && t.unitId).map(t => t.unitId!))].sort()
        : [];
    
    const visibleTests = filteredTests.slice(0, visibleCount);
    const hasMore = visibleCount < filteredTests.length;

    // Count tests per type — filter badge me dikhta hai
    const typeCounts = tests.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Single flag toggle — ek test ka ek flag
    const handleToggle = (testId: string, field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess', currentValue: boolean) => {
        const newValue = !currentValue;
        
        setTests(prev => prev.map(t => 
            t.id === testId ? { ...t, [field]: newValue } : t
        ));

        startTransition(async () => {
            try {
                await toggleTestAccess(testId, field, newValue);
                await revalidateSyllabus();
                toast.success(`Access updated!`);
            } catch {
                setTests(prev => prev.map(t => 
                    t.id === testId ? { ...t, [field]: currentValue } : t
                ));
                toast.error('Update failed');
            }
        });
    };

    // Hidden toggle
    const handleToggleHidden = (testId: string, currentValue: boolean) => {
        const newValue = !currentValue;
        setTests(prev => prev.map(t => 
            t.id === testId ? { ...t, isHidden: newValue } : t
        ));
        startTransition(async () => {
            try {
                await toggleTestHidden(testId, newValue);
                toast.success(newValue ? 'Test hidden!' : 'Test visible!');
            } catch {
                setTests(prev => prev.map(t => 
                    t.id === testId ? { ...t, isHidden: currentValue } : t
                ));
                toast.error('Update failed');
            }
        });
    };

    // Save title
    const handleSaveTitle = (testId: string) => {
        if (!editTitleValue.trim()) return;
        setTests(prev => prev.map(t => 
            t.id === testId ? { ...t, title: editTitleValue.trim() } : t
        ));
        setEditingTitle(null);
        startTransition(async () => {
            try {
                await updateTestTitle(testId, editTitleValue.trim());
                toast.success('Title updated!');
            } catch {
                router.refresh();
                toast.error('Title update failed');
            }
        });
    };

    // Save display order
    const handleSaveOrder = (testId: string) => {
        const order = parseInt(editOrderValue);
        if (isNaN(order)) return;
        setTests(prev => prev.map(t => 
            t.id === testId ? { ...t, displayOrder: order } : t
        ));
        setEditingOrder(null);
        startTransition(async () => {
            try {
                await updateTestDisplayOrder(testId, order);
                toast.success('Order updated!');
            } catch {
                router.refresh();
                toast.error('Order update failed');
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
                await revalidateSyllabus(); 
                toast.success(`All ${type} tests updated!`);
            } catch {
                // Reload fresh on failure
                router.refresh();
                toast.error('Bulk update failed');
            }
        });
    };

    // Bulk maxRetries update
    const [bulkRetriesValue, setBulkRetriesValue] = useState('5');
    const handleBulkMaxRetries = (type: TestType) => {
        const val = bulkRetriesValue.trim();
        const maxRetries = (val === '' || val === '0') ? null : parseInt(val);
        if (val !== '' && val !== '0' && isNaN(maxRetries!)) return;

        setTests(prev => prev.map(t => 
            t.type === type ? { ...t, maxRetries } : t
        ));
        startTransition(async () => {
            try {
                await bulkUpdateMaxRetries(type, maxRetries);
                toast.success(`All ${type} tests maxRetries → ${maxRetries ?? '∞'}!`);
            } catch {
                router.refresh();
                toast.error('Bulk maxRetries update failed');
            }
        });
    };

    // Save attempt limit for a test type
    const handleSaveLimit = (type: string) => {
        const val = editLimitValue.trim().toLowerCase();
        const maxAttempts = (val === '' || val === '0') ? null : parseInt(editLimitValue);
        if (val !== '' && val !== '0' && isNaN(maxAttempts!)) return;

        setAttemptLimits(prev => ({ ...prev, [type]: maxAttempts }));
        setEditingLimit(null);
        startTransition(async () => {
            try {
                await updateAttemptLimit(type as TestType, maxAttempts);
                toast.success(`${type} attempt limit updated!`);
            } catch {
                router.refresh();
                toast.error('Update failed');
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
                        onClick={() => { setActiveFilter('ALL'); setUnitFilter(null); setVisibleCount(PAGE_SIZE); }}
                        className="gap-1"
                    >
                        <Filter className="w-3 h-3" /> All ({tests.length})
                    </Button>
                    {(Object.keys(TYPE_CONFIG) as TestType[]).map(type => (
                        <Button
                            key={type}
                            variant={activeFilter === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setActiveFilter(type); setUnitFilter(null); setVisibleCount(PAGE_SIZE); }}
                        >
                            {TYPE_CONFIG[type].emoji} {TYPE_CONFIG[type].label} ({typeCounts[type] || 0})
                        </Button>
                    ))}
                </div>

                {/* ── Unit Sub-Filter (TOPIC filter active hone par) ──── */}
                {topicUnitIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        <Button
                            variant={unitFilter === null ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { setUnitFilter(null); setVisibleCount(PAGE_SIZE); }}
                        >
                            All Units ({tests.filter(t => t.type === 'TOPIC').length})
                        </Button>
                        {topicUnitIds.map(uid => {
                            const count = tests.filter(t => t.type === 'TOPIC' && t.unitId === uid).length;
                            return (
                                <Button
                                    key={uid}
                                    variant={unitFilter === uid ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => { setUnitFilter(uid); setVisibleCount(PAGE_SIZE); }}
                                >
                                    {uid.replace('unit_', 'U')} ({count})
                                </Button>
                            );
                        })}
                    </div>
                )}

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
                                <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
                                <div className="flex items-center gap-1.5">
                                    <RotateCcw className="w-3 h-3 text-slate-500" />
                                    <span className="text-xs text-slate-500">Max Retries:</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={bulkRetriesValue}
                                        onChange={(e) => setBulkRetriesValue(e.target.value)}
                                        className="h-7 w-16 text-center text-sm font-bold px-1"
                                        placeholder="∞"
                                    />
                                    <Button size="sm" variant="outline" className="gap-1 text-violet-700 border-violet-200 hover:bg-violet-50 h-7"
                                        onClick={() => handleBulkMaxRetries(activeFilter)}>
                                        <Check className="w-3 h-3" /> Set All
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Legend ──────────────────────────────────────────── */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 bg-white rounded-lg p-3 border">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-emerald-600" /> Free = Guest/Free users</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-blue-600" /> Lite = paid plan</span>
                    <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-amber-600" /> Pro = premium plan</span>
                    <span className="flex items-center gap-1"><EyeOff className="w-3 h-3 text-red-500" /> Hidden = users ko nahi dikhega</span>
                    <span className="text-slate-400">| ON = access hai, OFF = locked 🔒</span>
                </div>

                {/* ── Test Attempt Limits ─────────────────────────────── */}
                <Card className="border border-slate-200">
                    <CardContent className="p-4">
                        <p className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Test Attempt Limits
                            <span className="text-[10px] font-normal text-slate-400">(0 or empty = unlimited)</span>
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {(Object.keys(TYPE_CONFIG) as TestType[]).map(type => {
                                const limit = attemptLimits[type];
                                const isEditing = editingLimit === type;
                                return (
                                    <div key={type} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border", TYPE_CONFIG[type].color.replace('text-', 'border-').split(' ')[0], "bg-white")}>
                                        <span className="text-xs font-bold">{TYPE_CONFIG[type].emoji} {type}</span>
                                        {isEditing ? (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={editLimitValue}
                                                    onChange={(e) => setEditLimitValue(e.target.value)}
                                                    className="h-7 w-16 text-center text-sm font-bold px-1"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveLimit(type);
                                                        if (e.key === 'Escape') setEditingLimit(null);
                                                    }}
                                                />
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={() => handleSaveLimit(type)}>
                                                    <Check className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setEditingLimit(type); setEditLimitValue(limit != null ? String(limit) : ''); }}
                                                className="text-lg font-black text-slate-900 hover:text-blue-600 transition-colors"
                                            >
                                                {limit != null ? limit : '∞'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Test Cards ──────────────────────────────────────── */}
                <div className="space-y-3">
                    {filteredTests.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No tests found for this filter.
                        </div>
                    ) : (
                        visibleTests.map((test) => {
                            const typeConfig = TYPE_CONFIG[test.type as TestType] || TYPE_CONFIG.TOPIC;
                            const isHidden = test.isHidden ?? false;
                            
                            return (
                                <Card key={test.id} className={cn(
                                    "border transition-all",
                                    isPending && "opacity-70",
                                    isHidden && "opacity-60 border-dashed border-red-200 bg-red-50/30"
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
                                                    <span className="text-xs text-violet-500 font-medium">
                                                        {test.maxRetries != null ? `${test.maxRetries} retries` : '∞ retries'}
                                                    </span>
                                                    {isHidden && (
                                                        <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">
                                                            <EyeOff className="w-3 h-3 mr-1" /> Hidden
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                {/* Title — inline editable */}
                                                {editingTitle === test.id ? (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Input
                                                            value={editTitleValue}
                                                            onChange={(e) => setEditTitleValue(e.target.value)}
                                                            className="h-8 text-sm font-semibold"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveTitle(test.id);
                                                                if (e.key === 'Escape') setEditingTitle(null);
                                                            }}
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => handleSaveTitle(test.id)}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400" onClick={() => setEditingTitle(null)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 group">
                                                        <h3 className="font-semibold text-slate-900 truncate">
                                                            {test.type === 'TOPIC' && test.topicName ? test.topicName : test.title}
                                                        </h3>
                                                        <button
                                                            onClick={() => { setEditingTitle(test.id); setEditTitleValue(test.title); }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Display Order — inline editable */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Hash className="w-3 h-3 text-slate-400" />
                                                    {editingOrder === test.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                type="number"
                                                                value={editOrderValue}
                                                                onChange={(e) => setEditOrderValue(e.target.value)}
                                                                className="h-6 w-16 text-xs px-1"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSaveOrder(test.id);
                                                                    if (e.key === 'Escape') setEditingOrder(null);
                                                                }}
                                                            />
                                                            <Button size="icon" variant="ghost" className="h-5 w-5 text-emerald-600" onClick={() => handleSaveOrder(test.id)}>
                                                                <Check className="w-3 h-3" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-400" onClick={() => setEditingOrder(null)}>
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setEditingOrder(test.id); setEditOrderValue(String(test.displayOrder ?? 0)); }}
                                                            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                                                        >
                                                            Order: {test.displayOrder ?? 0}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Created At timestamp */}
                                                {test.createdAt && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(test.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(test.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}

                                                {/* Test ID with copy */}
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 group/id">
                                                    <span className="font-mono select-all">{test.id}</span>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(test.id); toast.success('ID copied!'); }}
                                                        className="opacity-0 group-hover/id:opacity-100 transition-opacity text-slate-400 hover:text-slate-700"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Controls: Hidden + Access Toggles */}
                                            <div className="flex items-center gap-6 shrink-0">
                                                {/* Hidden Toggle */}
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Hide</span>
                                                    <Switch
                                                        checked={isHidden}
                                                        onCheckedChange={() => handleToggleHidden(test.id, isHidden)}
                                                        className="data-[state=checked]:bg-red-500"
                                                    />
                                                </div>

                                                <div className="w-px h-8 bg-slate-200" />

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
                {hasMore && (
                    <div className="text-center pt-2">
                        <Button variant="outline" size="sm" onClick={() => setVisibleCount(v => v + PAGE_SIZE)}>
                            Load More ({filteredTests.length - visibleCount} remaining)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
