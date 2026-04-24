"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/60 bg-white/90 text-zinc-500 shadow-md backdrop-blur-sm transition hover:border-amber-300/60 hover:text-amber-600 dark:border-zinc-700/40 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-amber-500/40 dark:hover:text-amber-400"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
