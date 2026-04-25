"use client";

/**
 * ConstellationBg — animated canvas that echoes the CharlieLogoSVG palette.
 * Particles float in pseudo-3D, connect with fading lines, and drift toward
 * the mouse cursor. Designed to run as a full-viewport fixed background.
 *
 * Pure Canvas API — no libraries. Respects prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";

// Same palette as CharlieLogoSVG — weighted toward Chainpage gold
const PALETTE = [
  "#E2B34B", // Chainpage gold — dominant
  "#E2B34B",
  "#E2B34B",
  "#E2B34B",
  "#C4912A", // darker gold
  "#B8B8B8", // silver
  "#B8B8B8",
  "#D0D0D0", // light silver
  "#e6be50", // lighter gold
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

    const dpr   = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let particles: Particle[] = [];
    let rafId   = 0;
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
      x:     Math.random() * W,
      y:     Math.random() * H,
      z:     Math.random() * 400 - 200,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      vz:    (Math.random() - 0.5) * 0.22,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      baseR: Math.random() * 2.2 + 1.2,   // 1.2 – 3.4 px (larger than before)
    });

    /* ── Perspective projection ──────────────────────────────────────────── */
    const project = (p: Particle) => {
      const fov = 340;
      const s   = fov / (fov + p.z);
      return { sx: W / 2 + (p.x - W / 2) * s, sy: H / 2 + (p.y - H / 2) * s, s };
    };

    /* ── Render loop ─────────────────────────────────────────────────────── */
    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      const MAX  = Math.min(W, H) * 0.26;       // wider connection radius
      const mx   = (mouse.x - W / 2) * 0.00007;
      const my   = (mouse.y - H / 2) * 0.00007;
      const proj = particles.map(project);

      // ── Lines ──────────────────────────────────────────────────────────
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = proj[i].sx - proj[j].sx;
          const dy = proj[i].sy - proj[j].sy;
          const d  = Math.hypot(dx, dy);
          if (d < MAX) {
            // Use average depth scale for line opacity — closer pairs = brighter
            const depthFade = (proj[i].s + proj[j].s) / 2;
            const a = (1 - d / MAX) * 0.38 * depthFade;
            ctx.strokeStyle = `rgba(195,160,80,${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(proj[i].sx, proj[i].sy);
            ctx.lineTo(proj[j].sx, proj[j].sy);
            ctx.stroke();
          }
        }
      }

      // ── Dots ───────────────────────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p          = particles[i];
        const { sx, sy, s } = proj[i];
        const r          = Math.max(p.baseR * s, 0.6);
        ctx.globalAlpha  = Math.min(1, 0.65 + s * 0.35);  // 0.65–1.0
        ctx.fillStyle    = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, 6.2832);
        ctx.fill();

        // Update
        p.x += p.vx + mx;
        p.y += p.vy + my;
        p.z += p.vz;
        if (p.x < -70)     p.x = W + 70;
        if (p.x > W + 70)  p.x = -70;
        if (p.y < -70)     p.y = H + 70;
        if (p.y > H + 70)  p.y = -70;
        if (p.z < -200)    p.z = 200;
        if (p.z >  200)    p.z = -200;
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    };

    /* ── Init ────────────────────────────────────────────────────────────── */
    rafId = requestAnimationFrame(() => {
      resize();
      if (!W || !H) return;
      // More particles for a denser, more dramatic feel
      particles = Array.from({ length: 78 }, mkP);
      tick();
    });

    const onResize = () => resize();
    const onMouse  = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
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
      }}
    />
  );
}
