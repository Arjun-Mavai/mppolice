import { PremiumMarketing } from "@/components/PremiumMarketing";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

interface SyllabusLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SyllabusLockModal({ open, onOpenChange }: SyllabusLockModalProps) {
  const router = useRouter();
  
  const handleUnlock = (amount: number) => {
    // Redirect to the existing payment page with amount query param
    router.push(`/payment?amount=${amount}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
         <DialogTitle></DialogTitle>
         <PremiumMarketing onUnlock={handleUnlock} />
      </DialogContent>
    </Dialog>
  );
}
