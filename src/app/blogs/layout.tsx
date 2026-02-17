export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 pt-6">
      <div className="">{children}</div>
    </div>
  );
}
