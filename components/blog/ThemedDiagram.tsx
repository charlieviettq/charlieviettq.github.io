"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt?: string;
};

/** Strip script tags from fetched SVG (defense in depth for static assets). */
function sanitizeSvgMarkup(markup: string): string {
  return markup.replace(/<script[\s\S]*?<\/script>/gi, "");
}

/**
 * Inlines blog diagram SVG so fill/stroke can use CSS variables that follow
 * next-themes (.dark on html). Plain <img src="*.svg"> cannot theme internals.
 */
export function ThemedDiagram({ src, alt }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSvg(null);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((raw) => {
        if (cancelled) return;
        setSvg(sanitizeSvgMarkup(raw));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className="mx-auto block max-h-[min(65vh,720px)] w-auto max-w-full"
      />
    );
  }

  if (!svg) {
    return (
      <div
        className="mx-auto flex min-h-[12rem] max-w-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400"
        aria-busy="true"
        aria-label={alt ?? "Loading diagram"}
      >
        Loading diagram…
      </div>
    );
  }

  return (
    <div
      className="themed-diagram mx-auto max-w-full [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-h-[min(65vh,720px)] [&_svg]:w-full [&_svg]:max-w-full"
      role="img"
      aria-label={alt ?? undefined}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
