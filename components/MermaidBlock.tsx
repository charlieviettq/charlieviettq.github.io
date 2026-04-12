"use client";

import { ChartLightbox } from "@/components/blog/ChartLightbox";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

type Props = { chart: string; lang?: "vi" | "en" };

/** Palette hex đồng bộ với BeGuru flow (gradient frame ngoài do ChartLightbox). */
function getMermaidThemeVars(isDark: boolean): Record<string, string> {
  if (isDark) {
    return {
      primaryColor: "#4c1d95",
      primaryTextColor: "#f5f3ff",
      primaryBorderColor: "#a78bfa",
      secondaryColor: "#312e81",
      tertiaryColor: "#1e1b4b",
      lineColor: "#94a3b8",
      textColor: "#e2e8f0",
      mainBkg: "#4338ca",
      nodeBorder: "#818cf8",
      clusterBkg: "rgba(67,56,202,0.35)",
      titleColor: "#f1f5f9",
      edgeLabelBackground: "#1e293b",
    };
  }
  return {
    primaryColor: "#ede9fe",
    primaryTextColor: "#4c1d95",
    primaryBorderColor: "#8b5cf6",
    secondaryColor: "#e0e7ff",
    tertiaryColor: "#f8fafc",
    lineColor: "#64748b",
    textColor: "#1e293b",
    mainBkg: "#c4b5fd",
    nodeBorder: "#7c3aed",
    clusterBkg: "rgba(196,181,253,0.45)",
    titleColor: "#0f172a",
    edgeLabelBackground: "#ffffff",
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
          theme: isDark ? "dark" : "neutral",
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
