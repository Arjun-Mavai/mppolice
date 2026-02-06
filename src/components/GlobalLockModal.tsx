"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { SyllabusLockModal } from "@/features/syllabus/components/SyllabusLockModal";

export function GlobalLockModal() {
  const { isLockModalOpen, setLockModalOpen } = useSettingsStore();

  return (
    <SyllabusLockModal 
      open={isLockModalOpen} 
      onOpenChange={setLockModalOpen} 
    />
  );
}
