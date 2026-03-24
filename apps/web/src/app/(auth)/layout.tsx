export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground text-lg font-bold">
            D
          </div>
          <span className="text-xl font-semibold tracking-tight">Dukaandari</span>
        </div>
        {children}
      </div>
    </div>
  );
}
