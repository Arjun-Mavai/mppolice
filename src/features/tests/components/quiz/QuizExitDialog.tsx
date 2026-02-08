"use client"

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QuizExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirmExit: () => void;
  translations: {
    quitConfirm: string;
    quitDesc: string;
    cancel: string;
    yesExit: string;
  };
}

export function QuizExitDialog({
  open,
  onOpenChange,
  onCancel,
  onConfirmExit,
  translations: t,
}: QuizExitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" /> {t.quitConfirm}
          </DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            {t.quitDesc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmExit}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
          >
            {t.yesExit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
