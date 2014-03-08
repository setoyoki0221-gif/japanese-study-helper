import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          日
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">日本語テスト</h2>
        <p className="text-sm text-muted-foreground">Japanese Word &amp; Sentence Testing</p>
      </div>
      <Suspense>{children}</Suspense>
    </div>
  );
}
