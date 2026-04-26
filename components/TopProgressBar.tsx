"use client";

/**
 * TopProgressBar — NProgress-style top loading bar.
 *
 * Auto-tracks:
 *  • Client-side route changes via History API patching (pushState / replaceState / popstate)
 *  • window.fetch calls
 *
 * Uses var(--brand-from) for color so it follows the site's gold palette.
 * Zero external dependencies.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/* ─────────────────────────────────────────────────────────────────────────────
   Store (module-level singleton)
───────────────────────────────────────────────────────────────────────────── */

type Listener = () => void;

let fetchCount = 0;
let routeActive = false;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

function setFetchCount(n: number) {
  fetchCount = Math.max(0, n);
  notify();
}

function setRouteActive(v: boolean) {
  routeActive = v;
  notify();
}

export const progress = {
  start() {
    setFetchCount(fetchCount + 1);
  },
  done() {
    setFetchCount(fetchCount - 1);
  },
  reset() {
    fetchCount = 0;
    routeActive = false;
    notify();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getActive(): boolean {
    return fetchCount > 0 || routeActive;
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Route change tracking
───────────────────────────────────────────────────────────────────────────── */

function useRouteChangeProgress(enabled: boolean) {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);

  // Patch history API
  useEffect(() => {
    if (!enabled) return;

    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);

    function patchedPush(
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      const next = url ? new URL(String(url), window.location.href).pathname : window.location.pathname;
      if (next !== lastPathname.current) {
        setRouteActive(true);
      }
      origPush(data, unused, url);
    }

    function patchedReplace(
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      const next = url ? new URL(String(url), window.location.href).pathname : window.location.pathname;
      if (next !== lastPathname.current) {
        setRouteActive(true);
      }
      origReplace(data, unused, url);
    }

    function onPopState() {
      const next = window.location.pathname;
      if (next !== lastPathname.current) {
        setRouteActive(true);
      }
    }

    window.history.pushState = patchedPush;
    window.history.replaceState = patchedReplace;
    window.addEventListener("popstate", onPopState);

    return () => {
      if (window.history.pushState === patchedPush) window.history.pushState = origPush;
      if (window.history.replaceState === patchedReplace) window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onPopState);
    };
  }, [enabled]);

  // Clear routeActive when pathname settles
  useEffect(() => {
    if (pathname !== lastPathname.current) {
      lastPathname.current = pathname;
    }
    setRouteActive(false);
  }, [pathname]);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fetch tracking
───────────────────────────────────────────────────────────────────────────── */

function useFetchProgress(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const origFetch = window.fetch.bind(window);

    async function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> {
      progress.start();
      try {
        return await origFetch(input, init);
      } finally {
        progress.done();
      }
    }

    window.fetch = patchedFetch;

    return () => {
      if (window.fetch === patchedFetch) window.fetch = origFetch;
    };
  }, [enabled]);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Bar animation
───────────────────────────────────────────────────────────────────────────── */

function useBarAnimation(active: boolean) {
  const valueRef = useRef(0);
  const visibleRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const clearAll = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null; }
  };

  const apply = () => {
    if (barRef.current) barRef.current.style.width = `${valueRef.current}%`;
    if (wrapRef.current) wrapRef.current.style.opacity = visibleRef.current ? "1" : "0";
  };

  useEffect(() => {
    if (active) {
      clearAll();
      valueRef.current = 8;
      visibleRef.current = true;
      apply();

      timerRef.current = setInterval(() => {
        const remaining = 90 - valueRef.current;
        const step = remaining * 0.12 + 0.5;
        valueRef.current = Math.min(90, valueRef.current + step);
        apply();
      }, 200);
    } else {
      clearAll();
      if (!visibleRef.current) return;
      valueRef.current = 100;
      apply();

      fadeTimerRef.current = setTimeout(() => {
        visibleRef.current = false;
        apply();
        fadeTimerRef.current = setTimeout(() => {
          valueRef.current = 0;
          apply();
        }, 210);
      }, 280);
    }

    return clearAll;
  }, [active]);

  return { wrapRef, barRef };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────────── */

interface TopProgressBarProps {
  /** Bar height in px. Default: 2 */
  height?: number;
  /** Track client-side route changes. Default: true */
  trackRoutes?: boolean;
  /** Track window.fetch calls. Default: true */
  trackFetch?: boolean;
}

export function TopProgressBar({
  height = 2,
  trackRoutes = true,
  trackFetch = true,
}: TopProgressBarProps) {
  const active = useSyncExternalStore(
    progress.subscribe,
    progress.getActive,
    () => false,
  );

  useRouteChangeProgress(trackRoutes);
  useFetchProgress(trackFetch);

  const { wrapRef, barRef } = useBarAnimation(active);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999]"
      style={{
        height: `${height}px`,
        opacity: 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        ref={barRef}
        className="h-full"
        style={{
          width: "0%",
          transition: "width 200ms ease-out",
          background: "var(--brand-from)",
          boxShadow: [
            "0 0 8px color-mix(in srgb, var(--brand-from) 80%, transparent)",
            "0 0 20px color-mix(in srgb, var(--brand-from) 50%, transparent)",
          ].join(", "),
        }}
      />
    </div>
  );
}
