"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
];

export function SiteNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
        borderBottom: "1px solid var(--border-warm)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        {/* Logotype */}
        <Link
          href="/"
          className="font-heading text-base font-bold tracking-tight transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}
        >
          Trần Quốc Việt
        </Link>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* Nav links */}
          <nav className="flex gap-4 text-sm font-medium sm:gap-6" aria-label="Main navigation">
            {links.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="group relative transition-colors"
                  style={{
                    color: active ? "var(--brand-from)" : "var(--foreground-secondary)",
                    fontWeight: active ? 600 : 400,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "var(--brand-from)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = active
                      ? "var(--brand-from)"
                      : "var(--foreground-secondary)")
                  }
                >
                  {label}
                  {/* Active underbar */}
                  <span
                    className="pointer-events-none absolute -bottom-1 left-0 right-0 h-px rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: "var(--brand-from)",
                      opacity: active ? 1 : 0,
                      width: active ? "100%" : "0%",
                    }}
                    aria-hidden
                  />
                  {/* Hover underbar */}
                  {!active && (
                    <span
                      className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 rounded-full transition-all duration-200 group-hover:w-full"
                      style={{ backgroundColor: "var(--brand-from)", opacity: 0.5 }}
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
