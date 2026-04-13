---
title: "BeGuru AI — Technical Docs: Tổng quan kiến trúc (runtime, agent, đĩa)"
date: "2026-04-12"
excerpt: "Hiện trạng beguru-ai (FastAPI, Agno, OpenRouter) và kiến trúc đề xuất: MemoryPlane, mem0+Qdrant, LangGraph (+ Temporal khi cần durable), sandbox E2B/Docker, Langfuse+OTel — đồng bộ product plan North Star."
category: gen-ai
layout: case-study
kpis:
  - label_vi: "Orchestrator (đề xuất)"
    label_en: "Orchestrator (target)"
    value: "LangGraph · Temporal*"
  - label_vi: "Memory dài hạn"
    label_en: "Long-term memory"
    value: "MemoryPlane · mem0 · Qdrant"
  - label_vi: "Sandbox"
    label_en: "Sandbox"
    value: "E2B · Docker isolate"
  - label_vi: "Quan sát"
    label_en: "Observability"
    value: "Langfuse · OpenTelemetry"
---

> **Chuỗi BeGuru — Technical Docs**  
> [0. Tổng quan](/blog/beguru-ai-architecture-overview) · [1. Design & đĩa](/blog/beguru-ai-case-study-design-system-disk) · [2. Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) · [3. Memory & context](/blog/beguru-ai-case-study-memory-context-layers) · [4. Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) · [5. Technical Narrative](/blog/beguru-ai-technical-narrative) · [6. AIO Sandbox](/blog/beguru-ai-aio-sandbox-integration)

## VI

### Tóm lược

- **BeGuru AI** (service `beguru-ai`) là backend **FastAPI** gắn **AgentOS (Agno)**; các route `/api/freetext/*`, `/api/workflows/*`, … điều phối **PM** và **Engineer** gọi LLM qua **OpenRouter**, ghi kết quả xuống **`projects_root_dir`** (Next.js / Go) cùng cây **`design-system/`** trong mỗi project FE.
- **Tài liệu gốc (SSOT)** trong repo: `docs/ARCHITECTURE_RUNTIME.md`, `docs/MEMORY_AND_CONTEXT_LAYERS.md`, `docs/API_SPEC.md`.
- **Thứ tự đọc đề xuất:** bài này (map) → [Design & đĩa](/blog/beguru-ai-case-study-design-system-disk) → [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) → [Memory](/blog/beguru-ai-case-study-memory-context-layers) → [Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) → [Technical Narrative](/blog/beguru-ai-technical-narrative) (mental model & SSOT tóm tắt) → [AIO Sandbox](/blog/beguru-ai-aio-sandbox-integration) (thực thi cô lập — lộ trình).

### Hiện trạng vs hướng đi (North Star)

**Hiện tại** hệ chạy theo **request–response / SSE**: client gửi `messages`, server nén context (`ContextCompressor`), ghim pins, Engineer ghi file + (tuỳ flow) kiểm tra tĩnh — **chưa** có graph điều phối đa bước bắt buộc hay sandbox chạy lệnh thống nhất giữa mọi route.

**Hướng sản phẩm** (đối chiếu các assistant dạng **Claude Code**): **autonomous coding** cần vòng lặp **Plan → sửa/ghi đĩa → chạy lệnh trong môi trường cách ly → quan sát stdout/exit → checkpoint**, có thể **đa agent** (PM, Engineer FE, Engineer BE) với handoff có contract (spec, BUILD_STATE, API). Kiến trúc tham chiếu trong ecosystem thường dùng **LangGraph** (hoặc tương đương) cho **state + routing có điều kiện + checkpoint**; ví dụ case study production với **8 agent**, orchestrator–worker, sandbox modal, middleware và caching — xem [FRE|Nxt × InterviewLM — LangGraph multi-agent](https://www.frenxt.com/case-studies/langgraph-multi-agent) *(bài ngoài, không phải BeGuru)*.

BeGuru **không** cam kết đã triển khai đủ các lớp đó; bài [Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) mô tả **một** mảnh lộ trình (memory ngữ nghĩa + Qdrant). Khi spike, nên đo **latency**, **chi phí**, **an toàn sandbox** trước khi gắn vào API công khai.

### Kiến trúc mục tiêu

Artifact-first: file `.guru/` / `design-system` vẫn là nguồn chân lý; nhớ ngữ nghĩa là lớp bổ sung. Về memory, BeGuru vận hành song song ba mặt: (1) short-term trong phiên (RawHistory → ContextCompressor → PinnedLayer), (2) artifact bền trên đĩa (templates, BUILD_STATE, MASTER), và (3) semantic long-term (MemoryPlane → mem0 → vector store). Hover vào ô để thấy luồng dữ liệu; dùng nút mở rộng để xem sơ đồ toàn màn.

**Chú thích màu ô (kind):** `client` / `router` (xanh dương) · `api` (tím) · `agent` (hồng) · `llm` (amber) · `disk` / `template` (xanh lá / cam) · `memory` (đỏ nhạt) · `sandbox` (cyan) · `obs` (xám).

```beguru-flow
{
  "title": "BeGuru — Tầng nhớ & Artifact",
  "hintVi": "Di chuột lên ô để xem luồng; nút mở rộng để đọc toàn màn.",
  "hintEn": "Hover a node to highlight flows; expand to fullscreen to inspect.",
  "layers": [
    ["ft_chat","ft_gen"],
    ["stm_raw","stm_cc"],
    ["stm_pins"],
    ["art_guru","tpl_fe","tpl_be"],
    ["ltm_mp","ltm_mem0","ltm_vs"]
  ],
  "nodes": {
    "ft_chat": {"label":"freetext chat","kind":"router"},
    "ft_gen": {"label":"freetext generate-code","kind":"router"},
    "stm_raw": {"label":"RawHistory","kind":"memory"},
    "stm_cc": {"label":"ContextCompressor","kind":"memory"},
    "stm_pins": {"label":"PinnedLayer","kind":"memory"},
    "art_guru": {"label":".guru / design-system","kind":"disk"},
    "tpl_fe": {"label":"template: Next.js","kind":"template"},
    "tpl_be": {"label":"template: Go","kind":"template"},
    "ltm_mp": {"label":"MemoryPlane facade","kind":"memory"},
    "ltm_mem0": {"label":"mem0 pipeline","kind":"memory"},
    "ltm_vs": {"label":"Qdrant / vector store","kind":"memory"}
  },
  "edges": [
    {"from":"ft_chat","to":"stm_raw"},
    {"from":"ft_gen","to":"stm_raw"},
    {"from":"stm_raw","to":"stm_cc"},
    {"from":"stm_cc","to":"stm_pins"},
    {"from":"stm_pins","to":"art_guru"},
    {"from":"tpl_fe","to":"art_guru","label":"scaffold"},
    {"from":"tpl_be","to":"art_guru","label":"scaffold"},
    {"from":"ft_chat","to":"ltm_mp"},
    {"from":"ft_gen","to":"ltm_mp"},
    {"from":"ltm_mp","to":"ltm_mem0"},
    {"from":"ltm_mp","to":"ltm_vs"},
    {"from":"ltm_mp","to":"stm_pins","label":"top_k inject"}
  ]
}
```

See also: [Memory & context layers](/blog/beguru-ai-case-study-memory-context-layers) · [Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture)

### React Agent loop — orchestrator, sandbox & observe

Autonomous coding cần vòng phản hồi: orchestrator giữ state/checkpoint, router chọn agent phù hợp (PM, FE, BE), agents gọi LLM để sinh nội dung rồi ghi artifact; artifact có thể chạy trong sandbox để quan sát stdout/exit — kết quả quan sát feed ngược về orchestrator để quyết định bước tiếp.

```beguru-flow
{
  "title": "React Agent Workflow — Orchestrator & Sandbox loop",
  "hintVi": "LangGraph điều phối state → router → agent → ghi đĩa → sandbox → observe → feedback.",
  "hintEn": "Orchestrator -> router -> agents -> disk -> sandbox -> observe -> feedback.",
  "layers": [
    ["lg_state"],
    ["lg_router","lg_ckpt"],
    ["ag_pm","ag_fe","ag_be"],
    ["or"],
    ["disk_code","disk_spec"],
    ["sbx_exec","sbx_obs"],
    ["lf_trace"]
  ],
  "nodes": {
    "lg_state": {"label":"State & Checkpoint","kind":"default"},
    "lg_router": {"label":"Conditional Router","kind":"default"},
    "lg_ckpt": {"label":"Checkpoint store","kind":"default"},
    "ag_pm": {"label":"PM Agent","kind":"agent"},
    "ag_fe": {"label":"Engineer FE","kind":"agent"},
    "ag_be": {"label":"Engineer BE","kind":"agent"},
    "or": {"label":"OpenRouter (LLM)","kind":"llm"},
    "disk_code": {"label":"Code output","kind":"disk"},
    "disk_spec": {"label":"Spec / BUILD_STATE","kind":"disk"},
    "sbx_exec": {"label":"SandboxExecutor","kind":"sandbox"},
    "sbx_obs": {"label":"Observe stdout/exit","kind":"sandbox"},
    "lf_trace": {"label":"Langfuse trace","kind":"obs"}
  },
  "edges": [
    {"from":"lg_state","to":"lg_router"},
    {"from":"lg_router","to":"ag_pm"},
    {"from":"lg_router","to":"ag_fe"},
    {"from":"lg_router","to":"ag_be"},
    {"from":"ag_pm","to":"or"},
    {"from":"ag_fe","to":"or"},
    {"from":"ag_be","to":"or"},
    {"from":"ag_fe","to":"disk_code"},
    {"from":"ag_be","to":"disk_code"},
    {"from":"ag_pm","to":"disk_spec"},
    {"from":"disk_code","to":"sbx_exec"},
    {"from":"sbx_exec","to":"sbx_obs"},
    {"from":"sbx_obs","to":"lg_state","label":"observe loop"},
    {"from":"lg_state","to":"lf_trace"}
  ]
}
```

### Tech stack đề xuất (mục tiêu lộ trình)

| Lớp | Đề xuất | Vai trò ngắn |
|-----|---------|--------------|
| **Điều phối đa bước** | **LangGraph** (Python); **Temporal** khi cần durable / chờ người / SLA dài | State, conditional edges, checkpoint; hybrid LangGraph-inside-Temporal nếu cần |
| **MemoryPlane** | Interface nội bộ; backend đầu tiên **mem0** (`AsyncMemory`) | `retrieve` / `commit` thống nhất cho PM + Engineer routes |
| **Vector store** | **Qdrant** (compose); tuỳ chọn **pgvector** nếu gom một Postgres | Semantic search memories; tenant qua `collection` / policy |
| **Sandbox** | **E2B** hoặc **Docker** + giới hạn CPU/time/network | Quan sát sau khi ghi đĩa — gần pattern [case study modal sandbox](https://www.frenxt.com/case-studies/langgraph-multi-agent) |
| **LLM** | **OpenRouter** (giữ) | Tách model rẻ cho extract memory vs model mạnh cho codegen |
| **Quan sát** | **Langfuse** (đã có) + **OpenTelemetry** → Langfuse | Trace graph, tool, sandbox span |
| **Agno** | Giữ registry / MCP / agent class; có thể thu hẹp khi logic chuyển dần sang **node graph** | Không bắt buộc big-bang thay framework |

\*Temporal: tùy spike `stack-spike` (SLO, chi phí vận hành).

### Hiện tại vs đề xuất (một bảng)

| Lớp | Hiện tại (typical) | Đề xuất mục tiêu |
|-----|-------------------|------------------|
| Điều phối | Route FastAPI + stream trực tiếp | LangGraph (+ Temporal khi cần) |
| Nhớ xuyên phiên | Chưa / từng spike mem0 | MemoryPlane → mem0 + Qdrant |
| Kiểm chứng tự động | Static check cục bộ trong flow | Sandbox Plane + vòng Observe |
| Quan sát | Logger + Langfuse tuỳ chọn | Langfuse + OTel end-to-end |

### Mục đích và phạm vi

Bài này **không** thay thế OpenAPI hay tài liệu nội bộ đầy đủ; nó cố định **bối cảnh kiến trúc** và **chỗ các bộ phận gắn với nhau** để đọc tiếp các bài chuyên sâu.

:::warning[Phạm vi]
Luôn đối chiếu repo `beguru-ai` (`docs/API_SPEC.md`, …) với version bạn đang chạy — blog có thể tóm tắt lệch thời điểm.
:::

### Sơ đồ tổng quan (runtime)

Sơ đồ **SVG tương tác** bên dưới: hover vào từng ô để **highlight nhánh** (cạnh và các ô liên quan). Các mã ngắn (`ui`, `api`, …) khớp với bảng đối chiếu ngay sau sơ đồ.

```beguru-flow
{
  "title": "Runtime BeGuru (hover để xem luồng)",
  "hintVi": "Di chuột lên từng khối để làm nổi cạnh nối trực tiếp và ô lân cận.",
  "hintEn": "Hover a node to highlight its incident edges and neighbors.",
  "layers": [
    ["ui"],
    ["api"],
    ["os"],
    ["ft", "wf", "iv", "ag"],
    ["pm", "en", "ar"],
    ["or"],
    ["proj", "tpl", "ds"],
    ["lf", "log"]
  ],
  "nodes": {
    "ui": { "label": "Web / Studio / CLI", "kind": "client" },
    "api": { "label": "FastAPI app", "kind": "api" },
    "os": { "label": "AgentOS (Agno)", "kind": "default" },
    "ft": { "label": "/api/freetext/*", "kind": "router" },
    "wf": { "label": "/api/workflows/*", "kind": "router" },
    "iv": { "label": "/api/interview/*", "kind": "router" },
    "ag": { "label": "/api/agents/*", "kind": "router" },
    "pm": { "label": "ProductManagerAgent", "kind": "agent" },
    "en": { "label": "EngineerAgent", "kind": "agent" },
    "ar": { "label": "Architect / QA / Reviewer", "kind": "agent" },
    "or": { "label": "OpenRouter", "kind": "llm" },
    "proj": { "label": "projects_root_dir", "kind": "disk" },
    "tpl": { "label": "templates", "kind": "disk" },
    "ds": { "label": "design-system / project", "kind": "disk" },
    "lf": { "label": "Langfuse (optional)", "kind": "obs" },
    "log": { "label": "StructuredLogger", "kind": "obs" }
  },
  "edges": [
    { "from": "ui", "to": "api", "label": "HTTPS · JSON · SSE" },
    { "from": "api", "to": "os" },
    { "from": "api", "to": "ft" },
    { "from": "api", "to": "wf" },
    { "from": "api", "to": "iv" },
    { "from": "api", "to": "ag" },
    { "from": "ft", "to": "pm" },
    { "from": "ft", "to": "en" },
    { "from": "wf", "to": "pm" },
    { "from": "wf", "to": "en" },
    { "from": "wf", "to": "ar" },
    { "from": "pm", "to": "or" },
    { "from": "en", "to": "or" },
    { "from": "ar", "to": "or" },
    { "from": "en", "to": "proj" },
    { "from": "en", "to": "tpl" },
    { "from": "en", "to": "ds" },
    { "from": "api", "to": "lf" },
    { "from": "api", "to": "log" }
  ]
}
```

**Đối chiếu nhanh (mã trên sơ đồ):**

| Mã | Thành phần |
|----|------------|
| `ui` | Client (Web / Studio / CLI) |
| `api` | FastAPI — HTTP, CORS, logging |
| `os` | AgentOS Agno — cùng process với API |
| `ft` … `ag` | Các router REST (`freetext`, `workflows`, `interview`, `agents`) |
| `pm`, `en`, `ar` | Agent PM / Engineer / kiến trúc & QA |
| `or` | OpenRouter (gateway model) |
| `proj`, `tpl`, `ds` | Artifact trên đĩa (project, template, design-system) |
| `lf`, `log` | Langfuse (tuỳ chọn) và StructuredLogger |

### Bảng thành phần

| Thành phần | Vai trò | Ghi chú / artifact | Bài liên quan |
|------------|---------|-------------------|---------------|
| **FastAPI** | HTTP server, CORS, logging, `/health` | `src.api.main` | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **AgentOS (Agno)** | Registry agent, khởi tạo framework agent | Cùng process với API | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **Routers** | `freetext`, `workflows`, `interview`, `agents` | Include từ `main.py` | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **PM Agent** | Thảo luận spec, handoff `LABEL_*`, khối `## BEGURU_FE_SPEC` / BE | Stream SSE | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **Engineer Agent** | `generate-code`, `edit-code`, `generate-backend` (Go) | Ghi file theo `output_path` | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos), [Design & đĩa](/blog/beguru-ai-case-study-design-system-disk) |
| **OpenRouter** | Gateway tới các model; attribution header (Referer / title) | Env model trong Settings | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **Artifact đĩa** | `MASTER.md`, `BUILD_STATE.md`, `PRODUCT_PLAN.md`, `beguru_chat_context.json` | Dưới `design-system/` mỗi project | [Design & đĩa](/blog/beguru-ai-case-study-design-system-disk) |
| **Context pipeline** | Nén history, ghim pins, context pack cho Engineer | `ContextCompressor`, v.v. | [Memory](/blog/beguru-ai-case-study-memory-context-layers) |
| **SQLite (Agno)** | Session / workflow / optional persist summary | `data/agno.db` (cấu hình tuỳ môi trường) | [Memory](/blog/beguru-ai-case-study-memory-context-layers) |
| **Memory xuyên phiên (lộ trình)** | Facts theo `user_id`, semantic search | mem0 + Qdrant, inject ở route — xem bài Mem0 | [Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) |

### Tech stack hiện tại (điển hình)

| Lớp | Công nghệ |
|-----|-----------|
| Runtime | Python, FastAPI, Uvicorn |
| Agents | Agno AgentOS, agents PM / Engineer / … |
| LLM | OpenRouter (model cấu hình qua `.env` / Settings) |
| Output FE | Template Next.js (`templates/guru-nextjs-template`), rule `.guru/rules/` |
| Output BE | Template Go (`templates/beguru-go-template-be`), pipeline `init-go-project` → `backend-spec/*` → `generate-backend` |
| Quan sát | StructuredLogger; Langfuse tuỳ chọn |
| Lộ trình | Xem mục **Kiến trúc đề xuất** và **Tech stack đề xuất** phía trên |

### Luồng sản phẩm chính (FE trước)

```mermaid
sequenceDiagram
  participant C as Client
  participant Chat as POST /api/freetext/chat
  participant PM as PM Agent
  participant Gen as POST /api/freetext/generate-code
  participant EN as Engineer Agent
  participant FS as Project files

  C->>Chat: messages SSE
  Chat->>PM: OpenRouter
  PM-->>C: stream + handoff + BEGURU_FE_SPEC khi sẵn sàng
  C->>Gen: messages + output_path + optional feature_spec
  Note over Gen: Parse spec context pack MASTER BUILD_STATE
  Gen->>EN: stream_code_generation
  EN->>FS: ghi khối code xuống đĩa
  EN-->>C: SSE chunks
```

Luồng Go backend (sau FE, có gate `backend-spec`) được mô tả trong `ARCHITECTURE_RUNTIME.md` và [bài Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos).

### Tham chiếu trong repo `beguru-ai`

- `docs/ARCHITECTURE_RUNTIME.md` — sơ đồ, bảng thành phần, deploy điển hình.
- `docs/API_SPEC.md` — contract HTTP, `output_path`, field request/response.
- `docs/MEMORY_AND_CONTEXT_LAYERS.md` — pipeline nén, pins, artifact.

---

## EN

### At a glance

- **BeGuru AI** (`beguru-ai`) is a **FastAPI** service backed by **AgentOS (Agno)**. Routes under `/api/freetext/*`, `/api/workflows/*`, … orchestrate **PM** and **Engineer** agents calling LLMs via **OpenRouter**, persisting output under **`projects_root_dir`** (Next.js / Go) and per-project **`design-system/`** trees.
- **Source of truth** in the repo: `docs/ARCHITECTURE_RUNTIME.md`, `docs/MEMORY_AND_CONTEXT_LAYERS.md`, `docs/API_SPEC.md`.
- **Suggested reading order:** this post (map) → [Design & disk](/blog/beguru-ai-case-study-design-system-disk) → [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) → [Memory](/blog/beguru-ai-case-study-memory-context-layers) → [Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) → [Technical Narrative](/blog/beguru-ai-technical-narrative) (mental model & SSOT summary) → [AIO Sandbox](/blog/beguru-ai-aio-sandbox-integration) (isolated execution — roadmap).

### Current state vs North Star

**Today** the system is primarily **request/SSE**: clients send `messages`, the server compresses context (`ContextCompressor`), applies pins, and the Engineer writes files and may run static checks — there is **no** mandatory multi-step orchestration graph or unified command sandbox across all routes yet.

**Product direction** (benchmarks like **Claude Code**): **autonomous coding** needs a loop **Plan → edit/write disk → run commands in isolation → observe stdout/exit → checkpoint**, optionally **multi-agent** (PM, FE engineer, BE engineer) with structured handoffs (spec, BUILD_STATE, API). The wider ecosystem often uses **LangGraph** (or similar) for **state, conditional routing, and checkpoints**. An external production write-up with **8 specialized agents**, orchestrator–worker layout, modal sandbox, and middleware/caching is [FRE|Nxt × InterviewLM — LangGraph multi-agent case study](https://www.frenxt.com/case-studies/langgraph-multi-agent) *(third-party; not BeGuru)*.

BeGuru does **not** claim full implementation of those layers yet; [Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) describes **one** roadmap slice (semantic memory + Qdrant). Spike with **latency**, **cost**, and **sandbox safety** before binding to public API contracts.

### Target architecture

Artifact-first: `.guru/` and project `design-system` form the durable artifact layer; semantic memory is additive. BeGuru's memory architecture spans short-term (in-session), durable artifacts on disk (templates, BUILD_STATE), and a roadmap semantic plane (MemoryPlane → mem0 → vector store). Use the diagram below to read flows; expand to fullscreen for detail.

**Legend (node `kind`):** `client` / `router` (sky) · `api` (violet) · `agent` (fuchsia) · `llm` (amber) · `disk` / `template` (emerald / orange) · `memory` (rose) · `sandbox` (cyan) · `obs` (zinc).

```beguru-flow
{
  "title": "BeGuru — Memory & Artifacts (overview)",
  "hintVi": "Hover nodes to reveal connected flows; expand for fullscreen.",
  "hintEn": "Hover nodes to reveal connected flows; expand for fullscreen.",
  "layers": [
    ["ft_chat","ft_gen"],
    ["stm_raw","stm_cc"],
    ["stm_pins"],
    ["art_guru","tpl_fe","tpl_be"],
    ["ltm_mp","ltm_mem0","ltm_vs"]
  ],
  "nodes": {
    "ft_chat": {"label":"freetext chat","kind":"router"},
    "ft_gen": {"label":"freetext generate-code","kind":"router"},
    "stm_raw": {"label":"RawHistory","kind":"memory"},
    "stm_cc": {"label":"ContextCompressor","kind":"memory"},
    "stm_pins": {"label":"PinnedLayer","kind":"memory"},
    "art_guru": {"label":".guru / design-system","kind":"disk"},
    "tpl_fe": {"label":"template: Next.js","kind":"template"},
    "tpl_be": {"label":"template: Go","kind":"template"},
    "ltm_mp": {"label":"MemoryPlane facade","kind":"memory"},
    "ltm_mem0": {"label":"mem0 pipeline","kind":"memory"},
    "ltm_vs": {"label":"Qdrant / vector store","kind":"memory"}
  },
  "edges": [
    {"from":"ft_chat","to":"stm_raw"},
    {"from":"ft_gen","to":"stm_raw"},
    {"from":"stm_raw","to":"stm_cc"},
    {"from":"stm_cc","to":"stm_pins"},
    {"from":"stm_pins","to":"art_guru"},
    {"from":"tpl_fe","to":"art_guru","label":"scaffold"},
    {"from":"tpl_be","to":"art_guru","label":"scaffold"},
    {"from":"ft_chat","to":"ltm_mp"},
    {"from":"ft_gen","to":"ltm_mp"},
    {"from":"ltm_mp","to":"ltm_mem0"},
    {"from":"ltm_mp","to":"ltm_vs"},
    {"from":"ltm_mp","to":"stm_pins","label":"top_k inject"}
  ]
}
```

### React Agent loop — orchestrator, sandbox & observe

Autonomous coding requires a closed feedback loop: an orchestrator manages state/checkpoints and routes tasks to role-specific agents (PM, FE, BE); agents call LLMs, write artifacts, and optionally run them in a sandbox. Sandbox observations (stdout/exit) feed back into the orchestrator to decide next steps.

```beguru-flow
{
  "title": "React Agent Workflow — Orchestrator & Sandbox loop (EN)",
  "hintVi": "LangGraph coordinates state → router → agents → disk → sandbox → observe → feedback.",
  "hintEn": "Orchestrator -> router -> agents -> disk -> sandbox -> observe -> feedback.",
  "layers": [
    ["lg_state"],
    ["lg_router","lg_ckpt"],
    ["ag_pm","ag_fe","ag_be"],
    ["or"],
    ["disk_code","disk_spec"],
    ["sbx_exec","sbx_obs"],
    ["lf_trace"]
  ],
  "nodes": {
    "lg_state": {"label":"State & Checkpoint","kind":"default"},
    "lg_router": {"label":"Conditional Router","kind":"default"},
    "lg_ckpt": {"label":"Checkpoint store","kind":"default"},
    "ag_pm": {"label":"PM Agent","kind":"agent"},
    "ag_fe": {"label":"Engineer FE","kind":"agent"},
    "ag_be": {"label":"Engineer BE","kind":"agent"},
    "or": {"label":"OpenRouter (LLM)","kind":"llm"},
    "disk_code": {"label":"Code output","kind":"disk"},
    "disk_spec": {"label":"Spec / BUILD_STATE","kind":"disk"},
    "sbx_exec": {"label":"SandboxExecutor","kind":"sandbox"},
    "sbx_obs": {"label":"Observe stdout/exit","kind":"sandbox"},
    "lf_trace": {"label":"Langfuse trace","kind":"obs"}
  },
  "edges": [
    {"from":"lg_state","to":"lg_router"},
    {"from":"lg_router","to":"ag_pm"},
    {"from":"lg_router","to":"ag_fe"},
    {"from":"lg_router","to":"ag_be"},
    {"from":"ag_pm","to":"or"},
    {"from":"ag_fe","to":"or"},
    {"from":"ag_be","to":"or"},
    {"from":"ag_fe","to":"disk_code"},
    {"from":"ag_be","to":"disk_code"},
    {"from":"ag_pm","to":"disk_spec"},
    {"from":"disk_code","to":"sbx_exec"},
    {"from":"sbx_exec","to":"sbx_obs"},
    {"from":"sbx_obs","to":"lg_state","label":"observe loop"},
    {"from":"lg_state","to":"lf_trace"}
  ]
}
```

### Proposed tech stack (target roadmap)

| Layer | Proposal | Short role |
|-------|----------|------------|
| **Multi-step orchestration** | **LangGraph** (Python); **Temporal** when durable execution / human waits / long SLA | State, conditional edges, checkpoints; optional LangGraph-inside-Temporal |
| **MemoryPlane** | Internal interface; first backend **mem0** (`AsyncMemory`) | Unified `retrieve` / `commit` for PM + Engineer routes |
| **Vector store** | **Qdrant** (compose); optional **pgvector** if consolidating on Postgres | Semantic memory search; tenant via collection / policy |
| **Sandbox** | **E2B** or **Docker** + CPU/time/network limits | Post-write observation — similar to [modal sandbox in this case study](https://www.frenxt.com/case-studies/langgraph-multi-agent) |
| **LLM** | **OpenRouter** (keep) | Cheap model for memory extract vs strong model for codegen |
| **Observability** | **Langfuse** (existing) + **OpenTelemetry** → Langfuse | Trace graph, tools, sandbox spans |
| **Agno** | Keep registry / MCP / agent classes; may narrow as logic moves to **graph nodes** | No mandatory big-bang framework swap |

\*Temporal: subject to `stack-spike` (SLO, ops cost).

### Current vs proposed (one table)

| Layer | Current (typical) | Target proposal |
|-------|-------------------|-------------------|
| Orchestration | FastAPI routes + direct streams | LangGraph (+ Temporal if needed) |
| Cross-session memory | Not yet / mem0 spike path | MemoryPlane → mem0 + Qdrant |
| Automated verification | Local static checks in flow | Sandbox Plane + Observe loop |
| Observability | Logger + optional Langfuse | Langfuse + OTel end-to-end |

### Purpose and scope

This post is **not** a substitute for the full OpenAPI or internal docs; it anchors **system context** and **how major pieces connect** before you read the deep dives.

:::warning[Scope]
Always verify against the `beguru-ai` repo (`docs/API_SPEC.md`, …) for the version you run — this blog may lag behind.
:::

### High-level runtime diagram

Interactive **SVG** below: **hover** a box to highlight its **incident edges** and **neighbors**. Short ids (`ui`, `api`, …) match the lookup table right after the diagram.

```beguru-flow
{
  "title": "BeGuru runtime (hover to trace flow)",
  "hintVi": "Di chuột lên từng khối để làm nổi cạnh nối trực tiếp và ô lân cận.",
  "hintEn": "Hover a node to highlight its incident edges and neighbors.",
  "layers": [
    ["ui"],
    ["api"],
    ["os"],
    ["ft", "wf", "iv", "ag"],
    ["pm", "en", "ar"],
    ["or"],
    ["proj", "tpl", "ds"],
    ["lf", "log"]
  ],
  "nodes": {
    "ui": { "label": "Web / Studio / CLI", "kind": "client" },
    "api": { "label": "FastAPI app", "kind": "api" },
    "os": { "label": "AgentOS (Agno)", "kind": "default" },
    "ft": { "label": "/api/freetext/*", "kind": "router" },
    "wf": { "label": "/api/workflows/*", "kind": "router" },
    "iv": { "label": "/api/interview/*", "kind": "router" },
    "ag": { "label": "/api/agents/*", "kind": "router" },
    "pm": { "label": "ProductManagerAgent", "kind": "agent" },
    "en": { "label": "EngineerAgent", "kind": "agent" },
    "ar": { "label": "Architect / QA / Reviewer", "kind": "agent" },
    "or": { "label": "OpenRouter", "kind": "llm" },
    "proj": { "label": "projects_root_dir", "kind": "disk" },
    "tpl": { "label": "templates", "kind": "disk" },
    "ds": { "label": "design-system / project", "kind": "disk" },
    "lf": { "label": "Langfuse (optional)", "kind": "obs" },
    "log": { "label": "StructuredLogger", "kind": "obs" }
  },
  "edges": [
    { "from": "ui", "to": "api", "label": "HTTPS · JSON · SSE" },
    { "from": "api", "to": "os" },
    { "from": "api", "to": "ft" },
    { "from": "api", "to": "wf" },
    { "from": "api", "to": "iv" },
    { "from": "api", "to": "ag" },
    { "from": "ft", "to": "pm" },
    { "from": "ft", "to": "en" },
    { "from": "wf", "to": "pm" },
    { "from": "wf", "to": "en" },
    { "from": "wf", "to": "ar" },
    { "from": "pm", "to": "or" },
    { "from": "en", "to": "or" },
    { "from": "ar", "to": "or" },
    { "from": "en", "to": "proj" },
    { "from": "en", "to": "tpl" },
    { "from": "en", "to": "ds" },
    { "from": "api", "to": "lf" },
    { "from": "api", "to": "log" }
  ]
}
```

**Quick id lookup (diagram):**

| Id | Piece |
|----|--------|
| `ui` | Client (Web / Studio / CLI) |
| `api` | FastAPI — HTTP, CORS, logging |
| `os` | AgentOS Agno — same process as API |
| `ft` … `ag` | REST routers (`freetext`, `workflows`, `interview`, `agents`) |
| `pm`, `en`, `ar` | PM / Engineer / architecture & QA agents |
| `or` | OpenRouter (model gateway) |
| `proj`, `tpl`, `ds` | On-disk artifacts (project tree, templates, design-system) |
| `lf`, `log` | Optional Langfuse and StructuredLogger |

### Component map

| Component | Role | Notes / artifact | Related post |
|-----------|------|------------------|--------------|
| **FastAPI** | HTTP server, CORS, logging, `/health` | `src.api.main` | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **AgentOS (Agno)** | Agent registry, framework hooks | Same process as API | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **Routers** | `freetext`, `workflows`, `interview`, `agents` | Included from `main.py` | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **PM Agent** | Spec chat, handoff tags, `## BEGURU_FE_SPEC` | SSE stream | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **Engineer Agent** | `generate-code`, `edit-code`, `generate-backend` | Writes under `output_path` | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos), [Design & disk](/blog/beguru-ai-case-study-design-system-disk) |
| **OpenRouter** | Model gateway; Referer/title attribution | Models from Settings / `.env` | [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) |
| **Disk artifacts** | `MASTER.md`, `BUILD_STATE.md`, `PRODUCT_PLAN.md`, `beguru_chat_context.json` | Under each project `design-system/` | [Design & disk](/blog/beguru-ai-case-study-design-system-disk) |
| **Context pipeline** | Compress history, pins, Engineer context pack | `ContextCompressor`, etc. | [Memory](/blog/beguru-ai-case-study-memory-context-layers) |
| **SQLite (Agno)** | Sessions / workflows / optional summary persist | `data/agno.db` (env-dependent) | [Memory](/blog/beguru-ai-case-study-memory-context-layers) |
| **Cross-session memory (roadmap)** | Facts keyed by `user_id`, semantic retrieval | mem0 + Qdrant at route — see Mem0 post | [Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) |

### Current tech stack (typical)

| Layer | Technology |
|-------|------------|
| Runtime | Python, FastAPI, Uvicorn |
| Agents | Agno AgentOS, PM / Engineer / … |
| LLM | OpenRouter (models via `.env` / Settings) |
| FE output | Next.js template (`guru-nextjs-template`), `.guru/rules/` |
| BE output | Go template (`beguru-go-template-be`), `init-go-project` → `backend-spec/*` → `generate-backend` |
| Observability | StructuredLogger; optional Langfuse |
| Roadmap | See **Proposed architecture** and **Proposed tech stack** above |

### Primary product flow (frontend-first)

```mermaid
sequenceDiagram
  participant C as Client
  participant Chat as POST /api/freetext/chat
  participant PM as PM Agent
  participant Gen as POST /api/freetext/generate-code
  participant EN as Engineer Agent
  participant FS as Project files

  C->>Chat: messages SSE
  Chat->>PM: OpenRouter
  PM-->>C: stream + handoff + BEGURU_FE_SPEC when ready
  C->>Gen: messages + output_path + optional feature_spec
  Note over Gen: Parse spec context pack MASTER BUILD_STATE
  Gen->>EN: stream_code_generation
  EN->>FS: write code blocks to disk
  EN-->>C: SSE chunks
```

The Go backend pipeline (gates via `backend-spec`) is detailed in `ARCHITECTURE_RUNTIME.md` and the [Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) post.

### References in the `beguru-ai` repo

- `docs/ARCHITECTURE_RUNTIME.md` — diagrams, component table, typical deployment.
- `docs/API_SPEC.md` — HTTP contract, `output_path`, request/response fields.
- `docs/MEMORY_AND_CONTEXT_LAYERS.md` — compression, pins, artifacts.
