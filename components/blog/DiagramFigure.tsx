"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
};

/**
 * Editorial wrapper for static SVG/PNG diagrams committed under `public/blog/diagrams/`.
 */
export function DiagramFigure({ title, children }: Props) {
  return (
    <figure className="my-0">
      <div className="doc-media-frame">
        {title ? (
          <div className="doc-media-frame__header">{title}</div>
        ) : null}
        <div className="doc-media-frame__body">{children}</div>
      </div>
    </figure>
  );
}
