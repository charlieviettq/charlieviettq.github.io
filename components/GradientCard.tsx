import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function GradientCard({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl p-6 transition-shadow hover:shadow-lg ${className}`}
      style={{
        backgroundColor: "var(--surface-400)",
        border: "1px solid var(--border-warm)",
        boxShadow: "var(--shadow-ambient)",
      }}
    >
      {children}
    </div>
  );
}
