"use client";

import { useEffect, useId, useMemo, useState } from "react";

type Props = {
  code: string;
};

let mermaidInited = false;

export function MermaidBlock({ code }: Props) {
  const id = useId().replace(/:/g, "_");
  const [svg, setSvg] = useState<string>("");
  const trimmed = useMemo(() => code.trim(), [code]);

  useEffect(() => {
    if (!trimmed) return;

    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        if (!mermaidInited) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "base",
            themeVariables: {
              fontFamily:
                "var(--font-serif), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
              primaryColor: "rgba(245,158,11,0.18)",
              primaryBorderColor: "rgba(245,158,11,0.45)",
              primaryTextColor: "var(--foreground)",
              lineColor: "rgba(120,113,108,0.6)",
              secondaryColor: "rgba(139,92,246,0.10)",
              tertiaryColor: "rgba(14,165,233,0.08)",
            },
          });
          mermaidInited = true;
        }

        const { svg } = await mermaid.render(`mmd_${id}`, trimmed);
        if (!cancelled) setSvg(svg);
      } catch {
        if (!cancelled) setSvg("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, trimmed]);

  if (!svg) {
    return (
      <div className="chart-glow-frame my-5 rounded-2xl p-3">
        <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 text-sm text-zinc-700 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200">
          Mermaid diagram failed to render.
        </div>
      </div>
    );
  }

  return (
    <div className="chart-glow-frame my-5 rounded-2xl p-3">
      <div
        className="rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/40"
        // mermaid already outputs <svg>; strict securityLevel prevents scripts
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

