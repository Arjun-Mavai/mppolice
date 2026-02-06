"use client";

import { useAppStore } from "@/hooks/useAppStore";
import { User, LogOut, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
 
export default function ProfilePage() {
  const router = useRouter();
  const { savedQuotes, swipeCount, isPro, syncProStatus } = useAppStore();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                syncProStatus(!!data.user.is_pro);
            } else {
                // If fetching fails (unauthorized), redirect to login
                router.push("/login");
            }
        } catch (e) {
            logger.error("Profile Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    }
    fetchUser();
  }, [router, syncProStatus]);

  const handleLogout = async () => {
    try {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login"); 
        
    } catch (error) {
        logger.error("Logout failed", error);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
      );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/app" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
                <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold font-display">Profile</h1>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-display font-bold text-2xl">
                {user.name ? user.name[0].toUpperCase() : <User size={40} />}
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name || "Mindful User"}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
                    {isPro ? "Pro Member" : "Free Plan"}
                    {isPro && <Check size={12} />}
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-4xl font-bold text-gray-900 mb-1">{savedQuotes.length}</div>
                <div className="text-gray-500 text-sm font-medium">Saved Quotes</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-4xl font-bold text-gray-900 mb-1">{swipeCount}</div>
                <div className="text-gray-500 text-sm font-medium">Daily Swipes</div>
            </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
             <button 
                onClick={handleLogout}
                className="w-full p-4 bg-white border border-red-100 text-red-600 rounded-2xl flex items-center justify-center gap-2 font-medium hover:bg-red-50 transition-colors"
            >
                <LogOut size={20} />
                Sign Out
            </button>
        </div>

        <div className="mt-12 text-center">
            <p className="text-xs text-gray-400">
                Mindful App v1.2.0 • Build 2026.01
            </p>
        </div>
      </div>
    </div>
  );
}
