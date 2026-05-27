const DIAGRAM_PREFIX = "/blog/diagrams/";

export function isThemedDiagramSrc(src: string | undefined): boolean {
  return Boolean(src?.endsWith(".svg") && src.startsWith(DIAGRAM_PREFIX));
}
