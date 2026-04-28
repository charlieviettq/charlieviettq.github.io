"use client";

/**
 * HeroTiltCard — wraps children in a div that applies a subtle 3D perspective
 * tilt as the mouse moves across it. Snaps back smoothly on mouse leave.
 *
 * Uses only CSS transforms (GPU-composited — no layout/paint).
 * Tilt is disabled automatically when prefers-reduced-motion is set.
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function HeroTiltCard({ children, className = "", style }: Props) {
  const ref     = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced.current) return;
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left)  / width  - 0.5;  // –0.5 … 0.5
    const y = (e.clientY - top)   / height - 0.5;
    // Max tilt: ±6° horizontal, ±4° vertical
    el.style.transform  = `perspective(1400px) rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg) scale3d(1.012,1.012,1.012)`;
    el.style.transition = "transform 0.08s ease-out";
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform  = "perspective(1400px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.65s cubic-bezier(0.23,1,0.32,1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, willChange: "transform", transformStyle: "preserve-3d" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
