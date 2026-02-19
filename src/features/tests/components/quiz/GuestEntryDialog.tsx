'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface GuestEntryDialogProps {
  open: boolean;
  guestName: string;
  guestEmail: string;
  guestMobile: string;
  isSubmitting: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onSubmit: () => void;
  onExit: () => void;
}

export function GuestEntryDialog({
  open,
  guestName,
  guestEmail,
  guestMobile,
  isSubmitting,
  onNameChange,
  onEmailChange,
  onMobileChange,
  onSubmit,
  onExit,
}: GuestEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-2xl font-black text-slate-900">
            Welcome to MPPSC 2026! 🚀
          </DialogTitle>
          <button
            onClick={onExit}
            className="absolute -top-3 -right-3 z-10 rounded-full bg-slate-100 p-2.5 text-slate-500 shadow-sm transition-colors hover:bg-slate-200 hover:text-slate-700 active:scale-90"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <DialogDescription className="px-4 pt-3 text-center text-slate-600">
            <span className="block leading-relaxed text-balance">
              We value your time and just need your name to get started!
            </span>
            <span className="mt-2 block text-xs font-medium text-balance text-slate-400">
              Email and mobile are optional but help us serve you better.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-bold text-slate-900">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => onNameChange(e.target.value)}
              className="h-12 border-slate-300 bg-white text-lg font-medium shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                Email
              </label>
              <Input
                type="email"
                placeholder="Optional - skip"
                value={guestEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="h-10 border-slate-200 bg-slate-50 text-sm text-slate-600 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                Mobile
              </label>
              <Input
                type="tel"
                placeholder="Optional - skip"
                value={guestMobile}
                onChange={(e) => onMobileChange(e.target.value)}
                className="h-10 border-slate-200 bg-slate-50 text-sm text-slate-600 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onSubmit}
            disabled={!guestName.trim() || isSubmitting}
            className="h-12 w-full rounded-xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...
              </>
            ) : (
              'Start Test 🚀'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
