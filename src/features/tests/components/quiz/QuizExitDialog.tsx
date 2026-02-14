'use client';

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
            <AlertCircle className="h-5 w-5" /> {t.quitConfirm}
          </DialogTitle>
          <DialogDescription className="pt-2 text-slate-600">{t.quitDesc}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmExit}
            className="flex-1 bg-red-600 hover:bg-red-700 sm:flex-none"
          >
            {t.yesExit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
