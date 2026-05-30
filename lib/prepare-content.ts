/**
 * Cleans markdown before TOC extraction and rendering:
 * - strips bilingual split markers (## VI / ## EN)
 * - wraps TL;DR bullets in a note callout
 */
export function prepareContent(text: string): string {
  let out = text
    .replace(/^##\s+VI\s*$/m, "")
    .replace(/^##\s+EN\s*$/m, "");

  out = wrapTldrAsCallout(out);

  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function wrapTldrAsCallout(text: string): string {
  const match = /^##\s+TL;DR\s*\n([\s\S]*?)(?=\n(?:---|##\s|:::))/m.exec(text);
  if (!match) {
    return text.replace(/^##\s+TL;DR\s*$/m, "");
  }

  const body = match[1].trim();
  if (!body) {
    return text.replace(/^##\s+TL;DR\s*$/m, "");
  }

  return text.replace(
    match[0],
    `:::note[Key Takeaways]\n\n${body}\n\n:::\n`,
  );
}
