"use client"

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
      <DialogContent showCloseButton={false} className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
            Welcome to MPPSC 2026! 🚀
          </DialogTitle>
          <button 
            onClick={onExit}
            className="absolute -top-2 -right-2 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <DialogDescription className="text-slate-600 text-center pt-2">
            We value your time and just need your name to get started!
            <br />
            <span className="text-sm text-slate-500 mt-1 inline-block">
              Email and mobile are optional but help us serve you better.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. MPPSC Aspirant"
              value={guestName}
              onChange={(e) => onNameChange(e.target.value)}
              className="h-11 border-slate-200 focus:border-electric-blue focus:ring-electric-blue"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Email <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <Input
              type="email"
              placeholder="email"
              value={guestEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              className="h-11 border-slate-200 focus:border-electric-blue focus:ring-electric-blue"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Mobile <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <Input
              type="tel"
              placeholder="phone number"
              value={guestMobile}
              onChange={(e) => onMobileChange(e.target.value)}
              className="h-11 border-slate-200 focus:border-electric-blue focus:ring-electric-blue"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onSubmit}
            disabled={!guestName.trim() || isSubmitting}
            className="w-full bg-[#00F0FF] hover:bg-[#00D1E0] text-black font-bold h-12 rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "Starting..." : "Start Test →"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
