import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function GradientCard({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/80 p-6 shadow-md ring-1 ring-zinc-900/[0.05] transition-shadow hover:shadow-lg dark:border-zinc-700/40 dark:from-zinc-900/80 dark:to-zinc-950/60 dark:ring-white/[0.04] ${className}`}
    >
      {children}
    </div>
  );
}
