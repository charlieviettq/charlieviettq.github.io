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
  type MouseEvent,
} from "react";
import { useTheme } from "next-themes";

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

const KIND_BOX: Record<string, string> = {
  client:
    "border-sky-500/50 bg-sky-500/15 dark:border-sky-400/40 dark:bg-sky-400/10",
  api: "border-violet-500/50 bg-violet-500/15 dark:border-violet-400/40 dark:bg-violet-400/10",
  router:
    "border-indigo-500/50 bg-indigo-500/15 dark:border-indigo-400/40 dark:bg-indigo-400/10",
  agent:
    "border-fuchsia-500/45 bg-fuchsia-500/15 dark:border-fuchsia-400/35 dark:bg-fuchsia-400/10",
  llm: "border-amber-500/50 bg-amber-500/15 dark:border-amber-400/40 dark:bg-amber-400/10",
  disk: "border-emerald-500/45 bg-emerald-500/15 dark:border-emerald-400/35 dark:bg-emerald-400/10",
  obs: "border-zinc-400/45 bg-zinc-400/15 dark:border-zinc-500/35 dark:bg-zinc-500/10",
  sandbox:
    "border-cyan-500/45 bg-cyan-500/15 dark:border-cyan-400/35 dark:bg-cyan-400/10",
  default:
    "border-zinc-300 bg-zinc-200/80 dark:border-zinc-600 dark:bg-zinc-800/50",
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

  const strokeMuted = isDark ? "#52525b" : "#a1a1aa";
  const strokeActive = isDark ? "#38bdf8" : "#0ea5e9";
  const strokeBase = isDark ? "#71717a" : "#a1a1aa";
  const labelFill = isDark ? "#a1a1aa" : "#52525b";

  const nodes: Node[] = [];
  for (const [id, n] of Object.entries(spec.nodes)) {
    const p = pos[id];
    if (!p) continue;
    const k = n.kind ?? "default";
    nodes.push({
      id,
      type: "beguru",
      position: p,
      data: {
        label: n.label,
        boxClass: KIND_BOX[k] ?? KIND_BOX.default,
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
        strokeWidth: hl ? 2.2 : 1.5,
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
  boxClass: string;
  dimmed: boolean;
};

const BeguruFlowNode = memo(function BeguruFlowNode({ data }: NodeProps) {
  const d = data as BeguruNodeData;
  return (
    <div
      className={`rounded-[10px] border border-solid transition-opacity duration-150 ${d.boxClass} ${
        d.dimmed ? "opacity-[0.38]" : "opacity-100"
      }`}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-zinc-400 dark:!bg-zinc-500"
      />
      <div
        className={`flex h-full items-center justify-center whitespace-pre-line px-2 text-center text-[11px] font-medium leading-snug text-zinc-800 dark:text-zinc-100 ${
          d.dimmed ? "opacity-45" : ""
        }`}
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

function FitViewOnSpec({ specKey }: { specKey: string }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 220, maxZoom: 1.25 });
    });
    return () => cancelAnimationFrame(id);
  }, [fitView, specKey]);
  return null;
}

function BeguruFlowInner({
  spec,
  lang,
}: {
  spec: BeguruFlowSpec;
  lang: "vi" | "en";
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
  const containerH = Math.max(380, layoutHeight + 24);

  const onNodeEnter = useCallback((_: MouseEvent, node: Node) => {
    setHover(node.id);
  }, []);
  const onNodeLeave = useCallback(() => setHover(null), []);

  const hint =
    lang === "vi"
      ? (spec.hintVi ?? spec.hintEn)
      : (spec.hintEn ?? spec.hintVi);

  const specKey = useMemo(() => JSON.stringify(spec), [spec]);

  return (
    <figure className="my-8 not-prose w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50 to-white shadow-sm dark:border-zinc-700 dark:from-zinc-900/80 dark:to-zinc-950/90">
      {spec.title ? (
        <figcaption className="px-4 pt-4 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {spec.title}
        </figcaption>
      ) : null}
      {hint ? (
        <p className="px-4 pb-2 pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
      <div
        className="beguru-flow-rf w-full [&_.react-flow\_\_attribution]:bg-transparent [&_.react-flow\_\_attribution]:text-[10px]"
        style={{ height: containerH }}
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
          minZoom={0.35}
          maxZoom={1.35}
          className="rounded-b-2xl bg-transparent"
          aria-label={spec.title ?? "Architecture flow diagram"}
        >
          <Background
            gap={18}
            size={1}
            className="opacity-40 dark:opacity-25"
          />
          <Controls
            showInteractive={false}
            className="!m-2 !border-zinc-200 !bg-white/90 !shadow-sm dark:!border-zinc-600 dark:!bg-zinc-900/90"
          />
          <FitViewOnSpec specKey={specKey} />
        </ReactFlow>
      </div>
    </figure>
  );
}

type Props = {
  spec: BeguruFlowSpec;
  lang: "vi" | "en";
};

export function BeguruFlowDiagram({ spec, lang }: Props) {
  const specKey = useMemo(() => JSON.stringify(spec), [spec]);
  return (
    <ReactFlowProvider>
      <BeguruFlowInner key={specKey} spec={spec} lang={lang} />
    </ReactFlowProvider>
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
