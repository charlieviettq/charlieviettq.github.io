"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <header className="sticky top-0 z-40 border-b border-[var(--border-warm)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="group min-w-0">
          <span className="block truncate text-sm font-bold tracking-[-0.01em] text-[var(--foreground)]">
            Tran Quoc Viet
          </span>
          <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-tertiary)] sm:block">
            Data · ML · Credit
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav
            className="rounded-full border border-[var(--border-warm)] bg-[color-mix(in_srgb,var(--surface-100)_72%,transparent)] p-1 shadow-sm"
            aria-label="Main navigation"
          >
            <div className="flex items-center gap-1">
              {links.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
                    style={{
                      background: active ? "var(--foreground)" : "transparent",
                      color: active ? "var(--background)" : "var(--foreground-secondary)",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
