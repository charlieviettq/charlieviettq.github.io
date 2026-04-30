import type { Paragraph, PhrasingContent, Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";

const CALLOUTS = new Set([
  "note",
  "info",
  "tip",
  "warning",
  "success",
  "quote",
  "todo",
]);

type HastDirectiveData = {
  hName?: string;
  hProperties?: Record<string, unknown>;
};

function isDirectiveLabelParagraph(
  node: ContainerDirective["children"][number],
): node is Paragraph & { data?: { directiveLabel?: boolean } } {
  return (
    node.type === "paragraph" &&
    Boolean((node as Paragraph).data?.directiveLabel)
  );
}

function paragraphText(node: Paragraph): string {
  return (node.children ?? [])
    .map((c: PhrasingContent) => {
      if (c.type === "text") return c.value;
      return "";
    })
    .join("")
    .trim();
}

/**
 * First paragraph may be `[label]` from `:::name[label]` — extract title and drop it from body.
 */
function extractTitleAndBody(
  children: ContainerDirective["children"],
): { title: string | undefined; body: ContainerDirective["children"] } {
  if (!children.length) return { title: undefined, body: children };
  const first = children[0];
  if (isDirectiveLabelParagraph(first)) {
    const title = paragraphText(first) || undefined;
    return { title, body: children.slice(1) };
  }
  return { title: undefined, body: children };
}

/**
 * remark plugin: turn container directives into mdast nodes with data.hName / hProperties
 * so mdast-util-to-hast emits aside/details (via applyData on unknown directive → div → hName).
 */
export default function remarkDocDirectives() {
  return (tree: Root) => {
    visit(tree, "containerDirective", (node: ContainerDirective) => {
      const name = node.name;

      if (CALLOUTS.has(name)) {
        const { title, body } = extractTitleAndBody(node.children);
        const data = (node.data ?? (node.data = {})) as HastDirectiveData;
        data.hName = "aside";
        data.hProperties = {
          className: ["doc-callout", `doc-callout--${name}`],
          ...(title ? { dataDocTitle: title } : {}),
        };
        node.children = body;
        return;
      }

      if (name === "expand") {
        const { title, body } = extractTitleAndBody(node.children);
        const data = (node.data ?? (node.data = {})) as HastDirectiveData;
        data.hName = "aside";
        data.hProperties = {
          className: ["doc-callout", "doc-expand"],
          ...(title ? { dataDocTitle: title } : {}),
        };
        node.children = body;
      }
    });
  };
}
