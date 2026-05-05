"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
};

/**
 * Editorial wrapper for static SVG/PNG diagrams committed under `public/blog/diagrams/`.
 * Matches `chart-glow-frame` styling used by MermaidBlock.
 */
export function DiagramFigure({ title, children }: Props) {
  return (
    <figure className="my-6">
      <div className="chart-glow-frame rounded-2xl p-3">
        <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/40 [&_img]:mx-auto [&_img]:block [&_img]:max-h-[min(65vh,720px)] [&_img]:w-auto [&_img]:max-w-full">
          {children}
        </div>
      </div>
      {title ? (
        <figcaption className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {title}
        </figcaption>
      ) : null}
    </figure>
  );
}
