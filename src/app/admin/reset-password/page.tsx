"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 ADMIN RESET PASSWORD — Email + New Password → Direct DB update
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// No email sending — admin directly sets new password for user.
// Mobile-first card layout.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/auth/mppsc-forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");

            setResult(data.message);
            toast.success("Password reset done!");
            setEmail(""); setNewPassword("");
        } catch (error: any) {
            toast.error(error.message || "Request failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                    Reset Password
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    User ka email daalo, naya password set karo — directly DB me update hoga
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6">
                {result ? (
                    <div className="text-center space-y-4 py-4">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">{result}</p>
                        <Button variant="outline" onClick={() => setResult(null)} className="font-bold">
                            Reset Another
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">User Email</label>
                            <input
                                type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)} required
                                className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)} required
                                    className="w-full h-11 px-4 pr-11 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                    placeholder="Min 8 chars, A-z, 0-9, @$!%*?&"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">1 uppercase, 1 lowercase, 1 digit, 1 special char</p>
                        </div>
                        <Button type="submit" disabled={isLoading}
                            className="w-full h-11 font-bold bg-slate-900 hover:bg-slate-800 text-white">
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</>
                            ) : "Reset Password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
