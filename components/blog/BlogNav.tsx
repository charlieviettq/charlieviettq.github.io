"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavPost = { slug: string; title: string };
type NavGroup = { cat: string; label: string; posts: NavPost[] };

export function BlogNav({ grouped }: { grouped: NavGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <aside
      className="hidden lg:flex lg:flex-col shrink-0 transition-[width] duration-200 ease-in-out"
      style={{
        width: open ? "220px" : "2.5rem",
        borderRight: "1px solid var(--border-warm)",
      }}
    >
      <div
        className="sticky top-16 flex flex-col overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        {/* ── Collapse / expand toggle ─────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Thu gọn nav" : "Mở rộng nav"}
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

        {/* ── Navigation content ───────────────────────────────────────────── */}
        {open && (
          <nav className="space-y-5 px-3 pb-8" aria-label="Blog navigation">
            {grouped.map(({ cat, label, posts }) => (
              <div key={cat}>
                {/* Category label */}
                <p
                  className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  {label}
                </p>

                {/* Posts under this category */}
                <ul className="space-y-1">
                  {posts.map((p) => {
                    const isActive =
                      pathname === `/blog/${p.slug}/` ||
                      pathname === `/blog/${p.slug}`;
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/blog/${p.slug}/`}
                          className="flex items-center gap-1.5 rounded py-0.5 text-[0.78rem] leading-snug transition-colors"
                          style={{
                            color: isActive
                              ? "var(--brand-from)"
                              : "var(--foreground-secondary)",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {isActive && (
                            <span
                              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: "var(--brand-from)" }}
                            />
                          )}
                          {p.title}
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
