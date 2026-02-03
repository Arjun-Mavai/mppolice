'use client';

import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppFooter } from "@/components/layout/AppFooter";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useSettingsStore();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <AppNavbar user={user} />
            <main className="flex-1 pt-20">
                {children}
            </main>
            {/* <AppFooter /> */}
        </div>
    );
}
