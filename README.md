# charlieviettq.github.io

Personal site (Next.js **static export**) deployed to **GitHub Pages** via GitHub Actions.

- **Live:** https://charlieviettq.github.io/
- **Local:** `npm ci && npm run dev`
- **Production build:** `npm run build` → output in `out/`

## Content

- Edit pages in `app/`.
- Blog posts: add Markdown files under `content/posts/` (front matter: `title`, `date`, optional `excerpt`).

## GitHub Pages setup

1. Repository **Settings → Pages**: set **Source** to **GitHub Actions**.
2. Push to `main`; the workflow publishes the `out/` artifact.
