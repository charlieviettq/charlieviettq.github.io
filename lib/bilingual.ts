export type BilingualSplit = {
  common: string;
  vi: string;
  en: string;
};

function indexOfHeading(content: string, heading: "VI" | "EN"): number {
  // Match a line that starts with exactly `## VI` or `## EN` (allow trailing spaces).
  const re = new RegExp(`^##\\s+${heading}\\s*$`, "m");
  const m = re.exec(content);
  return m?.index ?? -1;
}

export function splitBilingualMarkdown(content: string): BilingualSplit {
  const viIdx = indexOfHeading(content, "VI");
  const enIdx = indexOfHeading(content, "EN");

  // If markers are missing or out of order, don't break rendering.
  if (viIdx === -1 || enIdx === -1 || enIdx <= viIdx) {
    return { common: content, vi: "", en: "" };
  }

  const common = content.slice(0, viIdx).trimEnd();
  const vi = content.slice(viIdx, enIdx).trim();
  const en = content.slice(enIdx).trim();

  return { common, vi, en };
}

