---
title: "BeGuru AI — AIO Sandbox: component thực thi cô lập (lộ trình)"
date: "2026-04-12"
excerpt: "Tài liệu kiến trúc trên blog: vì sao baseline chạy test/build trên host, AIO Sandbox (shell, file, MCP Hub, preview), SandboxExecutor, điểm tích hợp — SSOT trong repo beguru-ai/docs/AIO_SANDBOX_INTEGRATION.md."
category: gen-ai
layout: case-study
kpis:
  - label_vi: "Trạng thái"
    label_en: "Status"
    value: "Lộ trình · chưa merge"
  - label_vi: "Thay thế"
    label_en: "Replaces"
    value: "subprocess trên host"
  - label_vi: "Component"
    label_en: "Component"
    value: "SandboxExecutor"
  - label_vi: "SSOT"
    label_en: "SSOT"
    value: "docs/ trong repo"
---

> **Chuỗi BeGuru — Technical Docs**  
> [0. Tổng quan](/blog/beguru-ai-architecture-overview) · [1. Design & đĩa](/blog/beguru-ai-case-study-design-system-disk) · [2. Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) · [3. Memory & context](/blog/beguru-ai-case-study-memory-context-layers) · [4. Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) · [5. Technical Narrative](/blog/beguru-ai-technical-narrative) · **6. AIO Sandbox (bài này)**

## VI

### Tóm lược

- **Chưa triển khai** trong code mặc định — đây là **hợp đồng kiến trúc** cho lớp **thực thi cô lập**, bám plan *AIO Sandbox Integration* và file SSOT trong repo **`beguru-ai/docs/AIO_SANDBOX_INTEGRATION.md`**.
- **Mục tiêu:** thay `subprocess` trên **host** (Jest, Playwright, preview `Popen`, static check / `docker_mode` stub) bằng service **AIO Sandbox** (HTTP + SDK `agent-sandbox`): shell, file, browser, MCP Hub, port proxy.
- **Không** thay thế artifact-first (`.guru/`, repo trên đĩa); sandbox chỉ đổi **nơi chạy lệnh nguy hiểm** — khác hẳn **memory plane** (Mem0).

### Vì sao cần (baseline đang thiếu gì?)

| Khu vực | Baseline | Rủi ro |
|---------|----------|--------|
| Test | `subprocess` trên OS cùng API | Không cô lập session; nhiễu môi trường |
| Build / static | Host + nhánh docker có thể **stub** | Không hermetic như CI |
| Preview | Spawn dev server trên host | Trùng port, ảnh hưởng máy chạy API |
| MCP | stdio gần filesystem host | LLM-generated code “gần” host |

Chi tiết giới hạn baseline: [Technical Narrative](/blog/beguru-ai-technical-narrative), mục Limitations.

### AIO Sandbox (khả năng mục tiêu)

**Giả định:** một container/service expose API; cấu hình `SANDBOX_URL` / `sandbox_url` trong Settings (chốt lúc code).

| Surface | Vai trò |
|---------|---------|
| Shell exec | `jest`, `playwright`, `bun run build` trong container |
| Filesystem API | Đồng bộ project → workspace sandbox trước exec |
| Browser / screenshot | QA multimodal |
| MCP Hub `/mcp` | shell, file, browser qua SSE — bổ sung `SseServerParameters` trong MCP client |
| Port proxy | Preview không bind port trực tiếp trên host API |

### Component đề xuất

- **`SandboxExecutor`** — `src/components/sandbox/sandbox_executor.py`: bọc SDK, `run_shell`, `sync_project`, (tuỳ chọn) screenshot; trả stdout/stderr/exit chuẩn hoá; timeout / giới hạn output.
- **Singleton** client — tránh tạo mới mỗi request.

```beguru-flow
{
  "title": "beguru-ai ↔ AIO Sandbox (SVG tương tác)",
  "hintVi": "Hover vào QAAgent, project_validation hoặc MCP để thấy nhánh sang sandbox.",
  "hintEn": "Hover QA, validation, or MCP to see branches into the sandbox plane.",
  "layers": [
    ["qa", "val", "prev", "mcp"],
    ["sh", "fs", "br", "hub", "px"],
    ["iso"]
  ],
  "nodes": {
    "qa": { "label": "QAAgent", "kind": "agent" },
    "val": { "label": "project_validation", "kind": "router" },
    "prev": { "label": "preview route", "kind": "api" },
    "mcp": { "label": "MCPClient", "kind": "api" },
    "sh": { "label": "Shell", "kind": "sandbox" },
    "fs": { "label": "File API", "kind": "sandbox" },
    "br": { "label": "Browser /\nscreenshot", "kind": "sandbox" },
    "hub": { "label": "MCP Hub\n/mcp", "kind": "sandbox" },
    "px": { "label": "Port proxy", "kind": "sandbox" },
    "iso": { "label": "Container\ncô lập", "kind": "default" }
  },
  "edges": [
    { "from": "qa", "to": "sh" },
    { "from": "qa", "to": "br" },
    { "from": "val", "to": "sh" },
    { "from": "prev", "to": "px" },
    { "from": "mcp", "to": "hub" },
    { "from": "sh", "to": "iso" }
  ]
}
```

**Chú thích:** `fs` (đồng bộ cây project trước khi chạy lệnh) nằm cùng mặt phẳng sandbox nhưng không có cạnh riêng trên sơ đồ tối giản — xem SSOT repo.

### Điểm tích hợp (theo plan)

| Điểm đụng | File gợi ý |
|-----------|------------|
| Test runner | `mcp_servers/test_runner_server.py` |
| Docker / build | `src/components/project_validation/service.py` |
| MCP xa | `src/mcp/client.py` |
| Preview | `src/api/routes/preview.py` |
| QA | `src/agents/qa.py` |
| Infra | `docker/docker-compose.yml` → service `aio-sandbox` |

### Lộ trình (8 bước)

Settings + singleton → `SandboxExecutor` → refactor test runner → `docker_mode` thật → MCP SSE → preview → QA screenshot → compose.

### SSOT

Bản đầy đủ bảng trạng thái, sơ đồ kiến trúc sau tích hợp, rủi ro / test: **`beguru-ai/docs/AIO_SANDBOX_INTEGRATION.md`** trong repo (cập nhật khi merge từng PR).

---

## EN

### At a glance

- **Not shipped by default** — this post is the **architecture contract** for an **isolated execution plane**, aligned with the internal *AIO Sandbox Integration* plan. Full SSOT: **`beguru-ai/docs/AIO_SANDBOX_INTEGRATION.md`** in the repo.
- **Goal:** replace **host `subprocess`** (Jest, Playwright, preview `Popen`, static / stub `docker_mode`) with an **AIO Sandbox** service (HTTP + `agent-sandbox` SDK): shell, file, browser, MCP Hub, port proxy.
- **Does not** replace artifact-first truth on disk (`.guru/`); sandbox only changes **where dangerous commands run** — distinct from the **memory plane** (Mem0).

### Why (what baseline lacks)

| Area | Baseline | Risk |
|------|----------|------|
| Tests | `subprocess` on same OS as API | No session isolation; environment bleed |
| Build / static | Host + docker branch may be **stub** | Not hermetic like CI |
| Preview | Dev server on host | Port clashes |
| MCP | stdio near host FS | LLM-generated code runs too close to API host |

See [Technical Narrative](/blog/beguru-ai-technical-narrative), Limitations.

### AIO Sandbox (target capabilities)

**Assumption:** a container exposes an API; configure `SANDBOX_URL` / `sandbox_url` in Settings when implemented.

| Surface | Role |
|---------|------|
| Shell exec | `jest`, `playwright`, `bun run build` inside container |
| Filesystem API | Sync project tree into sandbox workspace before exec |
| Browser / screenshot | Multimodal QA |
| MCP Hub `/mcp` | shell, file, browser via SSE |
| Port proxy | Preview without binding ports on the API host |

### Proposed component

- **`SandboxExecutor`** — e.g. `src/components/sandbox/sandbox_executor.py`: wrap SDK, `run_shell`, `sync_project`, optional screenshot; normalized stdout/stderr/exit; timeouts.
- **Singleton** client.

```beguru-flow
{
  "title": "beguru-ai ↔ AIO Sandbox (interactive SVG)",
  "hintVi": "Hover vào QAAgent, project_validation hoặc MCP để thấy nhánh sang sandbox.",
  "hintEn": "Hover QA, validation, or MCP to see branches into the sandbox plane.",
  "layers": [
    ["qa", "val", "prev", "mcp"],
    ["sh", "fs", "br", "hub", "px"],
    ["iso"]
  ],
  "nodes": {
    "qa": { "label": "QAAgent", "kind": "agent" },
    "val": { "label": "project_validation", "kind": "router" },
    "prev": { "label": "preview route", "kind": "api" },
    "mcp": { "label": "MCPClient", "kind": "api" },
    "sh": { "label": "Shell", "kind": "sandbox" },
    "fs": { "label": "File API", "kind": "sandbox" },
    "br": { "label": "Browser /\nscreenshot", "kind": "sandbox" },
    "hub": { "label": "MCP Hub\n/mcp", "kind": "sandbox" },
    "px": { "label": "Port proxy", "kind": "sandbox" },
    "iso": { "label": "Isolated\ncontainer", "kind": "default" }
  },
  "edges": [
    { "from": "qa", "to": "sh" },
    { "from": "qa", "to": "br" },
    { "from": "val", "to": "sh" },
    { "from": "prev", "to": "px" },
    { "from": "mcp", "to": "hub" },
    { "from": "sh", "to": "iso" }
  ]
}
```

**Note:** `fs` (project tree sync before exec) sits on the sandbox plane but has no dedicated edge on this minimal diagram — see repo SSOT.

### Integration touchpoints (from plan)

| Touchpoint | Suggested file |
|------------|----------------|
| Test runner | `mcp_servers/test_runner_server.py` |
| Docker / build | `src/components/project_validation/service.py` |
| Remote MCP | `src/mcp/client.py` |
| Preview | `src/api/routes/preview.py` |
| QA | `src/agents/qa.py` |
| Infra | `docker/docker-compose.yml` → `aio-sandbox` service |

### Rollout (8 steps)

Settings + singleton → `SandboxExecutor` → test runner refactor → real `docker_mode` → MCP SSE → preview → QA screenshots → compose.

### SSOT

Full tables, target architecture diagram, risks/tests: **`beguru-ai/docs/AIO_SANDBOX_INTEGRATION.md`** in the repository (update as each PR lands).
