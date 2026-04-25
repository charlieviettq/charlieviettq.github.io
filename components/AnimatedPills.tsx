"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps children in a container that adds `.pills-visible` when it enters
 * the viewport. CSS in globals.css uses this class to trigger staggered
 * `pill-pop` animations on `.pill-item` children.
 */
export function AnimatedPills({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already in view on mount (desktop, short page), trigger immediately
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={visible ? "pills-visible" : ""}>
      {children}
    </div>
  );
}
