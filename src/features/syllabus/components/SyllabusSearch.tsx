"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Sparkles 
} from "lucide-react";
import { syllabusData, Topic } from "@/data/syllabusData";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface SyllabusSearchProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function SyllabusSearch({ open, setOpen }: SyllabusSearchProps) {
  const router = useRouter();
  const { language } = useSettingsStore();

  // Flatten topics for global search
  const allTopics = useMemo(() => {
    const topicsList: { 
        unitKey: string; 
        unitTitle: string; 
        topic: Topic; 
        originalIndex: number 
    }[] = [];

    Object.entries(syllabusData.units).forEach(([unitKey, unit]) => {
      const currentUnitTitle = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title || "");
      const currentTopics = language === 'en' && unit.topics_en ? unit.topics_en : unit.topics;
      
      currentTopics.forEach((topic, index) => {
         topicsList.push({
             unitKey,
             unitTitle: currentUnitTitle,
             topic,
             originalIndex: index
         });
      });
    });
    return topicsList;
  }, [language]);

  const handleUnitClick = (key: string) => {
    router.push(`/syllabus/${key}?lang=${language}`);
  };

  const handleTopicSelect = (unitKey: string) => {
      setOpen(false);
      router.push(`/syllabus/${unitKey}?lang=${language}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={language === 'hi' ? "विषय या इकाई खोजें..." : "Search for topics or units..."} />
        <CommandList className="max-h-[70vh]">
            <CommandEmpty>No results found.</CommandEmpty>
            
            {/* Group 1: Units */}
            <CommandGroup heading={language === 'hi' ? "इकाइयाँ (Units)" : "Units"}>
                {Object.entries(syllabusData.units).map(([key, unit], idx) => {
                    const title = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title || "");
                    return (
                        <CommandItem 
                        key={key} 
                        value={`${title} Unit ${idx + 1}`} // Allow searching by unit title
                        onSelect={() => {
                            handleUnitClick(key);
                            setOpen(false);
                        }}
                        className="cursor-pointer"
                        >
                            <BookOpen className="mr-2 h-4 w-4 text-indigo-500" />
                            <span className="font-medium mr-2">Unit {idx + 1}:</span> {title}
                        </CommandItem>
                    )
                })}
            </CommandGroup>
            
            <CommandSeparator />

            {/* Group 2: Topics */}
            <CommandGroup heading={language === 'hi' ? "विषय (Topics)" : "Topics"}>
                {allTopics.map((item, i) => (
                    <CommandItem 
                    key={`${item.unitKey}-${i}`}
                    value={`${item.topic.id} ${item.topic.front} ${item.topic.mnemonic} ${item.topic.pro_tip || ''} ${item.topic.back}`} // Comprehensive search
                    onSelect={() => handleTopicSelect(item.unitKey)}
                    className="cursor-pointer"
                    >
                        <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                        <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{item.topic.front}</span>
                        <span className="text-xs text-slate-500">{language === 'hi' ? 'इकाई' : 'Unit'}: {item.unitTitle}</span>
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>

        </CommandList>
    </CommandDialog>
  );
}
