
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Shield, Zap, Quote, Brain, Smartphone, Heart, Sun, Activity } from "lucide-react";
import { CardDemoAnimation } from "@/components/CardDemoAnimation";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Re-exporting UpgradePage as the main page for now
import UpgradePage from "./upgrade/page";
import { AppNavbar } from "@/components/layout/AppNavbar";

// Force Static Rendering for Home Page
// export const dynamic = 'force-static';
// export const revalidate = 3600; // Auto revalidate every hour

export default function Home() {
  // Static Render for Lightning Speed ⚡️
  // We rely on client-side hydration (useSettingsStore) for auth state
  // This prevents the global loading.tsx from triggering on initial load
  
  return (
    <main>
      <AppNavbar user={null} />
      <UpgradePage />
    </main>
  );
}
