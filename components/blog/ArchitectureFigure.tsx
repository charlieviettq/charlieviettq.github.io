"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Chú thích dưới khung sơ đồ (caption / SSOT / cập nhật). */
  footer?: ReactNode;
  className?: string;
};

/**
 * Khung hiển thị sơ đồ kiến trúc: nền surface, bo góc, cuộn ngang gọn trên mobile.
 * Dùng bên trong ChartLightbox (Mermaid / beguru-flow).
 */
export function ArchitectureFigure({ children, footer, className }: Props) {
  return (
    <figure
      className={`architecture-figure not-prose my-0 w-full ${className ?? ""}`}
    >
      <div className="architecture-figure__surface overflow-hidden rounded-[inherit]">
        {children}
      </div>
      {footer ? (
        <figcaption className="architecture-figure__caption mt-2 px-1 text-center text-[0.7rem] leading-relaxed text-zinc-500 dark:text-zinc-400 sm:px-2 sm:text-xs">
          {footer}
        </figcaption>
      ) : null}
    </figure>
  );
}
