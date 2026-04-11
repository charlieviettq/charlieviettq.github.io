import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const postsDir = path.join(root, "content/posts");
const outPath = path.join(root, "public/blog-search-index.json");

/** Strip markdown enough for search indexing (not perfect, but small & fast). */
function stripMarkdownLite(s) {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/^:::+\s*\w*[^\n]*\n?/gm, " ")
    .replace(/^:::+\s*$/gm, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
    .replace(/\|/g, " ")
    .replace(/<[a-z/][^>]*>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitViEn(content) {
  const viRe = /^##\s+VI\s*$/m;
  const enRe = /^##\s+EN\s*$/m;
  const viMatch = content.match(viRe);
  const enMatch = content.match(enRe);
  if (
    !viMatch ||
    !enMatch ||
    viMatch.index === undefined ||
    enMatch.index === undefined ||
    enMatch.index <= viMatch.index
  ) {
    const plain = stripMarkdownLite(content);
    return { textVi: plain, textEn: plain };
  }
  const startVi = content.indexOf("\n", viMatch.index) + 1;
  const endVi = enMatch.index;
  const startEn = content.indexOf("\n", enMatch.index) + 1;
  const vi = content.slice(startVi, endVi).trim();
  const en = content.slice(startEn).trim();
  return { textVi: stripMarkdownLite(vi), textEn: stripMarkdownLite(en) };
}

if (!fs.existsSync(postsDir)) {
  console.warn("No content/posts; writing empty search index.");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, "[]", "utf8");
  process.exit(0);
}

const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
const index = [];

for (const f of files) {
  const slug = f.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(postsDir, f), "utf8");
  const { data, content } = matter(raw);
  if (String(data.visibility ?? "").trim().toLowerCase() === "private") {
    continue;
  }
  const { textVi, textEn } = splitViEn(content);
  index.push({
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    category: String(data.category ?? ""),
    excerpt: data.excerpt != null ? String(data.excerpt) : "",
    textVi,
    textEn,
  });
}

index.sort((a, b) => (a.date < b.date ? 1 : -1));

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(index), "utf8");
console.log(`Wrote ${index.length} entries to public/blog-search-index.json`);
