"use client";

import { useMemo, useState } from "react";

type Props = {
  html: string;
  code: string;
  language?: string;
};

export function PrettyCodeBlock({ html, code, language }: Props) {
  const [copied, setCopied] = useState(false);
  const langLabel = useMemo(() => {
    if (!language) return "code";
    return language.toLowerCase();
  }, [language]);

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-zinc-200/70 bg-zinc-950/90 shadow-sm dark:border-zinc-700/60">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200/90">
            {langLabel}
          </span>
        </div>
        <button
          type="button"
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-zinc-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 900);
            } catch {
              // ignore
            }
          }}
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto bg-transparent p-4">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

