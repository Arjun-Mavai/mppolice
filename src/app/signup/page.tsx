"use client";

import SignupPage from "@/components/signup";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { user } = useSettingsStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    console.log("user and its role", user, user?.role);
    // Check if user is logged in AND is an admin
    if (user && user.role === 'admin') {
      setIsAuthorized(true);
    } else {
      // Not an admin or not logged in -> Redirect to login
      router.push("/login"); // or "/"
    }
    setChecking(false);
  }, [user, router]);

  if (checking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Should have redirected by now
  }

  // Only render for admins
  return <SignupPage />;
}
