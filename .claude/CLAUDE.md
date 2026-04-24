# charlieviettq.github.io — Claude Code Instructions

## Project

Personal blog / portfolio — Next.js 15.5 App Router, static export for GitHub Pages, Tailwind CSS v4, bilingual content (VI/EN).

## Skills

@.claude/skills/vercel-labs/next-skills/skills/next-best-practices/SKILL.md
@.claude/skills/vercel-labs/next-skills/skills/next-cache-components/SKILL.md
@.claude/skills/vercel-labs/next-skills/skills/next-upgrade/SKILL.md

## Key Constraints

- `output: "export"` in `next.config.ts` — no server-side features (no API routes, no SSR, no streaming)
- Tailwind v4: no `tailwind.config.js`; all tokens in `app/globals.css` via `@theme inline` block
- Bilingual posts: split by `## VI` / `## EN` markers in markdown; do not break this structure
- Font variables: `--font-exo` (Exo 2) and `--font-roboto-mono` (Roboto Mono) set in `app/layout.tsx`
- Brand colors: gold `#F59E0B` (primary), purple `#8B5CF6` (secondary) — defined as `--brand-from` / `--brand-to`
- Category pills: banking → amber, gen-ai → purple, data-science → sky, data-engineering → indigo

## Do Not Touch

- `app/globals.css` lines 62–139 (diagram/architecture CSS classes)
- `ThemeProvider.tsx` (entire file)
- `components/blog/BeguruFlowDiagram.tsx`, `ArchitectureFigure.tsx`, `MermaidBlock.tsx`
- Rehype/remark plugin pipeline in `BlogPostBody.tsx`
