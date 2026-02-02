
import { AppHeader } from "@/components/layout/AppHeader";

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <AppHeader />
      <div className="">
        {children}
      </div>
    </div>
  );
}
