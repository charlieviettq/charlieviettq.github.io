"use client";

import type { ReactNode } from "react";

import { DiagramFigure } from "@/components/blog/DiagramFigure";

function variantFromClass(className: string | undefined): string | undefined {
  if (!className) return undefined;
  const m = /doc-callout--(\w+)/.exec(className);
  return m ? m[1] : undefined;
}

const FALLBACK_TITLES: Record<string, string> = {
  note: "Note",
  warning: "Warning",
  info: "Info",
  tip: "Tip",
};

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
      <details className="doc-expand">
        <summary>
          {title ?? "Details"}
        </summary>
        <div className="doc-expand__body">{children}</div>
      </details>
    );
  }

  const variant = variantFromClass(className) ?? "note";
  const calloutTitle = title ?? FALLBACK_TITLES[variant];

  return (
    <aside
      className={`doc-callout doc-callout--${variant} ${className ?? ""}`.trim()}
    >
      {calloutTitle ? <p className="doc-callout__title">{calloutTitle}</p> : null}
      <div className="doc-callout__body">{children}</div>
    </aside>
  );
}
