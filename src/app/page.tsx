
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Shield, Zap, Quote, Brain, Smartphone, Heart, Sun, Activity } from "lucide-react";
import { CardDemoAnimation } from "@/components/CardDemoAnimation";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase for Server Component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) return null;

  const { data: user } = await supabase
    .from('card_users')
    .select('id, name, is_pro')
    .eq('id', userId)
    .single();

  return user;
}

// Re-exporting UpgradePage as the main page for now
import UpgradePage from "./upgrade/page";
import { AppNavbar } from "@/components/layout/AppNavbar";

/*
export default async function LandingPage() {
  const user = await getUser();
  const isLoggedIn = !!user;
  const isPro = !!user?.is_pro;

  return (
    <div className="min-h-screen bg-white">
      // ... Old Navigation code ...
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
         // ...
      </nav>

      // ... Hero Section ...
      // ... Feature Sections ...
    </div>
  );
}

const FeatureCard = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
  <div className="group relative p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 blur-2xl rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-700`} />
    
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 shadow-lg`}>
      <Icon size={24} />
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 font-display">{title}</h3>
    <p className="text-gray-500 leading-relaxed">
      {description}
    </p>
  </div>
);
*/

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
