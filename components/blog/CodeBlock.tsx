"use client";

import { highlight } from "sugar-high";
import { useState, useCallback } from "react";

type Props = {
  lang: string;
  code: string;
};

function CopyIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function CodeBlock({ lang, code }: Props) {
  const [copied, setCopied] = useState(false);

  const html = highlight(code);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [code]);

  return (
    <div
      className="not-prose my-6 overflow-hidden rounded-lg"
      style={{
        border: "1px solid var(--border-warm)",
        borderLeft: "3px solid rgba(245, 78, 0, 0.55)",
      }}
    >
      {/* ── Header bar ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: "var(--surface-500)",
          borderBottom: "1px solid var(--border-warm)",
        }}
      >
        {/* Language badge */}
        <span
          className="font-mono text-[11px] tracking-wide"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {lang || "code"}
        </span>

        {/* Copy button */}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied!" : "Copy code"}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-all duration-150"
          style={{
            backgroundColor: copied ? "rgba(159, 193, 162, 0.15)" : "var(--surface-300)",
            color: copied ? "#9fc9a2" : "var(--foreground-secondary)",
            border: "1px solid var(--border-warm)",
          }}
          onMouseEnter={(e) => {
            if (!copied)
              (e.currentTarget as HTMLElement).style.color = "var(--brand-from)";
          }}
          onMouseLeave={(e) => {
            if (!copied)
              (e.currentTarget as HTMLElement).style.color = "var(--foreground-secondary)";
          }}
        >
          <CopyIcon done={copied} />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* ── Scrollable code ──────────────────────────────────────────────────── */}
      <pre
        className="overflow-x-auto p-4 text-sm leading-relaxed"
        style={{ backgroundColor: "#2a2620", margin: 0, borderRadius: 0 }}
      >
        <code
          /* sugar-high injects <span> with sh-* classes; our CSS vars colour them */
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ color: "#e8e6de" }}
        />
      </pre>
    </div>
  );
}
