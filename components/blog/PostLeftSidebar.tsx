"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/bilingual-post";

type Lang = "vi" | "en";

type Props = {
  open: boolean;
  onToggle: () => void;
  toc: TocItem[];
  bilingual: boolean;
  splitView: boolean;
  onSplitToggle: () => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
};

/* ── Small label above control groups ──────────────────────────────────────── */
function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em]"
      style={{ color: "var(--foreground-secondary)" }}
    >
      {children}
    </p>
  );
}

/* ── Pill toggle button ─────────────────────────────────────────────────────── */
function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150"
      style={
        active
          ? {
              backgroundColor: "var(--brand-from)",
              color: "#ffffff",
              boxShadow: "0 1px 4px rgba(245,78,0,0.35)",
            }
          : {
              backgroundColor: "transparent",
              color: "var(--foreground-secondary)",
            }
      }
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.color = "var(--brand-from)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.color =
            "var(--foreground-secondary)";
      }}
    >
      {children}
    </button>
  );
}

export function PostLeftSidebar({
  open,
  onToggle,
  toc,
  bilingual,
  splitView,
  onSplitToggle,
  lang,
  onLangChange,
}: Props) {
  const [activeId, setActiveId] = useState<string>("");

  /* ── IntersectionObserver: track active heading ──────────────────────────── */
  useEffect(() => {
    if (toc.length === 0) return;
    const headingIds = toc.map((t) => t.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 },
    );

    const els = headingIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <aside
      className="hidden lg:flex lg:flex-col shrink-0 transition-[width] duration-200 ease-in-out"
      style={{
        width: open ? "13rem" : "2.5rem",
        borderRight: "1px solid var(--border-warm)",
      }}
    >
      <div
        className="sticky top-20 flex flex-col"
        style={{ maxHeight: "calc(100vh - 5rem)" }}
      >
        {/* ── Toggle button ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Thu gọn sidebar" : "Mở rộng sidebar"}
          className={`flex shrink-0 items-center py-3 transition-colors ${
            open ? "justify-end pr-3" : "justify-center"
          }`}
          style={{ color: "var(--foreground-secondary)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--brand-from)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--foreground-secondary)")
          }
        >
          {open ? (
            <span className="text-[11px] font-medium">← Thu</span>
          ) : (
            <span className="text-base">☰</span>
          )}
        </button>

        {/* ── Sidebar content ────────────────────────────────────────────── */}
        {open && (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
            {/* TOC */}
            {toc.length > 0 && (
              <nav aria-label="Mục lục / Table of contents">
                <ControlLabel>On this page</ControlLabel>
                <ul className="space-y-1.5 text-sm">
                  {toc.map((item, index) => {
                    const isActive = item.id === activeId;
                    return (
                      <li
                        key={`${item.id}-${index}`}
                        className={item.depth === 3 ? "pl-3" : undefined}
                      >
                        <a
                          href={`#${item.id}`}
                          className="flex items-center gap-1.5 underline-offset-2 transition-colors hover:underline"
                          style={{
                            color: isActive
                              ? "var(--brand-from)"
                              : "var(--foreground-secondary)",
                            fontWeight: isActive ? 600 : 400,
                            fontSize: "0.78rem",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--brand-from)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--foreground-secondary)";
                          }}
                        >
                          {isActive && (
                            <span
                              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: "var(--brand-from)" }}
                            />
                          )}
                          {item.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            {/* ── Bilingual controls ─────────────────────────────────────── */}
            {bilingual && (
              <>
                <div
                  className="my-4"
                  style={{ borderTop: "1px solid var(--border-warm)" }}
                />

                <div className="space-y-4">
                  {/* View mode */}
                  <div>
                    <ControlLabel>Chế độ xem</ControlLabel>
                    <div
                      className="inline-flex rounded-full p-0.5"
                      style={{
                        backgroundColor: "var(--surface-300)",
                        border: "1px solid var(--border-warm)",
                      }}
                    >
                      <PillBtn
                        active={!splitView}
                        onClick={() => { if (splitView) onSplitToggle(); }}
                      >
                        Single
                      </PillBtn>
                      <PillBtn
                        active={splitView}
                        onClick={() => { if (!splitView) onSplitToggle(); }}
                      >
                        Split
                      </PillBtn>
                    </div>
                  </div>

                  {/* Language toggle — only in single mode */}
                  {!splitView && (
                    <div>
                      <ControlLabel>Ngôn ngữ</ControlLabel>
                      <div
                        className="inline-flex rounded-full p-0.5"
                        style={{
                          backgroundColor: "var(--surface-300)",
                          border: "1px solid var(--border-warm)",
                        }}
                      >
                        <PillBtn
                          active={lang === "vi"}
                          onClick={() => onLangChange("vi")}
                        >
                          VI 🇻🇳
                        </PillBtn>
                        <PillBtn
                          active={lang === "en"}
                          onClick={() => onLangChange("en")}
                        >
                          EN 🇬🇧
                        </PillBtn>
                      </div>
                    </div>
                  )}

                  {splitView && (
                    <p
                      className="text-[10px] leading-relaxed"
                      style={{ color: "var(--foreground-secondary)" }}
                    >
                      Đang hiện cả
                      <br />
                      🇻🇳 VI · 🇬🇧 EN
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
