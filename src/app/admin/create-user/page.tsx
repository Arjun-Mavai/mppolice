"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 ADMIN CREATE USER — Mobile-first form, all fields inline
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// No extra wrapper — directly shows form fields in admin layout.
// Fields: name, email, password, phone, role, planTier, duration, notes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCreateUserPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("guest");
    const [planTier, setPlanTier] = useState("lite");
    const [accessMonths, setAccessMonths] = useState(4);
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    // Default duration changes based on plan tier
    const handlePlanChange = (tier: string) => {
        setPlanTier(tier);
        // lite = 4 months, pro = 7 months, free = 0 (unlimited)
        if (tier === "lite") setAccessMonths(4);
        else if (tier === "pro") setAccessMonths(7);
        else setAccessMonths(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/auth/mppsc-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, email, password, role, planTier,
                    accessMonths: Number(accessMonths),
                    phone: phone || null,
                    metadata: notes ? { notes } : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");

            setResult(data.message);
            toast.success("User created!");
            setName(""); setEmail(""); setPassword(""); setPhone(""); setNotes("");
            setPlanTier("lite"); setRole("guest"); setAccessMonths(4);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm bg-white";
    const labelClass = "text-xs font-semibold text-slate-600 uppercase tracking-wider";

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <div className="mb-5">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                    Create User
                </h1>
                <p className="text-sm text-slate-500 mt-1">New user banao — turant login kar payega</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
                {result ? (
                    <div className="text-center space-y-4 py-6">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">{result}</p>
                        <Button variant="outline" onClick={() => setResult(null)} className="font-bold">
                            Create Another
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className={labelClass}>Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                required className={inputClass} placeholder="Rahul Sharma" />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className={labelClass}>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                required className={inputClass} placeholder="rahul@example.com" />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className={labelClass}>Password</label>
                            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}
                                required className={inputClass} placeholder="Str0ng@Pass!" />
                            <p className="text-[10px] text-slate-400">8+ chars, uppercase, lowercase, digit, special</p>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className={labelClass}>Phone <span className="text-slate-400 normal-case">(optional)</span></label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                className={inputClass} placeholder="+91 9876543210" />
                        </div>

                        {/* Role + Plan Tier — side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className={labelClass}>Role</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)}
                                    className={inputClass}>
                                    <option value="guest">Guest</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Plan Tier</label>
                                <select value={planTier} onChange={(e) => handlePlanChange(e.target.value)}
                                    className={inputClass}>
                                    <option value="free">Free</option>
                                    <option value="lite">Lite (4 mo)</option>
                                    <option value="pro">Pro (7 mo)</option>
                                </select>
                            </div>
                        </div>

                        {/* Access Duration */}
                        <div className="space-y-1">
                            <label className={labelClass}>Access Duration (months)</label>
                            <div className="flex items-center gap-2">
                                <input type="number" value={accessMonths} min={0} max={24}
                                    onChange={(e) => setAccessMonths(Number(e.target.value))}
                                    className={inputClass} />
                                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">0 = unlimited</span>
                            </div>
                        </div>

                        {/* Notes / Metadata */}
                        <div className="space-y-1">
                            <label className={labelClass}>Notes <span className="text-slate-400 normal-case">(optional — location, source, etc)</span></label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm bg-white resize-none"
                                placeholder="e.g. Bhopal, referred by Amit, WhatsApp group"
                            />
                        </div>

                        <Button type="submit" disabled={loading}
                            className="w-full h-11 font-bold bg-slate-900 hover:bg-slate-800 text-white">
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                            ) : (
                                <><UserPlus className="w-4 h-4 mr-2" /> Create User</>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
