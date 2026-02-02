'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function SearchInput({ value, onChange, className }: SearchInputProps) {
    return (
        <div className={`relative ${className}`}>
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <Input 
                 value={value}
                 onChange={(e) => onChange(e.target.value)}
                 placeholder="Search articles..." 
                 className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors" 
            />
        </div>
    );
}
