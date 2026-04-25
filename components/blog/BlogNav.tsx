"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavPost = { slug: string; title: string; navTitle?: string };
type NavGroup = { cat: string; label: string; posts: NavPost[] };

const COLLAPSED_WIDTH = 40;
const DEFAULT_WIDTH = 220;
const MIN_WIDTH = 120;
const MAX_WIDTH = 400;
const OPEN_THRESHOLD = 80;
const LS_KEY = "blog-nav-width";

export function BlogNav({ grouped }: { grouped: NavGroup[] }) {
  const pathname = usePathname();
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  // Ref for last non-collapsed width (for toggle snap-back)
  const lastOpenWidth = useRef(DEFAULT_WIDTH);

  // Drag state — stored in refs to avoid re-renders during drag
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const open = width > OPEN_THRESHOLD;

  // ── Restore persisted width on mount ────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const n = Number(saved);
        if (Number.isFinite(n) && n >= COLLAPSED_WIDTH) {
          setWidth(n);
          if (n > OPEN_THRESHOLD) lastOpenWidth.current = n;
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── Persist width whenever it changes (skip collapsed) ──────────────────
  useEffect(() => {
    if (width > OPEN_THRESHOLD) {
      lastOpenWidth.current = width;
      try {
        localStorage.setItem(LS_KEY, String(width));
      } catch {
        /* ignore */
      }
    }
  }, [width]);

  // ── Drag handle handlers ─────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startW.current = width <= OPEN_THRESHOLD ? lastOpenWidth.current : width;
    // Pointer capture: keeps events firing even when mouse leaves the element
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    const next = startW.current + delta;
    if (next < OPEN_THRESHOLD) {
      setWidth(COLLAPSED_WIDTH);
    } else {
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)));
    }
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  // ── Toggle: snap between collapsed ↔ last open width ───────────────────
  const handleToggle = () => {
    if (open) {
      setWidth(COLLAPSED_WIDTH);
    } else {
      setWidth(lastOpenWidth.current);
    }
  };

  return (
    <aside
      className="relative hidden lg:flex lg:flex-col shrink-0"
      style={{
        width: `${width}px`,
        // Disable CSS transition while dragging to avoid lag
        transition: isDragging.current ? "none" : "width 200ms ease-in-out",
        borderRight: "1px solid var(--border-warm)",
      }}
    >
      {/* ── Drag handle — right edge ─────────────────────────────────────── */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
        title="Kéo để thay đổi / Double-click để reset"
        className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize select-none opacity-0 transition-opacity duration-150 hover:opacity-100"
        style={{ backgroundColor: "var(--brand-from)" }}
      />

      {/* ── Scrollable sidebar content ───────────────────────────────────── */}
      <div
        className="sticky top-16 flex flex-col overflow-hidden"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        {/* ── Collapse / expand toggle ───────────────────────────────────── */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={open ? "Thu gọn nav" : "Mở rộng nav"}
          className={`flex shrink-0 items-center py-3 transition-colors ${
            open ? "justify-end pr-4" : "justify-center"
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

        {/* ── Navigation content ─────────────────────────────────────────── */}
        {open && (
          <nav
            className="min-w-0 flex-1 space-y-6 overflow-y-auto px-3 pb-8"
            aria-label="Blog navigation"
          >
            {grouped.map(({ cat, label, posts }) => (
              <div key={cat}>
                {/* Category header */}
                <div className="mb-2.5 flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-0.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: "var(--brand-from)",
                      opacity: 0.7,
                    }}
                  />
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--foreground)" }}
                  >
                    {label}
                  </p>
                </div>

                {/* Post list with tree connector */}
                <ul
                  className="space-y-0.5 border-l pl-3"
                  style={{ borderColor: "var(--border-warm-md)" }}
                >
                  {posts.map((p) => {
                    const displayText = p.navTitle ?? p.title;
                    const isActive =
                      pathname === `/blog/${p.slug}/` ||
                      pathname === `/blog/${p.slug}`;
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/blog/${p.slug}/`}
                          title={p.title}
                          className="flex items-start gap-1.5 rounded py-0.5 transition-colors"
                          style={{
                            color: isActive
                              ? "var(--brand-from)"
                              : "color-mix(in srgb, var(--foreground) 72%, transparent)",
                            fontWeight: isActive ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--brand-from)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.color =
                                "color-mix(in srgb, var(--foreground) 72%, transparent)";
                          }}
                        >
                          {isActive && (
                            <span
                              className="mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: "var(--brand-from)" }}
                            />
                          )}
                          <span className="line-clamp-2 text-[0.82rem] leading-snug">
                            {displayText}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
