"use client";

import React from 'react';
import Link from 'next/link';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Target, Users, BookOpen, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AppNavbar user={null} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-display text-slate-900 mb-6 leading-tight">
            Revolutionizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">MPPSC Prep</span> with Science.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We don't just give you Tests. We give you the <span className="font-semibold text-slate-800">memory hooks</span> to retain them forever. Mindful MPPSC is MP's first bilingual mnemonic-based learning platform.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {[
            { label: 'Active Aspirants', value: '5,000+' },
            { label: 'Mnemonics Created', value: '1,200+' },
            { label: 'Questions Practiced', value: '1M+' },
            { label: 'Success Rate', value: 'High' },
          ].map((stat) => (
            <div key={stat.label} className="p-6 md:p-8 text-center bg-white hover:bg-slate-50 transition-colors">
              <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Story / Problem-Solution */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-slate mx-auto">
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-6">Why we started Mindful MPPSC?</h2>
            <p className="text-slate-600 mb-6">
              The MPPSC syllabus is vast. History, Geography, Polity, MP GK, Ethics — the list goes on. Most aspirants spend 80% of their time <strong>reading</strong> and only 20% <strong>retaining</strong>.
            </p>
            <p className="text-slate-600 mb-6">
              We realized that the traditional way of rote memorization wasn't working. Students were forgetting key facts in the exam hall due to stress.
            </p>
            <p className="text-slate-600 mb-8">
              <strong>Enter Mnemonics.</strong> By linking dry facts to vivid stories and mental images, we turn information into long-term memory. Our platform is built on this core scientific principle.
            </p>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm not-prose mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                The Mindful Advantage
              </h3>
              <ul className="space-y-3">
                {[
                  'Bilingual Content (English + Hindi) for maximum reach',
                  'Entire MPPSC syllabus Analysis for each topic',
                  'Smart Analytics to identify your weak spots instantly',
                  'Curated PYQs (Previous Year Questions) from last 5+ years'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600 text-sm md:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to ace MPPSC 2026?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join thousands of serious aspirants who are studying smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 h-12 rounded-xl w-full sm:w-auto">
                View Plans
              </Button>
            </Link>
            <Link href="/syllabus/quiz/pyq">
              <Button size="lg"  className="border-slate-700 text-white hover:bg-slate-800 font-bold px-8 h-12 rounded-xl w-full sm:w-auto">
                Try Free Quiz
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
