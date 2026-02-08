"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Star, Quote, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// Real Aspirant Data (Hinglish + MP Locations)
const TESTIMONIALS = [
  {
    name: "Arjun Gurjar",
    role: "Aspirant",
    location: "Gwalior",
    comment: "Blogs ki quality next level h mindful prep par.",
    image: "/testimonials/arjun.png",
    stars: 5,
  },
  {
    name: "Shivam Gurjar",
    role: "Aspirant",
    location: "Ujjain",
    comment: "Recent history and explanation of answers is next level h.",
    image: "/testimonials/shivam.png",
    stars: 5,
  },
  {
    name: "Rahul Tiwari",
    role: "Aspirant",
    location: "Satna",
    comment: "Bhai app ka analysis part bahut sahi hai. Har question ka timing dikhta hai, jo help karta hai speed badhane me.",
    image: "/testimonials/rahul.png",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    role: "Aspirant",
    location: "Rewa",
    comment: "बस एक ही शब्द में - बेहतरीन!",
    image: "/testimonials/priya.png",
    stars: 5,
  },
  {
    name: "Amit Patel",
    role: "Aspirant",
    location: "Bhopal",
    comment: "Syllabus ke har topic ka analysis acha laga. Pata chalta hai ki kaunsa topic strong hai aur kisme mehnat karni hai.",
    image: "/testimonials/amit.png",
    stars: 5,
  },
  {
    name: "Sneha Gupta",
    role: "Aspirant",
    location: "Gwalior",
    comment: "English medium walo ke liye hindi terms samajhna mushkil hota tha, par is app ne wo problem solve kar di.",
    image: "/testimonials/sneha.png",
    stars: 5,
  },
  {
    name: "Vikram Singh",
    role: "Aspirant",
    location: "Shivpuri",
    comment: "Test series ka level actual exam jaisa hai. Analysis dekh kar weak areas clearly pata chal jate hain.",
    image: "/testimonials/vikram.png",
    stars: 5,
  },
  {
    name: "Anjali Verma",
    role: "Aspirant",
    location: "Ashoknagar",
    comment: "Mnemonics wale flashcards bahut creative hain.",
    image: "/testimonials/anjali.png",
    stars: 5,
  },
  {
    name: "Sandeep Yadav",
    role: "Aspirant",
    location: "Morena",
    comment: "Daily quizzes se continuity bani rahti hai. Question timings feature ne meri speed improve kar di.",
    image: "/testimonials/sandeep.png",
    stars: 5,
  },
  {
    name: "Divya Jain",
    role: "Aspirant",
    location: "Bhind",
    comment: "Syllabus ko cards ke form me and flashcards me convert karna bahut creative hai.",
    image: "/testimonials/divya.png",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100 overflow-hidden">
      <div className="container px-4 mx-auto mb-16 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <Star className="w-3.5 h-3.5 fill-indigo-700" />
            Student Success Stories
         </div>
        <h2 className="text-3xl md:text-5xl font-black font-display text-slate-900 mb-6 tracking-tight leading-tight">
          Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Serious Aspirants</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          Join students from every corner of Madhya Pradesh who are mastering the syllabus smarter, not harder.
        </p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative flex w-full overflow-hidden mask-linear-fade">
        {/* Gradient Masks */}
        <div className="absolute top-0 left-0 w-24 md:w-48 h-full z-20 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 md:w-48 h-full z-20 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex select-none">
            <motion.div 
                className="flex items-stretch gap-6 pl-6"
                animate={{
                    x: ["0%", "-50%"]
                }}
                transition={{
                    duration: 80, // Very slow smooth speed for readability
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((user, idx) => (
                <div
                key={`${user.name}-${idx}`}
                className="w-[300px] md:w-[380px] shrink-0 p-6 md:p-8 rounded-3xl bg-white border border-slate-200/60 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
                >
                <div>
                    <Quote className="w-8 h-8 text-indigo-100 mb-6 group-hover:text-indigo-200 transition-colors" />
                    <p className="text-slate-700 font-medium leading-relaxed mb-6 text-base md:text-lg">
                    "{user.comment}"
                    </p>
                </div>
                
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 shrink-0">
                        <Image
                        height={48}
                        width={48}
                         src={user?.image || "/assets/images/user.png"} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 leading-tight truncate">{user.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            <span className="font-medium truncate">{user.location} • {user.role}</span>
                        </div>
                    </div>
                    <div className="ml-auto flex gap-0.5 shrink-0 bg-amber-50 px-2 py-1 rounded-full border border-amber-100/50">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 ml-0.5">5.0</span>
                    </div>
                </div>
                </div>
            ))}
            </motion.div>
        </div>
      </div>
    </section>
  );
}
