// Server component — pure SVG, CSS keyframes handle all animation (no JS needed)

export function CharlieLogoSVG({ size = 160 }: { size?: number }) {
  // Lines: [x1, y1, x2, y2, stroke-color, animation-delay]
  const lines: [number, number, number, number, string, string][] = [
    // Gold cluster — hub to gold dots + inter-connections
    [118, 110,  72, 148, "#C9A84C", "0.5s"],
    [118, 110,  62, 108, "#C9A84C", "0.6s"],
    [ 72, 148,  62, 108, "#C9A84C", "0.7s"],
    [ 72, 148,  86, 162, "#C9A84C", "0.8s"],
    // Silver cluster — hub to silver dots + inter-connections
    [118, 110, 148,  72, "#B8B8B8", "0.9s"],
    [118, 110, 162, 114, "#B8B8B8", "1.0s"],
    [148,  72, 168,  90, "#B8B8B8", "1.1s"],
    [168,  90, 162, 114, "#B8B8B8", "1.2s"],
  ];

  // Outer dots: [cx, cy, r, fill, delay]
  const dots: [number, number, number, string, string][] = [
    [ 72, 148, 4.5, "#C9A84C", "1.20s"], // G1 gold
    [ 62, 108, 4.5, "#C9A84C", "1.30s"], // G2 gold
    [ 86, 162, 4.5, "#C9A84C", "1.35s"], // G3 gold
    [148,  72, 4.5, "#D0D0D0", "1.40s"], // S1 silver
    [168,  90, 4.5, "#D0D0D0", "1.45s"], // S2 silver
    [162, 114, 4.5, "#C8C8C8", "1.50s"], // S3 silver
  ];

  return (
    <svg
      viewBox="0 0 240 288"
      width={size}
      height={size}
      aria-label="Charlie personal logo — constellation mark"
      style={{
        // Continuous float starts after draw-on completes
        animation: "charlie-float 4s ease-in-out 2.8s infinite alternate",
        display: "block",
      }}
    >
      {/* ── Dark background ───────────────────────────────────────────────── */}
      <rect width="240" height="288" rx="20" fill="#1a1a1a" />

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <defs>
        <filter id="hub-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dot-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Open circle arc — draws first ────────────────────────────────── */}
      {/* Circumference = 2π × 100 ≈ 628. Gap ~80° → 628 × (80/360) ≈ 140.
          Visible arc ≈ 488. rotate(-100) positions gap at top-right.      */}
      <circle
        cx="118"
        cy="110"
        r="100"
        fill="none"
        stroke="#AAAAAA"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="488 140"
        transform="rotate(-100, 118, 110)"
        style={{
          strokeDashoffset: 488,
          animation: "charlie-arc-draw 0.9s cubic-bezier(0.4,0,0.2,1) 0s forwards",
        }}
      />

      {/* ── Connection lines (staggered draw-on) ─────────────────────────── */}
      {lines.map(([x1, y1, x2, y2, color, delay], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="220"
          strokeDashoffset="220"
          style={{
            animation: `charlie-line-draw 0.4s ease-out ${delay} forwards`,
          }}
        />
      ))}

      {/* ── Outer dots (staggered pop-in) ────────────────────────────────── */}
      {dots.map(([cx, cy, r, fill, delay], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={fill}
          filter="url(#dot-glow)"
          style={{
            opacity: 0,
            transformOrigin: `${cx}px ${cy}px`,
            animation: `charlie-dot-in 0.3s ease-out ${delay} forwards`,
          }}
        />
      ))}

      {/* ── Central hub — amber glow bloom then pulse ─────────────────────── */}
      {/* Outer soft glow disc */}
      <circle
        cx="118"
        cy="110"
        r="18"
        fill="#FFF1D0"
        style={{
          opacity: 0,
          animation:
            "charlie-glow-bloom 0.5s ease-out 1.85s forwards, charlie-pulse 2.5s ease-in-out 2.8s infinite",
        }}
      />
      {/* Inner bright dot */}
      <circle
        cx="118"
        cy="110"
        r="6"
        fill="#D4AF37"
        filter="url(#hub-glow)"
        style={{
          opacity: 0,
          transformOrigin: "118px 110px",
          animation: "charlie-dot-in 0.35s ease-out 1.9s forwards",
        }}
      />

      {/* ── "CHARLIE" text — slides up last ──────────────────────────────── */}
      <text
        x="120"
        y="260"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="13"
        letterSpacing="5"
        fill="#888888"
        style={{
          opacity: 0,
          animation: "charlie-text-in 0.5s ease-out 2.3s forwards",
        }}
      >
        CHARLIE
      </text>
    </svg>
  );
}
