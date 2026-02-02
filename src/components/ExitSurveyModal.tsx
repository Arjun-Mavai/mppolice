"use client"

import * as React from "react"
import { Check, Loader2, MessageCircle, ShieldQuestion } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const EXIT_REASONS = [
  "Price is too high",
  "Don't trust the payment method",
  "Want to pay later",
  "Looking for something else",
  "Just browsing",
  "Other"
]

export function ExitSurveyModal({ 
  open, 
  onOpenChange, 
  onConfirmExit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onConfirmExit: () => void;
}) {
  const [reason, setReason] = React.useState<string>("")
  const [customReason, setCustomReason] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async () => {
    if (!reason) return

    setLoading(true)
    try {
      await fetch('/api/payment/exit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, customReason })
      });
      
      // Save to local storage to avoid showing again
      localStorage.setItem('payment_exit_survey_completed', 'true');
      
      onConfirmExit();
    } catch (error) {
      console.error("Failed to submit survey:", error)
      onConfirmExit(); // Let them go anyway
    } finally {
      setLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
             <ShieldQuestion className="w-6 h-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-center text-xl">Before you go...</DialogTitle>
          <DialogDescription className="text-center">
            Help us improve! Why are you leaving the payment page?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason} className="grid grid-cols-1 gap-3">
            {EXIT_REASONS.map((r) => (
              <Label
                key={r}
                className={`flex items-center justify-between px-4 py-3 border rounded-xl cursor-pointer transition-all ${
                  reason === r 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-600" 
                    : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                    <RadioGroupItem value={r} id={r} className="text-indigo-600" />
                    <span className="flex-1">{r}</span>
                </div>
              </Label>
            ))}
          </RadioGroup>

          {reason === "Other" && (
            <Textarea
              placeholder="Please tell us more..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="resize-none focus-visible:ring-indigo-600"
            />
          )}
        </div>

        <DialogFooter className="flex-col sm:justify-between gap-3 sm:gap-2 sm:flex-row-reverse">
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!reason || loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit & Leave
          </Button>
           <Button
            type="button"
            variant="outline"
            onClick={() => onConfirmExit()}
            className="w-full sm:w-auto text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
          >
            Skip Survey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
