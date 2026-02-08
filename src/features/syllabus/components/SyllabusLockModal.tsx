import { PremiumMarketing } from "@/components/PremiumMarketing";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SyllabusLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SyllabusLockModal({ open, onOpenChange }: SyllabusLockModalProps) {
  const router = useRouter();


  // modal={false} prevents body scroll lock and scrollbar hiding
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
         <DialogTitle className="sr-only">Unlock Content</DialogTitle>
         {/* We should ideally pass the current plan here to show relevant options */}
         <PremiumMarketing onUnlock={(amount) => router.push(`/payment?amount=${amount}`)} />
      </DialogContent>
    </Dialog>
  );
}
