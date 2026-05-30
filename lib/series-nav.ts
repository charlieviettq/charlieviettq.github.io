export type SeriesLink = {
  label: string;
  markdown: string;
};

export type SeriesNav = {
  seriesName: string;
  episode: string;
  links: SeriesLink[];
};

export function extractSeriesNav(text: string): {
  content: string;
  seriesNav: SeriesNav | null;
} {
  const lines = text.split(/\r?\n/);
  let i = 0;

  while (i < lines.length && lines[i].trim() === "") i++;

  if (!/^>\s*\*\*Series:/.test(lines[i] ?? "")) {
    return { content: text, seriesNav: null };
  }

  const blockLines: string[] = [];
  while (i < lines.length && lines[i].trim().startsWith(">")) {
    blockLines.push(lines[i]);
    i++;
  }

  while (i < lines.length && lines[i].trim() === "") i++;
  if (lines[i]?.trim() === "---") {
    i++;
  }
  while (i < lines.length && lines[i].trim() === "") i++;

  const remaining = lines.slice(i).join("\n");

  const firstLine = blockLines[0].replace(/^>\s*/, "");
  const headerMatch = /\*\*Series:\s*(.+?)\*\*\s*—\s*(.+)/.exec(firstLine);
  if (!headerMatch) {
    return { content: text, seriesNav: null };
  }

  const links: SeriesLink[] = [];
  for (let j = 1; j < blockLines.length; j++) {
    const line = blockLines[j].replace(/^>\s*/, "").trim();
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    links.push({
      label: line.slice(0, colonIdx).trim(),
      markdown: line.slice(colonIdx + 1).trim(),
    });
  }

  return {
    content: remaining,
    seriesNav: {
      seriesName: headerMatch[1].trim(),
      episode: headerMatch[2].trim(),
      links,
    },
  };
}
