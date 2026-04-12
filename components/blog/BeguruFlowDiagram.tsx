"use client";

import { useId, useMemo, useState } from "react";

/** Declarative flow: columns left→right, hover highlights connected edges + nodes */
export type BeguruFlowSpec = {
  title?: string;
  hintVi?: string;
  hintEn?: string;
  layers: string[][];
  nodes: Record<
    string,
    {
      label: string;
      kind?:
        | "client"
        | "api"
        | "router"
        | "agent"
        | "llm"
        | "disk"
        | "obs"
        | "sandbox"
        | "default";
    }
  >;
  edges: { from: string; to: string; label?: string }[];
};

const COL_GAP = 200;
const ROW_GAP = 58;
const NODE_W = 168;
const NODE_H = 52;
const PAD = 36;

const KIND_CLASS: Record<string, string> = {
  client:
    "fill-sky-500/15 stroke-sky-500/50 dark:fill-sky-400/10 dark:stroke-sky-400/40",
  api: "fill-violet-500/15 stroke-violet-500/50 dark:fill-violet-400/10 dark:stroke-violet-400/40",
  router:
    "fill-indigo-500/15 stroke-indigo-500/50 dark:fill-indigo-400/10 dark:stroke-indigo-400/40",
  agent:
    "fill-fuchsia-500/15 stroke-fuchsia-500/45 dark:fill-fuchsia-400/10 dark:stroke-fuchsia-400/35",
  llm: "fill-amber-500/15 stroke-amber-500/50 dark:fill-amber-400/10 dark:stroke-amber-400/40",
  disk: "fill-emerald-500/15 stroke-emerald-500/45 dark:fill-emerald-400/10 dark:stroke-emerald-400/35",
  obs: "fill-zinc-400/15 stroke-zinc-400/45 dark:fill-zinc-500/10 dark:stroke-zinc-500/35",
  sandbox:
    "fill-cyan-500/15 stroke-cyan-500/45 dark:fill-cyan-400/10 dark:stroke-cyan-400/35",
  default:
    "fill-zinc-200/80 stroke-zinc-300 dark:fill-zinc-800/50 dark:stroke-zinc-600",
};

function layoutNodes(spec: BeguruFlowSpec) {
  const { layers } = spec;
  const maxRows = Math.max(...layers.map((c) => c.length), 1);
  const height = PAD * 2 + maxRows * ROW_GAP + NODE_H;
  const width = PAD * 2 + layers.length * COL_GAP + NODE_W;

  const pos: Record<string, { x: number; y: number }> = {};
  layers.forEach((col, ci) => {
    const colH = col.length * ROW_GAP + (col.length - 1) * 0;
    const startY = PAD + (maxRows * ROW_GAP - colH) / 2;
    col.forEach((id, ri) => {
      pos[id] = {
        x: PAD + ci * COL_GAP,
        y: startY + ri * ROW_GAP,
      };
    });
  });

  return { pos, width, height, maxRows };
}

function nodeColorClass(kind: string | undefined): string {
  return KIND_CLASS[kind ?? "default"] ?? KIND_CLASS.default;
}

type Props = {
  spec: BeguruFlowSpec;
  lang: "vi" | "en";
};

export function BeguruFlowDiagram({ spec, lang }: Props) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<string | null>(null);

  const { pos, width, height } = useMemo(() => layoutNodes(spec), [spec]);

  const nodeHighlighted = (id: string) => {
    if (!hover) return true;
    if (id === hover) return true;
    return spec.edges.some(
      (e) =>
        (e.from === hover && e.to === id) || (e.to === hover && e.from === id),
    );
  };

  const edgeHighlighted = (from: string, to: string) => {
    if (!hover) return true;
    return from === hover || to === hover;
  };

  const hint =
    lang === "vi"
      ? (spec.hintVi ?? spec.hintEn)
      : (spec.hintEn ?? spec.hintVi);

  return (
    <figure className="my-8 not-prose w-full overflow-x-auto rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50 to-white p-4 shadow-sm dark:border-zinc-700 dark:from-zinc-900/80 dark:to-zinc-950/90">
      {spec.title ? (
        <figcaption className="mb-3 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {spec.title}
        </figcaption>
      ) : null}
      {hint ? (
        <p className="mb-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto h-auto w-full max-w-5xl"
        role="img"
        aria-label={spec.title ?? "Architecture flow diagram"}
      >
        <defs>
          <marker
            id={`arrow-${gid}`}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L8,4 L0,8 z"
              className="fill-zinc-400 dark:fill-zinc-500"
            />
          </marker>
          <marker
            id={`arrow-active-${gid}`}
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L9,4.5 L0,9 z"
              className="fill-sky-500 dark:fill-sky-400"
            />
          </marker>
        </defs>

        {spec.edges.map((e, i) => {
          const a = pos[e.from];
          const b = pos[e.to];
          if (!a || !b) return null;
          const x1 = a.x + NODE_W;
          const y1 = a.y + NODE_H / 2;
          const x2 = b.x;
          const y2 = b.y + NODE_H / 2;
          const mx = (x1 + x2) / 2;
          const active = edgeHighlighted(e.from, e.to);
          const dim = hover && !active;
          const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <path
                d={d}
                fill="none"
                strokeWidth={active ? 2.2 : 1.5}
                className={
                  dim
                    ? "stroke-zinc-200/50 dark:stroke-zinc-700/50"
                    : active && hover
                      ? "stroke-sky-500 dark:stroke-sky-400"
                      : "stroke-zinc-300 dark:stroke-zinc-600"
                }
                markerEnd={
                  active && hover
                    ? `url(#arrow-active-${gid})`
                    : `url(#arrow-${gid})`
                }
                style={{ transition: "stroke 0.15s ease, opacity 0.15s ease" }}
              />
              {e.label ? (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  textAnchor="middle"
                  className="fill-zinc-500 text-[10px] dark:fill-zinc-400"
                  style={{ opacity: dim ? 0.35 : 1 }}
                >
                  {e.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {Object.entries(spec.nodes).map(([id, n]) => {
          const p = pos[id];
          if (!p) return null;
          const active = nodeHighlighted(id);
          const dim = hover && !active;
          const k = n.kind ?? "default";
          return (
            <g
              key={id}
              transform={`translate(${p.x},${p.y})`}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx="10"
                className={`${nodeColorClass(k)} transition-opacity duration-150`}
                style={{ opacity: dim ? 0.38 : 1 }}
                strokeWidth="1.5"
              />
              <text
                textAnchor="middle"
                className="pointer-events-none fill-zinc-800 text-[11px] font-medium dark:fill-zinc-100"
                style={{ opacity: dim ? 0.45 : 1 }}
              >
                {(() => {
                  const lines = n.label.split("\n");
                  const startY = NODE_H / 2 - (lines.length - 1) * 6.5;
                  return lines.map((line, li) => (
                    <tspan key={li} x={NODE_W / 2} y={startY + li * 13}>
                      {line}
                    </tspan>
                  ));
                })()}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function parseBeguruFlowSpec(raw: string): BeguruFlowSpec | null {
  try {
    const spec = JSON.parse(raw.trim()) as BeguruFlowSpec;
    if (!spec.layers || !spec.nodes || !spec.edges) return null;
    return spec;
  } catch {
    return null;
  }
}
