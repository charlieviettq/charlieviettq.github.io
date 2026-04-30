import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

// Simple markdown heading extractor (## / ###). Works with rehype-slug output.
export function buildTocFromMarkdown(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const hashes = m[1];
    const rawTitle = m[2];

    // strip trailing markdown markers (e.g. "Title ---" is handled by regex already)
    const title = rawTitle.replace(/\s+#*$/, "").trim();
    if (!title) continue;

    const level = hashes.length as 2 | 3;
    const id = slugger.slug(title);
    items.push({ id, title, level });
  }

  return items;
}

