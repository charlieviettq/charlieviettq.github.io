import GithubSlugger from "github-slugger";

export type TocItem = {
  depth: 2 | 3;
  text: string;
  id: string;
};

function stripInlineMd(raw: string): string {
  return raw
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    const m = /^(#{2,3})\s+(.+?)(?:\s+#+\s*)?$/.exec(trimmed);
    if (!m) continue;
    const level = m[1].length;
    if (level !== 2 && level !== 3) continue;
    const depth = level as 2 | 3;
    const text = stripInlineMd(m[2].trim());
    if (!text) continue;
    const id = slugger.slug(text);
    items.push({ depth, text, id });
  }
  return items;
}

export function splitBilingualMarkdown(content: string): {
  vi: string;
  en: string;
} | null {
  const viRe = /^##\s+VI\s*$/m;
  const enRe = /^##\s+EN\s*$/m;
  const viMatch = content.match(viRe);
  const enMatch = content.match(enRe);
  if (
    !viMatch ||
    !enMatch ||
    viMatch.index === undefined ||
    enMatch.index === undefined
  ) {
    return null;
  }
  if (enMatch.index <= viMatch.index) return null;
  const startVi = content.indexOf("\n", viMatch.index) + 1;
  const endVi = enMatch.index;
  const startEn = content.indexOf("\n", enMatch.index) + 1;
  const vi = content.slice(startVi, endVi).trim();
  const en = content.slice(startEn).trim();
  if (!vi || !en) return null;
  return { vi, en };
}
