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
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 shadow-2xl bg-white max-h-[90vh] overflow-y-auto rounded-[2.5rem]">
         <DialogTitle className="sr-only">MPPSC 2026 Test Series</DialogTitle>
         <PremiumMarketing onUnlock={() => router.push('/pricing')} />
      </DialogContent>
    </Dialog>
  );
}
