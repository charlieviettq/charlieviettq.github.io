# charlieviettq.github.io

Personal site (Next.js **static export**) deployed to **GitHub Pages** via GitHub Actions.

- **Live:** https://charlieviettq.github.io/
- **Local:** `npm ci && npm run dev`
- **Production build:** `npm run build` → output in `out/`

## Content

- Edit pages in `app/`.
- Blog posts: add Markdown files under `content/posts/` (front matter: `title`, `date`, optional `excerpt`).

### Doc blocks (Confluence-style)

Bài dùng [remark-directive](https://github.com/remarkjs/remark-directive): khối `:::tên` … `:::` (container). Hỗ trợ trên trang bài (`BlogPostBody`).

| Khối | Cú pháp | Ghi chú |
|------|---------|---------|
| Note / info / tip / warning / success / quote / todo | `:::note[Tiêu đề tùy chọn]` rồi nội dung, kết thúc `:::` | Tiêu đề trong `[...]` là dòng label; không có `[]` thì chỉ nội dung. |
| Expand (details) | `:::expand[Tóm tắt]` … `:::` | Render `<details>` / summary có thể mở/đóng. |
| Divider | `---` trên một dòng | `<hr>` có style chấm. |
| **BeGuru flow (React Flow)** | Fence ` ```beguru-flow ` + JSON | [`@xyflow/react`](https://reactflow.dev/): `layers`, `nodes`, `edges` — pan/zoom, hover highlight. Dùng cho sơ đồ kiến trúc tùy chỉnh. |
| Mermaid | Fence ` ```mermaid ` | Render SVG qua `mermaid` (sequenceDiagram, flowchart, …). **Sequence / diagram đặc thù** vẫn dùng Mermaid; sơ đồ runtime có cấu trúc cột nên ưu tiên `beguru-flow`. |
| Diagram (SVG/PNG tĩnh) | `:::diagram[Caption ngắn]` + `![](/blog/diagrams/<slug>/…)` … `:::` | Khung/caption đồng bộ `chart-glow-frame`; asset commit vào repo (không generate trong CI). |

### Diagrams (Fireworks / static assets)

- **Khi nào:** Sơ đồ “hero”, typography/legend rõ, hoặc brand look — export **SVG** (tuỳ chọn **PNG** ~1920px cho Retina/social) và commit vào repo.
- **Khi nào không:** Sơ đồ nhanh, lặp lại, sequence đơn giản → dùng **Mermaid** (đã có).
- **Đường dẫn:** `public/blog/diagrams/<post-slug>/<tên-mô-tả>.svg` — URL trong Markdown: `/blog/diagrams/<post-slug>/<tên>.svg`.
- **Quy trình (tóm tắt):** phân loại diagram → chọn layout → style reference (Flat Icon / warm palette blog) → viết/validate SVG → commit → embed trong bài; có thể validate PNG bằng `rsvg-convert` nếu bạn export PNG local.

Ví dụ:

```markdown
:::warning
API có thể đổi theo version beguru-ai — đối chiếu `docs/API_SPEC.md`.
:::

:::expand[Chi tiết thêm]
Đoạn dài có thể thu gọn.
:::

:::diagram[Caption dưới khung — ví dụ outcome window]

![Mô tả alt ngắn](/blog/diagrams/my-post-slug/my-diagram.svg)

:::
```

## GitHub Pages setup

1. Repository **Settings → Pages**: set **Source** to **GitHub Actions**.
2. Push to `main`; the workflow publishes the `out/` artifact.
