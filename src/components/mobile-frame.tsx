import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(117,95,255,0.08),rgba(255,255,255,0.92))] px-0 py-0">
      <div className="mx-auto flex min-h-screen w-full max-w-110 flex-col border-x border-border/70 bg-background shadow-[0_25px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

