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
    <div className="blog-code-block">
      <div className="blog-code-header">
        <span>{langLabel}</span>
        <button
          type="button"
          className="blog-code-copy"
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
      <pre>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
