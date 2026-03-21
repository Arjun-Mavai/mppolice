'use client';

import Link from 'next/link';
import { Zap, BookOpen, Lightbulb, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpandableCard } from './shared/ExpandableCard';

interface PYQMenuProps {
  isHindi: boolean;
  currentPage?: 'intelligence' | 'facts' | 'analysis' | 'repeated';
}

const menuItems = [
  {
    id: 'intelligence',
    href: '/syllabus/quiz/pyq/intelligence',
    icon: Zap,
    title: 'Exam DNA',
    titleHi: 'एग्जाम DNA',
    subtitle: 'Topic Distribution & Trends',
    subtitleHi: 'विषय वितरण और रुझान',
    color: 'indigo',
  },
  {
    id: 'facts',
    href: '/syllabus/quiz/pyq/facts',
    icon: Lightbulb,
    title: 'Facts Library',
    titleHi: 'फैक्ट्स लाइब्रेरी',
    subtitle: 'High-yield Exam Facts',
    subtitleHi: 'परीक्षा फैक्ट्स',
    color: 'amber',
  },
  {
    id: 'analysis',
    href: '/syllabus/quiz/pyq/analysis',
    icon: BarChart3,
    title: 'Topic Analysis',
    titleHi: 'विषय विश्लेषण',
    subtitle: 'Deep-dive by Subject',
    subtitleHi: 'विषयवार गहन विश्लेषण',
    color: 'cyan',
  },
  // {
  //   id: 'repeated',
  //   href: '/syllabus/quiz/pyq/repeated',
  //   icon: BookOpen,
  //   title: 'Repeated Questions',
  //   titleHi: 'दोहराए गए प्रश्न',
  //   subtitle: 'Most Asked Patterns',
  //   subtitleHi: 'सबसे ज्यादा पूछे गए पैटर्न',
  //   color: 'rose',
  // },
];

const colorClasses: Record<string, { bg: string; text: string; hover: string; border: string }> = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-300',
    hover: 'hover:bg-indigo-500/20',
    border: 'border-indigo-500/50',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    hover: 'hover:bg-amber-500/20',
    border: 'border-amber-500/50',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-300',
    hover: 'hover:bg-cyan-500/20',
    border: 'border-cyan-500/50',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-300',
    hover: 'hover:bg-rose-500/20',
    border: 'border-rose-500/50',
  },
};

export function PYQMenu({ isHindi, currentPage }: PYQMenuProps) {
  const header = (
    <div className="flex flex-col gap-1">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium tracking-wider text-slate-400 uppercase">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        {isHindi ? 'मेनू' : 'Menu'}
      </div>
      <h3 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {isHindi ? 'PYQ विश्लेषण' : 'PYQ Analysis'}
        <Badge
          variant="outline"
          className="hidden rounded-full border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-400 sm:inline-flex"
        >
          Tools
        </Badge>
      </h3>
    </div>
  );

  return (
    <ExpandableCard
      id="menu"
      header={header}
      gradientFrom="from-blue-500/20"
      gradientTo="to-cyan-500/20"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {menuItems.map((item) => {
            const colors = colorClasses[item.color];
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="outline"
                  className={`group relative h-auto w-full justify-start gap-4 overflow-hidden p-4 ${colors.border} ${colors.bg} ${colors.text} ${colors.hover} hover:text-white`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-${item.color}-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100`}
                  />
                  <div
                    className={`shrink-0 rounded-xl ${colors.bg} p-3 transition-colors group-hover:bg-${item.color}-500/30`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="z-10 flex flex-col items-start">
                    <span className="text-lg font-bold">{isHindi ? item.titleHi : item.title}</span>
                    <span className={`text-xs font-medium ${colors.text}/70`}>
                      {isHindi ? item.subtitleHi : item.subtitle}
                    </span>
                  </div>
                  {isActive && (
                    <div className="z-10 ml-auto">
                      <Badge
                        variant="secondary"
                        className={`border-none ${colors.bg} ${colors.text}`}
                      >
                        Active
                      </Badge>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </ExpandableCard>
  );
}
