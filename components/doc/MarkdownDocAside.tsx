"use client";

import type { ReactNode } from "react";

import { DiagramFigure } from "@/components/blog/DiagramFigure";

const variantStyles: Record<string, string> = {
  note: "border-sky-400/80 bg-sky-50/90 dark:bg-sky-950/40",
  info: "border-blue-400/80 bg-blue-50/90 dark:bg-blue-950/40",
  tip: "border-emerald-400/80 bg-emerald-50/90 dark:bg-emerald-950/35",
  warning: "border-amber-400/90 bg-amber-50/90 dark:bg-amber-950/35",
  success: "border-green-400/80 bg-green-50/90 dark:bg-green-950/35",
  quote: "border-violet-400/70 bg-violet-50/80 dark:bg-violet-950/30",
  todo: "border-orange-400/80 bg-orange-50/85 dark:bg-orange-950/35",
};

function variantFromClass(className: string | undefined): string | undefined {
  if (!className) return undefined;
  const m = /doc-callout--(\w+)/.exec(className);
  return m ? m[1] : undefined;
}

type Props = {
  className?: string;
  children?: ReactNode;
  "data-doc-title"?: string;
  dataDocTitle?: string;
};

/**
 * Renders remark directives mapped to `<aside>`: `doc-diagram` → DiagramFigure;
 * `doc-expand` → `<details>`; callouts → tinted aside.
 */
export function MarkdownDocAside({
  className,
  children,
  "data-doc-title": dataKebab,
  dataDocTitle,
}: Props) {
  const title = dataDocTitle ?? dataKebab;
  const isDiagram = className?.includes("doc-diagram");

  if (isDiagram) {
    return <DiagramFigure title={title}>{children}</DiagramFigure>;
  }

  const isExpand = className?.includes("doc-expand");

  if (isExpand) {
    return (
      <details className="doc-expand my-4 rounded-lg border border-[var(--border-warm)] bg-surface-100/80 shadow-sm open:pb-3 dark:bg-surface-300/40">
        <summary
          className="cursor-pointer list-none px-4 py-3 font-semibold marker:hidden [&::-webkit-details-marker]:hidden"
          style={{ color: "var(--foreground)" }}
        >
          <span className="mr-1.5 inline-block text-sky-600 dark:text-sky-400">
            ▸
          </span>
          {title ?? "Details"}
        </summary>
        <div
          className="border-t px-4 pt-3"
          style={{ borderColor: "var(--border-warm)" }}
        >
          {children}
        </div>
      </details>
    );
  }

  const v = variantFromClass(className) ?? "note";
  const palette = variantStyles[v] ?? variantStyles.note;

  return (
    <aside
      className={`doc-callout my-4 rounded-r-lg border-l-4 pl-4 pr-3 py-3 text-[0.95em] leading-relaxed shadow-sm ${palette} ${className ?? ""}`}
      style={{ color: "var(--foreground)" }}
    >
      {title ? (
        <p
          className="mb-2 mt-0 font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </p>
      ) : null}
      {children}
    </aside>
  );
}
