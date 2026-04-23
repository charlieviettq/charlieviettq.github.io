"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 text-zinc-600 shadow-sm transition hover:border-amber-300/80 hover:bg-white hover:text-zinc-900 dark:border-zinc-700/50 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-amber-500/40 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      aria-label={
        isDark
          ? "Chuyển giao diện sáng / Switch to light mode"
          : "Chuyển giao diện tối / Switch to dark mode"
      }
    >
      {!mounted ? (
        <span className="h-[18px] w-[18px]" aria-hidden />
      ) : isDark ? (
        <SunIcon className="text-amber-500" />
      ) : (
        <MoonIcon className="text-slate-500" />
      )}
    </button>
  );
}
