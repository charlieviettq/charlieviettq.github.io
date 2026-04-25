"use client";

/**
 * ConstellationBg — animated canvas background that echoes the CharlieLogoSVG palette.
 * Particles float in pseudo-3D (perspective projection), connect with fading lines
 * when close, and drift subtly toward the mouse cursor.
 *
 * Pure canvas, no libraries. GPU path: transform/opacity only — never reflows.
 * Respects prefers-reduced-motion (renders nothing when enabled).
 */

import { useEffect, useRef } from "react";

// Same gold/silver/amber palette as CharlieLogoSVG
const PALETTE = [
  "#C9A84C", // gold — G cluster
  "#C9A84C",
  "#D4AF37", // amber — hub
  "#B8B8B8", // silver — S cluster
  "#B8B8B8",
  "#D0D0D0", // light silver
  "#C8C8C8",
];

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  color: string;
  baseR: number;
}

export function ConstellationBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2× for perf
    let W = 0, H = 0;
    let particles: Particle[] = [];
    let rafId = 0;
    const mouse = { x: 0, y: 0 };

    /* ── Sizing ──────────────────────────────────────────────────────────── */
    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      if (!W || !H) return;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ── Particle factory ────────────────────────────────────────────────── */
    const mkP = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 400 - 200,         // –200 … +200 depth range
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      vz: (Math.random() - 0.5) * 0.18,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      baseR: Math.random() * 1.6 + 0.8,
    });

    /* ── Perspective projection ──────────────────────────────────────────── */
    const project = (p: Particle) => {
      const fov = 360;
      const s   = fov / (fov + p.z);          // closer (low z) → larger s
      return { sx: W / 2 + (p.x - W / 2) * s, sy: H / 2 + (p.y - H / 2) * s, s };
    };

    /* ── Main render loop ────────────────────────────────────────────────── */
    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      const MAX_DIST = Math.min(W, H) * 0.20;   // connection threshold
      const mx = (mouse.x - W / 2) * 0.000055;  // parallax nudge
      const my = (mouse.y - H / 2) * 0.000055;

      // Pre-project all particles once
      const proj = particles.map(project);

      // ── Lines ──────────────────────────────────────────────────────────
      ctx.lineWidth = 0.55;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = proj[i].sx - proj[j].sx;
          const dy = proj[i].sy - proj[j].sy;
          const d  = Math.hypot(dx, dy);
          if (d < MAX_DIST) {
            const a = (1 - d / MAX_DIST) * 0.20;
            ctx.strokeStyle = `rgba(195,175,130,${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(proj[i].sx, proj[i].sy);
            ctx.lineTo(proj[j].sx, proj[j].sy);
            ctx.stroke();
          }
        }
      }

      // ── Dots ───────────────────────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p      = particles[i];
        const { sx, sy, s } = proj[i];
        const r      = Math.max(p.baseR * s, 0.4);
        ctx.globalAlpha = Math.min(1, 0.45 + s * 0.55);
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, 6.2832);
        ctx.fill();

        // ── Update position ─────────────────────────────────────────────
        p.x += p.vx + mx;
        p.y += p.vy + my;
        p.z += p.vz;

        // Wrap around edges
        if (p.x < -60)     p.x = W + 60;
        if (p.x > W + 60)  p.x = -60;
        if (p.y < -60)     p.y = H + 60;
        if (p.y > H + 60)  p.y = -60;
        if (p.z < -200)    p.z = 200;
        if (p.z >  200)    p.z = -200;
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    };

    /* ── Init ────────────────────────────────────────────────────────────── */
    // Run resize + init inside rAF so offsetWidth/Height are populated after paint
    rafId = requestAnimationFrame(() => {
      resize();
      if (!W || !H) return;
      particles = Array.from({ length: 52 }, mkP);
      tick();
    });

    const onResize = () => resize();
    const onMouse  = (e: MouseEvent) => {
      const r   = canvas.getBoundingClientRect();
      mouse.x   = e.clientX - r.left;
      mouse.y   = e.clientY - r.top;
    };

    window.addEventListener("resize",    onResize, { passive: true });
    window.addEventListener("mousemove", onMouse,  { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width:  "100%",
        height: "100%",
        pointerEvents: "none",
        borderRadius: "inherit",     // clip to parent's border-radius
      }}
    />
  );
}
