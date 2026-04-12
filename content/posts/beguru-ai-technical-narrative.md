---
title: "BeGuru AI — Technical Narrative: mental model, runtime & state (không phải README)"
date: "2026-04-12"
excerpt: "Tài liệu kiến trúc nội bộ chuyển thành blog: hành vi runtime, state nằm đâu, luồng dữ liệu, trade-off, hạn chế và North Star — bám SSOT repo beguru-ai/docs."
category: gen-ai
layout: case-study
kpis:
  - label_vi: "Ý tưởng cốt lõi"
    label_en: "Core idea"
    value: "Stateless HTTP · stateful disk"
  - label_vi: "Luồng LLM"
    label_en: "LLM path"
    value: "OpenRouter · Agno registry"
  - label_vi: "Chân lý dự án"
    label_en: "Project truth"
    value: ".guru · pins · context pack"
  - label_vi: "SSOT"
    label_en: "SSOT"
    value: "beguru-ai/docs"
---

> **Chuỗi BeGuru — Technical Docs**  
> [0. Tổng quan](/blog/beguru-ai-architecture-overview) · [1. Design & đĩa](/blog/beguru-ai-case-study-design-system-disk) · [2. Runtime](/blog/beguru-ai-case-study-runtime-fastapi-agentos) · [3. Memory & context](/blog/beguru-ai-case-study-memory-context-layers) · [4. Mem0 & cross-session](/blog/beguru-ai-mem0-integration-architecture) · **5. Technical Narrative (bài này)**

## VI

**Đối tượng:** kỹ sư onboarding hoặc review kiến trúc. **Phạm vi:** hành vi runtime và mô hình nhận thức của service trong repo `beguru-ai`. **Không phải:** OpenAPI đầy đủ (xem `API_SPEC.md`), marketing, hay danh sách công nghệ.

### Tóm lược

- **beguru-ai** là HTTP service Python (FastAPI/AgentOS) điều phối agent PM/Engineer; suy luận LLM chủ yếu qua **OpenRouter**; **chân lý dự án bền** nằm trên **đĩa** (`.guru/`, design-system), không phải DB hội thoại replay vào mọi prompt.
- **State cho model:** phần lớn từ **`messages` do client gửi lại** + **nén** (`ContextCompressor`) + **pins** + **đọc file** theo `output_path`.
- **Bài này** là bản blog hoá `docs/TECHNICAL_NARRATIVE.md` trong repo; khi lệch code, **ưu tiên repo**.

### 1. TL;DR

- **Hệ thống là gì:** service HTTP Python chạy lâu dài (FastAPI qua **Agno AgentOS**), điều phối agent theo vai (PM, Engineer) để chạy luồng LLM: thu thập yêu cầu và **sinh code** xuống cây project thật.
- **Sản phẩm ra gì:** mã nguồn và artifact có cấu trúc dưới `projects_root_dir` (Next.js, Go, `.guru/`), cộng **stream text** (kiểu SSE) về client.
- **Ý kiến trúc chính (1–2 câu):** engine **stateless theo request** trên **filesystem stateful**: server **không** giữ toàn bộ transcript như session store cho inference; **client gửi lại history**; **sự thật “sản phẩm là gì” bền vững nằm trên đĩa** (và trong pins), không phải DB hội thoại server-side tự động đổ vào mọi prompt.

### 2. System Overview

**Vấn đề:** đi từ thảo luận ngôn ngữ tự nhiên tới **repo cụ thể** (UI + tuỳ chọn API) có rào chắn (template, khối spec, build state) mà không phải tự nối prompt và ghi file từng lượt.

**Hành vi runtime:** lúc deploy, process **Uvicorn** nạp Settings, khởi tạo SQLite (bảng Agno), dựng **CodingTeam**, mount app FastAPI của AgentOS. Request HTTP vào **routers** (`freetext`, `workflows`, …). Luồng sản phẩm chính **mặc định là theo request**: mỗi call mang payload đủ (đặc biệt **`messages` đầy đủ** cho chat/generate) để server **nén**, **ghim**, **compose prompt**, gọi **OpenRouter**, stream, và **ghi file** khi chạy Engineer. Langfuse/logging đi kèm nhưng **không đổi luồng điều khiển cốt lõi**.

**Khác app server truyền thống:** không có “một dòng session user” chứa toàn bộ hội thoại cho input model. **State hội thoại cho LLM được dựng lại từ body request (+ pins từ đĩa)**. Phần truyền thống còn lại: JSON kiểu REST, một process mỗi đơn vị deploy, và **file trên đĩa** là nơi lưu artifact phần mềm đã sinh.

### 3. Mental Model (quan trọng)

**Hệ thống giống một dịch vụ biên dịch chuyên biệt với “cửa chat” phía trước:** client nộp **lô bằng chứng** (messages, path, overlay tuỳ chọn). Service **chuẩn hoá và cắt** (`ContextCompressor`), **xếp lớp context máy** (pins, đoạn file), **gọi model từ xa** (OpenRouter), và khi sinh code thì **phát ra ghi file** xuống workspace — giống **artifact biên dịch**, nhưng “trình biên dịch” **không deterministic** và stream.

**Bộ phận chuyển động chính:** HTTP routers → pipeline context → stream `OpenRouterModel` → (tuỳ chọn) ghi filesystem và static check. **AgentOS/Agno** cung cấp đăng ký agent; **đường chạy LLM chủ đạo là tích hợp OpenRouter tùy chỉnh**, không phải vòng Agno `run()` đầy đủ kèm memory built-in (xem mục hạn chế).

**Kích hoạt:** **HTTP request** (UI/CLI/test). Không bắt buộc scheduler nội bộ cho path chat/codegen chính.

**Luồng dữ liệu khái niệm:** **Vào** → JSON (`messages`, `output_path`, …) + Settings từ env + **đọc** `projects_root_dir` → **Ra** → stream SSE + **ghi** file project + log/trace.

### 4. Runtime Architecture (lớp)

**Interface (API):** route `/api/...`; client JSON, một số path stream; contract trong `API_SPEC.md`. Middleware CORS, log, Langfuse request id, quota (không đồng nhất mọi route).

**Execution (agents/services):** PM — hội thoại spec, tag, handoff `## BEGURU_FE_SPEC`; Engineer — generate-code, edit-code, Go; không bắt buộc “session PM” server ngoài payload. Pipeline context (compressor, pins, context pack Next.js) là **biến đổi deterministic** trước LLM. Validation ví dụ `run_nextjs_static_check` chạy **trên host** — **không** tương đương CI container.

**State:** SQLite — session/workflow/tuỳ chọn persist summary; **summary đã persist không tự prepend lại chat** (tránh lệch thread — `MEMORY_AND_CONTEXT_LAYERS.md`). **Đĩa** — MASTER, BUILD_STATE, PRODUCT_PLAN, `beguru_chat_context.json`, code: **nguồn chân lý giữa các lượt**. RAM request — không có RAM hội thoại xuyên request cho freetext.

**Phụ thuộc ngoài:** OpenRouter (mọi LLM chính); Langfuse tuỳ chọn; MinIO/URL fetch khi bật.

### 5. State & Data Flow

**State nằm đâu:** xem bảng trong bản EN hoặc repo — tóm lại: inference dựa vào **`messages`**, sau nén/pin/pack thì **đĩa** là truth cho repo.

**Giả định:** nếu client **bỏ** turn cũ, server **không** khôi phục từ SQLite cho cùng một PM prompt — trừ khi tính năng tương lai thay đổi.

**Thứ tự build context:** RawHistory → CompressedHistory → PinnedLayer → ContextPack (Engineer).

**Luồng FE điển hình:** client giữ history → `POST .../chat` → stream → client cập nhật history → sau đó `POST .../generate-code` + `output_path` → pack từ **đĩa + messages** → stream → ghi file.

### 6. Execution Flow

**PM chat:** request có `messages` → validate/enrich/quota → compressor → pins → prompt PM → OpenRouter stream → text (có tag/block để client parse); **không** bắt buộc ghi file.

**Generate Next.js:** `messages` + `output_path` → resolve path → context pack → Engineer stream → ghi file theo thứ tự stream → tuỳ chọn static check.

**Edge:** ngưỡng nén sai; artifact đĩa thiếu/cũ; static check fail nhưng HTTP vẫn 200 — client đọc **payload có cấu trúc**. Pipeline Go là **gate** khác, không trùng một phát với FE.

### 7. Component Breakdown

| Thành phần | Vai trò | Ghi chú |
|------------|---------|--------|
| FastAPI (AgentOS) | HTTP, router | `src/api/main.py` |
| Routers | freetext, workflows, … | `API_SPEC.md` |
| CodingTeam / agents | PM, Engineer | `src/agents/` |
| OpenRouterModel | Stream/completion | Phụ thuộc ngoài |
| ContextCompressor | Giới hạn độ dài history | Settings |
| Freetext pins & context pack | Ghép context deterministic | `src/components/freetext/` |
| Templates | Baseline Next/Go | `templates/` |
| SQLite | Agno + persist tuỳ chọn | Không replay chat đầy đủ |
| Skill manifest | Prompt segments | Startup |

### 8. Key Design Decisions

1. **History do client mang:** scale ngang đơn giản; trade-off payload lớn, client phải nhất quán.  
2. **Artifact-first (đĩa + pins):** git-friendly; trade-off contract file/parser chặt.  
3. **OpenRouter một cổng:** đơn giản vận hành; trade-off phụ thuộc nhà cung cấp.  
4. **Nén trước, pin sau:** không mất khối cấu trúc; trade-off hai bước khi debug.  
5. **Persist summary không auto-reinject:** tránh lệch thread; trade-off storage chưa mang lại recall user ngay.

### 9. Limitations (thẳng thắn)

- Không có **memory hội thoại server-first** cho inference mặc định; cross-session mạnh cần đĩa + client hoặc **tương lai** semantic memory (`ADR-0002-memory-oss.md`).  
- Agno memory **không** là xương sống vận hành mô tả ở đây — coi Agno là **framework/registry**.  
- **Không** sandbox cô lập mặc định cho code user; static check trên **môi trường host**.  
- Codegen **non-deterministic**.  
- Vòng **autonomous** đa bước (plan→act→verify→retry) **không** là một primitive API duy nhất — client/workflow nối bước.

### 10. North Star

- **MemoryPlane** + mem0/vector, scoped user/project, **bổ sung** đĩa.  
- **Graph/workflow bền** (LangGraph; Temporal khi cần durable) cho Plan→edit→chạy lệnh→observe→checkpoint.  
- **Sandbox** npm/go test/build, stdout/stderr làm observation.  
- **OTel** + Langfuse theo node graph.

### 11. References (repo `beguru-ai`)

| Tài liệu | Mục đích |
|----------|----------|
| `docs/API_SPEC.md` | Contract HTTP, `output_path` |
| `docs/ARCHITECTURE_RUNTIME.md` | Runtime, deploy |
| `docs/MEMORY_AND_CONTEXT_LAYERS.md` | Pipeline, pins, đĩa |
| `docs/ADR-0002-memory-oss.md` | Mem0/LangGraph — chưa áp dụng mặc định |
| `docs/TROUBLESHOOTING.md` | Vận hành |
| `docs/TECHNICAL_NARRATIVE.md` | Bản SSOT narrative (tiếng Anh) |

Blog và plan nội bộ chỉ mô tả **roadmap**; **code + `docs/` trong repo** là chuẩn khi xung đột.

---

## EN

**Audience:** engineers onboarding or reviewing architecture. **Scope:** runtime behavior and mental model of the service in repository `beguru-ai`. **Not:** full API reference (`API_SPEC.md`), marketing, or a technology laundry list. This post mirrors `docs/TECHNICAL_NARRATIVE.md` in the repo.

### At a glance

- **beguru-ai** is a Python HTTP service (FastAPI / AgentOS) orchestrating PM/Engineer agents; LLM inference is primarily via **OpenRouter**; durable **project truth** lives on **disk** (`.guru/`, design-system), not a replayed conversation DB for every prompt.
- **Model state:** mostly from **client-sent `messages`** + **compression** (`ContextCompressor`) + **pins** + **file reads** under `output_path`.
- **SSOT:** when this post disagrees with the repo, prefer **`beguru-ai` `docs/` and code**.

### 1. TL;DR

- **What it is:** A long-running **Python HTTP service** (FastAPI via **Agno AgentOS**) that orchestrates **role-specific agents** (notably PM and Engineer) for **LLM-backed** workflows: conversational requirements and **code generation** into real project trees.
- **What it produces:** **Source code and structured artifacts** under `projects_root_dir` (Next.js, Go, `.guru/`), plus **streaming** responses (SSE-style).
- **Key idea:** A **stateless request engine over a stateful filesystem**: the server does **not** own the full chat transcript as the primary session store for inference; **the client resends history**; **durable product truth lives on disk** (and in pinned machine messages), not in a server-side conversation DB replayed into every prompt.

### 2. System Overview

**Problem:** Move from natural-language discussion to **concrete repos** (UI + optional API) with guardrails (templates, spec blocks, build state) without hand-stitching every prompt and file write.

**Runtime:** Uvicorn loads **Settings**, **SQLite** (Agno tables), **CodingTeam**, AgentOS FastAPI app. Requests hit **routers**. Primary flows are **request-scoped**: each call carries enough payload (especially full **`messages`**) to **compress**, **pin**, **compose**, call **OpenRouter**, stream, and **write files** on Engineer paths. Langfuse/logging are side channels.

**Difference from typical app servers:** No canonical “session row” holding the entire conversation for model input. **Conversation state for the LLM is rebuilt from the request body plus disk pins.** Traditional parts: JSON-ish HTTP, process per deploy unit, **files on disk** as durable artifacts.

### 3. Mental Model (CRITICAL)

**This system behaves like a specialized compiler service with a chatty front door:** clients submit **batches of evidence**; the service **normalizes** (`ContextCompressor`), **layers machine context** (pins, excerpts), calls **OpenRouter**, and on codegen **writes files**—like compilation **artifacts**, but **non-deterministic** and streamed.

**Moving parts:** routers → context pipeline → `OpenRouterModel` → optional writes and static checks. **AgentOS/Agno** registers agents; **dominant LLM path is custom OpenRouter**, not a full Agno `run()` loop with built-in memory.

**Triggers:** **HTTP requests**. No internal scheduler required for primary chat/codegen.

**Data flow:** **In** → JSON + Settings + reads from `projects_root_dir` → **Out** → SSE + file writes + logs/traces.

### 4. Runtime Architecture

**Interface:** `/api/...` routes; `API_SPEC.md` contract; CORS, logging, Langfuse request id, optional quota.

**Execution:** PM (spec, `## BEGURU_FE_SPEC`); Engineer (generate-code, edit-code, Go); **no server-owned PM session** beyond the request. Context pipeline is **deterministic** before the LLM. `run_nextjs_static_check` runs on the **host**—**not** a containerized CI replica.

**State:** SQLite for sessions/workflows/optional summary persistence; **persisted `[CONTEXT_SUMMARY]` is not auto-prepended** into chat. **Disk** is cross-run truth. **No cross-request conversation RAM** for freetext.

**External:** OpenRouter; optional Langfuse; MinIO/URL fetch when enabled.

### 5. State & Data Flow (VERY IMPORTANT)

| Kind | Where | Used for |
|------|--------|----------|
| Conversation text for inference | **`messages` in request** | PM/Engineer prompts |
| Trimmed history | In-memory after compressor | Token control |
| Structured facts | **Pins** after compression | FE spec, BUILD_STATE excerpts |
| Durable project truth | **Disk** under `output_path` / `.guru/` | Next build, Engineer context |
| Workflow metadata | **SQLite** | Workflows; optional summary |
| Cross-session semantic memory | **Not baseline** | Future per `ADR-0002-memory-oss.md` |

**Assumption:** if the client drops older turns, the server **cannot reconstruct** the same PM prompt from SQLite—unless future work changes this.

**Context order:** RawHistory → CompressedHistory → PinnedLayer → ContextPack.

**Typical FE path:** client holds history → `POST /api/freetext/chat` → stream → client updates → `POST /api/freetext/generate-code` with `output_path` → pack from **disk + messages** → stream → **writes**.

### 6. Execution Flow

**PM chat:** `messages` → validate/enrich/quota → compressor → pins → PM prompt → OpenRouter stream → text; **no mandatory file write**.

**Generate Next.js:** `messages` + `output_path` → resolve paths → context pack → Engineer stream → writes in order → optional static check.

**Edge cases:** bad compression thresholds; missing/stale disk artifacts; static check fails while HTTP still succeeds—**read structured payload**. Go pipeline uses **different gates**.

### 7. Component Breakdown

| Component | Role | Notes |
|-----------|------|--------|
| **FastAPI app (AgentOS)** | HTTP server | `src/api/main.py` |
| **Routers** | Product entrypoints | `API_SPEC.md` |
| **CodingTeam / agents** | PM, Engineer | `src/agents/` |
| **OpenRouterModel** | Streaming & completion | External |
| **ContextCompressor** | History bounds | `Settings` |
| **Freetext pins & context pack** | Deterministic assembly | `src/components/freetext/` |
| **Templates** | Next/Go baselines | `templates/` |
| **SQLite** | Agno + optional persistence | Not full chat replay |
| **Skill manifest** | Prompt segments | Startup |

### 8. Key Design Decisions

1. **Client-carried history** — simpler scaling; large payloads.  
2. **Artifact-first disk + pins** — git-friendly; strict contracts.  
3. **OpenRouter single gateway** — ops simplicity; vendor coupling.  
4. **Compression before pins** — preserves structured blocks; two-stage debugging.  
5. **Optional summary persist without auto-reinject** — avoids thread skew; storage without immediate recall.

### 9. Limitations (CRITICAL)

- No **first-class server chat memory** for default freetext; strong cross-session needs disk + client or **future** semantic memory.  
- **Agno built-in memory is not the operational backbone** — treat Agno as **framework/registry**.  
- **No isolated sandbox** by default; checks run on **host**.  
- **Non-deterministic codegen.**  
- **Multi-step autonomous loops** are **not** one baseline API primitive.

### 10. North Star (Future Architecture)

- **MemoryPlane** + mem0/vector, user/project scoped, **additive** to disk.  
- **Graph/durable orchestration** (LangGraph; **Temporal** when needed).  
- **Sandbox plane** for npm/go tests; stdout/stderr as observations.  
- **OpenTelemetry** + Langfuse on graph nodes.

### 11. References

| Document | Purpose |
|----------|---------|
| `docs/API_SPEC.md` | HTTP contract, `output_path` |
| `docs/ARCHITECTURE_RUNTIME.md` | Runtime, deploy |
| `docs/MEMORY_AND_CONTEXT_LAYERS.md` | Pipeline, pins, disk |
| `docs/ADR-0002-memory-oss.md` | Semantic memory / LangGraph — not default |
| `docs/TROUBLESHOOTING.md` | Operations |
| `docs/TECHNICAL_NARRATIVE.md` | English SSOT narrative |

Roadmap blog posts are **not** SSOT; **`beguru-ai` `docs/` and code** win on conflict until merged deliberately.
