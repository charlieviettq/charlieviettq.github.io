"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

type Props = { chart: string };

export function MermaidBlock({ chart }: Props) {
  const uid = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = resolvedTheme === "dark";
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "neutral",
          securityLevel: "loose",
        });
        const graphId = `mmd-${uid}`;
        const { svg } = await mermaid.render(graphId, chart.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Mermaid render error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, uid, resolvedTheme]);

  if (error) {
    return (
      <div className="my-6 space-y-2">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40 [&_svg]:mx-auto [&_svg]:max-w-full"
    />
  );
}
