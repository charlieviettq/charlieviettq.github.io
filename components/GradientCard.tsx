import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function GradientCard({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/60 bg-white/95 p-6 shadow-sm ring-1 ring-zinc-900/[0.04] transition-shadow hover:shadow-md dark:border-zinc-700/40 dark:bg-zinc-900/60 dark:ring-white/[0.04] ${className}`}
    >
      {children}
    </div>
  );
}
