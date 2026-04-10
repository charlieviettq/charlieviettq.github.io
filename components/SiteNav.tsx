import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
];

export function SiteNav() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Trần Quốc Việt
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-sky-600 dark:hover:text-sky-400"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
