"use client";

import {
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Props = {
  /** Tiêu đề phía trên chart (inline + modal) */
  title?: string;
  /** Gợi ý nhỏ dưới tiêu đề */
  hint?: ReactNode;
  /** Nội dung chart inline */
  children: ReactNode;
  /** Chart trong modal toàn màn (thường là instance thứ hai: React Flow / Mermaid) */
  fullscreenSlot: ReactNode;
  /** Nhãn nút mở rộng (a11y) */
  expandLabelVi?: string;
  expandLabelEn?: string;
  lang?: "vi" | "en";
};

export function ChartLightbox({
  title,
  hint,
  children,
  fullscreenSlot,
  expandLabelVi = "Mở rộng sơ đồ toàn màn hình",
  expandLabelEn = "Expand diagram fullscreen",
  lang = "vi",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const expandLabel = lang === "vi" ? expandLabelVi : expandLabelEn;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const modal =
    mounted && open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
              aria-label={lang === "vi" ? "Đóng" : "Close"}
              onClick={() => setOpen(false)}
            />
            <div className="chart-glow-frame relative z-10 flex max-h-[96vh] w-full max-w-[min(100vw-1.5rem,1200px)] flex-col overflow-hidden rounded-2xl p-[1px] shadow-2xl">
              <div className="relative flex max-h-[96vh] min-h-0 flex-col overflow-hidden rounded-[calc(1rem-1px)] bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/95 dark:to-zinc-950">
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200/90 px-4 py-3 dark:border-zinc-700/90">
                  <div className="min-w-0 flex-1 pt-0.5">
                    {title ? (
                      <p
                        id={titleId}
                        className="text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100 sm:text-left"
                      >
                        {title}
                      </p>
                    ) : (
                      <span className="sr-only" id={titleId}>
                        Chart
                      </span>
                    )}
                    {hint ? (
                      <div className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400 sm:text-left">
                        {hint}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-200/90 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    aria-label={lang === "vi" ? "Đóng" : "Close"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">{fullscreenSlot}</div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="chart-glow-frame not-prose relative my-8 w-full rounded-2xl p-[1px]">
        <button
          type="button"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/90 bg-white/95 text-zinc-600 shadow-md backdrop-blur-sm transition-colors hover:bg-sky-50 hover:text-sky-700 dark:border-zinc-600 dark:bg-zinc-900/95 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-sky-300"
          onClick={() => setOpen(true)}
          aria-label={expandLabel}
          aria-expanded={open}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
        <div className="overflow-hidden rounded-[calc(1rem-1px)] bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/90 dark:to-zinc-950">
          {title ? (
            <p className="px-4 pt-4 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {title}
            </p>
          ) : null}
          {hint ? (
            <div className="px-4 pb-2 pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {hint}
            </div>
          ) : null}
          <div className="relative">{children}</div>
        </div>
      </div>
      {modal}
    </>
  );
}
