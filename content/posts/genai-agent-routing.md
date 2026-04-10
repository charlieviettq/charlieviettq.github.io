---
title: "Routing multi-agent và ranh giới công cụ"
date: "2026-03-30"
excerpt: "Router có schema, tool có scope và timeout, handoff có state object — tránh agent vạn năng và vòng lặp vô hạn."
category: gen-ai
---

## VI

### TL;DR

- **Router** (classifier nhẹ hoặc LLM structured output) chọn *đường* phù hợp — RAG, code, hay agent chuyên môn — thay vì một agent làm hết.
- **Tool** khai báo schema, quyền (read-only vs write), timeout; log mọi invocation.
- **Handoff** dùng state có cấu trúc + **`max_steps`** + phát hiện lặp.

Kiến trúc multi-agent dễ trượt sang spaghetti: mỗi lớp cần **ranh giới trách nhiệm** và **observability** giống microservice.

**Router — thiết kế:**

| Thành phần | Gợi ý |
| ---------- | ----- |
| Input | Intent + constraints (ngôn ngữ, tenant, độ nhạy dữ liệu) |
| Output | `route` + lý do ngắn (để debug) |
| Fallback | Đường an toàn (RAG-only hoặc human handoff) |

**Khi nào không nên LLM-router:** latency chặt và tập intent ổn định — có thể **classifier** truyền thống + rule; LLM chỉ cho long-tail.

**Tool boundaries:** JSON schema đầu vào; **read-only** mặc định cho DB; write qua approval path riêng. Timeout cứng; rate limit theo user/service. Log correlation id để truy vết chuỗi tool.

**Vòng lặp & lan rộng:** đặt **`max_steps`**; theo dõi lặp pattern (cùng tool + cùng args); cooldown sau N lần fail.

**Handoff giữa agent:** chuyển **state object** (JSON): mục tiêu, artifacts đã có, điều đã thử — thay vì forward full chat vô hạn.

**Failure modes:** router nhầm intent do prompt mơ hồ; tool quyền quá rộng → sự cố dữ liệu; không có trace → debug bằng đoán; “agent vạn năng” làm chi phí token nổ.

**Eval router:** confusion matrix trên tập intent có nhãn; regression khi đổi prompt router.

## EN

### TL;DR

- A **router** selects the right path (RAG vs tools vs specialists) instead of one omnibus agent.
- **Tools** need schemas, scopes, timeouts, and structured logs.
- **Handoffs** carry compact state; cap depth with **`max_steps`** and loop detection.

Multi-agent systems fail when boundaries blur.

**Router design:**

| Piece | Suggestion |
| ----- | ---------- |
| Input | Intent + constraints (language, tenant, sensitivity) |
| Output | `route` + short rationale for debugging |
| Fallback | Safe path or human escalation |

**When not to use an LLM router:** tight latency and stable intents — use **classical classifiers + rules**; reserve LLM for long-tail.

**Tool governance:** strict JSON schemas; default **read-only** data paths; hard timeouts; per-user/service limits; **correlation IDs** across calls.

**Loops:** enforce **`max_steps`**; detect repeated tool arguments; back off after repeated failures.

**Agent handoffs:** pass structured **state** (goal, artifacts, attempts tried), not unbounded transcripts.

**Failure modes:** ambiguous prompts mis-routing; overpowered tools; missing traces; runaway token cost from “do-everything” agents.

**Router eval:** labeled intent confusion matrix; rerun after prompt/router changes.
