import { AppHeader } from '@/components/layout/AppHeader';

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="pt-0">
        {' '}
        {/* Upgrade page handles its own specific PT for Hero */}
        {children}
      </div>
    </div>
  );
}
