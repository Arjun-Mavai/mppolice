"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isMounted) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-24 right-6 z-[99]", // Positioned above the Support Button (bottom-6)
        "p-3 rounded-full shadow-xl shadow-indigo-500/20",
        "bg-white border border-slate-100 text-slate-600",
        "hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-indigo-600/30",
        "transition-all duration-300 group ease-out transform",
        isVisible ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp 
        size={20} 
        strokeWidth={2.5}
        className="group-hover:-translate-y-0.5 transition-transform duration-300" 
      />
    </button>
  );
}
