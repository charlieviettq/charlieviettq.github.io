"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useMemo, useState } from "react";

type Props = {
  code: string;
};

export function MermaidBlock({ code }: Props) {
  const id = useId().replace(/:/g, "_");
  const [svg, setSvg] = useState<string>("");
  const { resolvedTheme } = useTheme();
  const trimmed = useMemo(() => code.trim(), [code]);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!trimmed || !resolvedTheme) return;

    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark ? "dark" : "base",
          themeVariables: isDark
            ? {
                fontFamily: "var(--font-blog), ui-sans-serif, system-ui, sans-serif",
                primaryTextColor: "#e8e6de",
                lineColor: "rgba(168,162,158,0.55)",
              }
            : {
                fontFamily: "var(--font-blog), ui-sans-serif, system-ui, sans-serif",
                primaryColor: "rgba(37,99,235,0.12)",
                primaryBorderColor: "rgba(37,99,235,0.35)",
                primaryTextColor: "var(--diagram-svg-text)",
                lineColor: "rgba(120,113,108,0.6)",
                secondaryColor: "rgba(37,99,235,0.08)",
                tertiaryColor: "rgba(14,165,233,0.08)",
              },
        });

        const { svg } = await mermaid.render(`mmd_${id}_${isDark ? "d" : "l"}`, trimmed);
        if (!cancelled) setSvg(svg);
      } catch {
        if (!cancelled) setSvg("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, trimmed, isDark, resolvedTheme]);

  if (!svg) {
    return (
      <div className="doc-media-frame">
        <div
          className="doc-media-frame__body text-sm"
          style={{ color: "var(--foreground-secondary)" }}
        >
          Mermaid diagram failed to render.
        </div>
      </div>
    );
  }

  return (
    <div className="doc-media-frame">
      <div
        className="doc-media-frame__body overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
