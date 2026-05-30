"use client";

import type { ReactNode } from "react";

import { DiagramFigure } from "@/components/blog/DiagramFigure";

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
          <span
            className="mr-1.5 inline-block"
            style={{ color: "var(--accent-blue)" }}
          >
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

  const variant = variantFromClass(className) ?? "note";

  return (
    <aside
      className={`doc-callout doc-callout--${variant} ${className ?? ""}`.trim()}
    >
      {title ? <p className="doc-callout__title">{title}</p> : null}
      <div className="doc-callout__body">{children}</div>
    </aside>
  );
}
