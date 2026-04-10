import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function GradientCard({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-500/[0.09] via-white/85 to-indigo-500/[0.11] p-6 shadow-sm dark:border-sky-500/25 dark:from-sky-500/[0.12] dark:via-zinc-950/65 dark:to-indigo-500/[0.14] ${className}`}
    >
      {children}
    </div>
  );
}
