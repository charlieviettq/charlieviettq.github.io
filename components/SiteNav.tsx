import Link from "next/link";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
];

export function SiteNav() {
  return (
    <header className="border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-700/30 dark:bg-zinc-950/80">
      <div
        className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-amber-400/70 to-transparent dark:via-amber-500/40"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-amber-600 dark:text-amber-400"
        >
          Trần Quốc Việt
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <nav className="flex gap-4 text-sm font-medium text-zinc-600 sm:gap-6 dark:text-zinc-400">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group relative transition-colors hover:text-amber-600 dark:hover:text-amber-400"
              >
                {label}
                <span
                  className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-200 group-hover:w-full"
                  aria-hidden
                />
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
