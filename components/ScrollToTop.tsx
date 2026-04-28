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
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-150"
      style={{
        backgroundColor: "color-mix(in srgb, var(--surface-300) 90%, transparent)",
        border: "1px solid var(--border-warm-md)",
        color: "var(--foreground-secondary)",
        boxShadow: "var(--shadow-ambient)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--brand-from)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-warm-md)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-300)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--foreground-secondary)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-warm-md)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--surface-300) 90%, transparent)";
      }}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
