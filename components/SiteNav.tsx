import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
];

export function SiteNav() {
  return (
    <header className="border-b border-sky-200/70 bg-white/75 backdrop-blur-md dark:border-sky-500/25 dark:bg-zinc-950/75">
      <div
        className="mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-sky-400/80 to-transparent dark:via-sky-500/50"
        aria-hidden
      />
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-lg font-semibold tracking-tight text-transparent dark:from-sky-400 dark:to-indigo-400"
        >
          Trần Quốc Việt
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative transition-colors hover:text-sky-600 dark:hover:text-sky-400"
            >
              {label}
              <span
                className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-200 group-hover:w-full"
                aria-hidden
              />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
