"use client";

import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useTheme } from "next-themes";
import { ChartLightbox } from "@/components/blog/ChartLightbox";

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
        | "memory"
        | "template"
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

/** Mã hex gradient + màu chữ theo theme */
const KIND_STYLE: Record<
  string,
  { light: { bg: string; glow: string }; dark: { bg: string; glow: string } }
> = {
  client: {
    light: {
      bg: "linear-gradient(145deg, #e0f2fe 0%, #7dd3fc 40%, #38bdf8 100%)",
      glow: "rgba(14, 165, 233, 0.45)",
    },
    dark: {
      bg: "linear-gradient(145deg, #0c4a6e 0%, #0369a1 45%, #38bdf8 100%)",
      glow: "rgba(56, 189, 248, 0.35)",
    },
  },
  api: {
    light: {
      bg: "linear-gradient(145deg, #ede9fe 0%, #c4b5fd 42%, #8b5cf6 100%)",
      glow: "rgba(139, 92, 246, 0.4)",
    },
    dark: {
      bg: "linear-gradient(145deg, #4c1d95 0%, #6d28d9 48%, #a78bfa 100%)",
      glow: "rgba(167, 139, 250, 0.35)",
    },
  },
  router: {
    light: {
      bg: "linear-gradient(145deg, #e0e7ff 0%, #a5b4fc 42%, #6366f1 100%)",
      glow: "rgba(99, 102, 241, 0.4)",
    },
    dark: {
      bg: "linear-gradient(145deg, #312e81 0%, #4338ca 48%, #818cf8 100%)",
      glow: "rgba(129, 140, 248, 0.35)",
    },
  },
  agent: {
    light: {
      bg: "linear-gradient(145deg, #fce7f3 0%, #f0abfc 40%, #d946ef 100%)",
      glow: "rgba(217, 70, 239, 0.38)",
    },
    dark: {
      bg: "linear-gradient(145deg, #86198f 0%, #a21caf 45%, #e879f9 100%)",
      glow: "rgba(232, 121, 249, 0.32)",
    },
  },
  memory: {
    light: {
      bg: "linear-gradient(145deg, #fff1f2 0%, #fecaca 40%, #fb7185 100%)",
      glow: "rgba(251,113,133,0.38)",
    },
    dark: {
      bg: "linear-gradient(145deg, #4c0519 0%, #7f1d1d 45%, #fb7185 100%)",
      glow: "rgba(251,113,133,0.28)",
    },
  },
  template: {
    light: {
      bg: "linear-gradient(145deg, #fff7ed 0%, #fed7aa 40%, #fb923c 100%)",
      glow: "rgba(251,146,60,0.38)",
    },
    dark: {
      bg: "linear-gradient(145deg, #7c2d12 0%, #b54707 45%, #fb923c 100%)",
      glow: "rgba(251,146,60,0.28)",
    },
  },
  llm: {
    light: {
      bg: "linear-gradient(145deg, #fef3c7 0%, #fcd34d 38%, #f59e0b 100%)",
      glow: "rgba(245, 158, 11, 0.42)",
    },
    dark: {
      bg: "linear-gradient(145deg, #78350f 0%, #b45309 48%, #fbbf24 100%)",
      glow: "rgba(251, 191, 36, 0.32)",
    },
  },
  disk: {
    light: {
      bg: "linear-gradient(145deg, #d1fae5 0%, #6ee7b7 40%, #10b981 100%)",
      glow: "rgba(16, 185, 129, 0.4)",
    },
    dark: {
      bg: "linear-gradient(145deg, #064e3b 0%, #047857 48%, #34d399 100%)",
      glow: "rgba(52, 211, 153, 0.3)",
    },
  },
  obs: {
    light: {
      bg: "linear-gradient(145deg, #f4f4f5 0%, #d4d4d8 45%, #71717a 100%)",
      glow: "rgba(113, 113, 122, 0.35)",
    },
    dark: {
      bg: "linear-gradient(145deg, #27272a 0%, #3f3f46 50%, #a1a1aa 100%)",
      glow: "rgba(161, 161, 170, 0.28)",
    },
  },
  sandbox: {
    light: {
      bg: "linear-gradient(145deg, #cffafe 0%, #22d3ee 42%, #06b6d4 100%)",
      glow: "rgba(6, 182, 212, 0.4)",
    },
    dark: {
      bg: "linear-gradient(145deg, #164e63 0%, #0e7490 48%, #22d3ee 100%)",
      glow: "rgba(34, 211, 238, 0.32)",
    },
  },
  default: {
    light: {
      bg: "linear-gradient(145deg, #f4f4f5 0%, #e4e4e7 50%, #d4d4d8 100%)",
      glow: "rgba(82, 82, 91, 0.3)",
    },
    dark: {
      bg: "linear-gradient(145deg, #18181b 0%, #27272a 55%, #3f3f46 100%)",
      glow: "rgba(161, 161, 170, 0.25)",
    },
  },
};

const TEXT: Record<string, { light: string; dark: string }> = {
  client: { light: "#0c4a6e", dark: "#f0f9ff" },
  api: { light: "#4c1d95", dark: "#f5f3ff" },
  router: { light: "#312e81", dark: "#eef2ff" },
  agent: { light: "#86198f", dark: "#fdf4ff" },
  llm: { light: "#78350f", dark: "#fffbeb" },
  disk: { light: "#064e3b", dark: "#ecfdf5" },
  obs: { light: "#27272a", dark: "#fafafa" },
  sandbox: { light: "#164e63", dark: "#ecfeff" },
  memory: { light: "#6b021a", dark: "#fff1f2" },
  template: { light: "#7c2d12", dark: "#fff7ed" },
  default: { light: "#18181b", dark: "#fafafa" },
};

function layoutNodes(spec: BeguruFlowSpec) {
  const { layers } = spec;
  const maxRows = Math.max(...layers.map((c) => c.length), 1);
  const height = PAD * 2 + maxRows * ROW_GAP + NODE_H;

  const pos: Record<string, { x: number; y: number }> = {};
  layers.forEach((col, ci) => {
    const colH = col.length * ROW_GAP;
    const startY = PAD + (maxRows * ROW_GAP - colH) / 2;
    col.forEach((id, ri) => {
      pos[id] = {
        x: PAD + ci * COL_GAP,
        y: startY + ri * ROW_GAP,
      };
    });
  });

  return { pos, height, maxRows };
}

function buildNodesAndEdges(
  spec: BeguruFlowSpec,
  hover: string | null,
  isDark: boolean,
): { nodes: Node[]; edges: Edge[] } {
  const { pos } = layoutNodes(spec);

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

  const strokeMuted = isDark ? "#52525b" : "#b4b9c2";
  const strokeActive = isDark ? "#38bdf8" : "#0284c7";
  const strokeBase = isDark ? "#71717a" : "#94a3b8";
  const labelFill = isDark ? "#a1a1aa" : "#64748b";

  const nodes: Node[] = [];
  for (const [id, n] of Object.entries(spec.nodes)) {
    const p = pos[id];
    if (!p) continue;
    const k = n.kind ?? "default";
    const ks = KIND_STYLE[k] ?? KIND_STYLE.default;
    const mode = isDark ? "dark" : "light";
    const tx = TEXT[k] ?? TEXT.default;
    nodes.push({
      id,
      type: "beguru",
      position: p,
      data: {
        label: n.label,
        gradientBg: ks[mode].bg,
        glow: ks[mode].glow,
        color: tx[mode],
        dimmed: !nodeHighlighted(id),
      },
      style: { width: NODE_W, height: NODE_H },
      draggable: false,
      selectable: false,
    });
  }

  const edges: Edge[] = spec.edges.map((e, i) => {
    const active = edgeHighlighted(e.from, e.to);
    const dim = Boolean(hover && !active);
    const hl = Boolean(active && hover);
    return {
      id: `e-${e.from}-${e.to}-${i}`,
      source: e.from,
      target: e.to,
      label: e.label,
      type: "smoothstep",
      style: {
        stroke: hl ? strokeActive : dim ? strokeMuted : strokeBase,
        strokeWidth: hl ? 2.4 : 1.5,
        opacity: dim ? 0.35 : 1,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: hl ? strokeActive : dim ? strokeMuted : strokeBase,
      },
      labelStyle: { fill: labelFill, fontSize: 10, fontWeight: 500 },
      labelShowBg: true,
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      labelBgStyle: {
        fill: isDark ? "rgba(24,24,27,0.92)" : "rgba(250,250,250,0.95)",
      },
      focusable: false,
      interactionWidth: 24,
    };
  });

  return { nodes, edges };
}

type BeguruNodeData = {
  label: string;
  gradientBg: string;
  glow: string;
  color: string;
  dimmed: boolean;
};

const BeguruFlowNode = memo(function BeguruFlowNode({ data }: NodeProps) {
  const d = data as BeguruNodeData;
  const nodeStyle: CSSProperties = {
    width: NODE_W,
    height: NODE_H,
    background: d.gradientBg,
    color: d.color,
    boxShadow: d.dimmed
      ? "none"
      : `0 0 16px ${d.glow}, 0 0 1px rgba(255,255,255,0.35) inset`,
  };
  return (
    <div
      className={`rounded-[10px] border border-white/30 transition-opacity duration-150 dark:border-white/10 ${
        d.dimmed ? "opacity-[0.38]" : "opacity-100"
      }`}
      style={nodeStyle}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-zinc-400 dark:!bg-zinc-500"
      />
      <div
        className={`flex h-full items-center justify-center whitespace-pre-line px-2 text-center text-[11px] font-semibold leading-snug ${
          d.dimmed ? "opacity-45" : ""
        }`}
        style={{ color: d.color }}
      >
        {d.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-zinc-400 dark:!bg-zinc-500"
      />
    </div>
  );
});

const nodeTypes = { beguru: BeguruFlowNode };

function FitViewOnSpec({
  specKey,
  variant,
}: {
  specKey: string;
  variant: "inline" | "fullscreen";
}) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() => {
      fitView({
        padding: 0.2,
        duration: reduceMotion ? 0 : variant === "fullscreen" ? 280 : 240,
        maxZoom: variant === "fullscreen" ? 1.4 : 1.25,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [fitView, specKey, variant]);
  return null;
}

function BeguruFlowCanvas({
  spec,
  variant,
  minHeightStyle,
}: {
  spec: BeguruFlowSpec;
  variant: "inline" | "fullscreen";
  minHeightStyle?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hover, setHover] = useState<string | null>(null);

  const initial = useMemo(
    () => buildNodesAndEdges(spec, null, isDark),
    [spec, isDark],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    const next = buildNodesAndEdges(spec, hover, isDark);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [spec, hover, isDark, setNodes, setEdges]);

  const { height: layoutHeight } = layoutNodes(spec);
  const baseH = Math.max(380, layoutHeight + 24);
  const heightPx =
    variant === "fullscreen"
      ? minHeightStyle ?? "78vh"
      : `${baseH}px`;

  const onNodeEnter = useCallback((_: MouseEvent, node: Node) => {
    setHover(node.id);
  }, []);
  const onNodeLeave = useCallback(() => setHover(null), []);

  const specKey = useMemo(() => JSON.stringify(spec), [spec]);

  return (
    <div
      className="beguru-flow-rf w-full [&_.react-flow\_\_attribution]:bg-transparent [&_.react-flow\_\_attribution]:text-[10px]"
      style={{ height: heightPx }}
      role="presentation"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeEnter}
        onNodeMouseLeave={onNodeLeave}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        minZoom={0.25}
        maxZoom={variant === "fullscreen" ? 1.6 : 1.35}
        className="bg-transparent"
        aria-label={spec.title ?? "Architecture flow diagram"}
      >
        <Background
          gap={20}
          size={1.15}
          className="opacity-[0.38] dark:opacity-[0.22]"
        />
        <Controls
          showInteractive={false}
          className="!m-2 !border-zinc-200 !bg-white/90 !shadow-sm dark:!border-zinc-600 dark:!bg-zinc-900/90"
        />
        <FitViewOnSpec specKey={`${specKey}-${variant}`} variant={variant} />
      </ReactFlow>
    </div>
  );
}

type Props = {
  spec: BeguruFlowSpec;
  lang: "vi" | "en";
};

export function BeguruFlowDiagram({ spec, lang }: Props) {
  const specKey = useMemo(() => JSON.stringify(spec), [spec]);

  const hint =
    lang === "vi"
      ? (spec.hintVi ?? spec.hintEn)
      : (spec.hintEn ?? spec.hintVi);

  const hintNode = hint ? (
    <span>{hint}</span>
  ) : undefined;

  const footerNote = (
    <span>
      {lang === "vi" ? (
        <>
          Sơ đồ tương tác · SSOT:{" "}
          <code className="rounded-md bg-zinc-200/90 px-1.5 py-0.5 font-mono text-[0.65rem] text-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-200">
            beguru-ai/docs
          </code>
        </>
      ) : (
        <>
          Interactive · SSOT:{" "}
          <code className="rounded-md bg-zinc-200/90 px-1.5 py-0.5 font-mono text-[0.65rem] text-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-200">
            beguru-ai/docs
          </code>
        </>
      )}
    </span>
  );

  return (
    <ChartLightbox
      title={spec.title}
      hint={hintNode}
      footerNote={footerNote}
      lang={lang}
      fullscreenSlot={
        <ReactFlowProvider>
          <BeguruFlowCanvas
            key={`fs-${specKey}`}
            spec={spec}
            variant="fullscreen"
            minHeightStyle="72vh"
          />
        </ReactFlowProvider>
      }
    >
      <ReactFlowProvider>
        <BeguruFlowCanvas
          key={`in-${specKey}`}
          spec={spec}
          variant="inline"
        />
      </ReactFlowProvider>
    </ChartLightbox>
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
