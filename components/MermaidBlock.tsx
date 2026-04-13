"use client";

import { ChartLightbox } from "@/components/blog/ChartLightbox";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

type Props = { chart: string; lang?: "vi" | "en" };

/**
 * Mermaid `theme: base` — palette editorial, khớp brand sky/indigo + surface blog.
 */
function getMermaidThemeVars(isDark: boolean): Record<string, string> {
  if (isDark) {
    return {
      primaryColor: "#1e293b",
      primaryTextColor: "#f1f5f9",
      primaryBorderColor: "#64748b",
      secondaryColor: "#334155",
      tertiaryColor: "#0f172a",
      lineColor: "#64748b",
      textColor: "#e2e8f0",
      mainBkg: "#334155",
      nodeBorder: "#94a3b8",
      clusterBkg: "rgba(51,65,85,0.55)",
      titleColor: "#f8fafc",
      edgeLabelBackground: "#0f172a",
      actorBkg: "#1e3a5f",
      actorBorder: "#38bdf8",
      actorTextColor: "#f0f9ff",
      signalColor: "#7dd3fc",
    };
  }
  return {
    primaryColor: "#f8fafc",
    primaryTextColor: "#0f172a",
    primaryBorderColor: "#cbd5e1",
    secondaryColor: "#f1f5f9",
    tertiaryColor: "#ffffff",
    lineColor: "#94a3b8",
    textColor: "#334155",
    mainBkg: "#e2e8f0",
    nodeBorder: "#94a3b8",
    clusterBkg: "rgba(148,163,184,0.2)",
    titleColor: "#0f172a",
    edgeLabelBackground: "#ffffff",
    actorBkg: "#e0f2fe",
    actorBorder: "#0ea5e9",
    actorTextColor: "#0c4a6e",
    signalColor: "#0284c7",
  };
}

function MermaidCanvas({ chart }: { chart: string }) {
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
          theme: "base",
          securityLevel: "loose",
          themeVariables: getMermaidThemeVars(isDark),
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
      <div className="space-y-2">
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
      className="overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
    />
  );
}

export function MermaidBlock({ chart, lang = "vi" }: Props) {
  if (!chart.trim()) {
    return null;
  }

  return (
    <ChartLightbox
      lang={lang}
      fullscreenSlot={
        <div className="min-h-[75vh] w-full p-4 sm:p-6">
          <MermaidCanvas chart={chart} />
        </div>
      }
    >
      <div className="p-4">
        <MermaidCanvas chart={chart} />
      </div>
    </ChartLightbox>
  );
}
