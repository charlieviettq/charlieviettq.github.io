---
title: "Routing multi-agent và ranh giới công cụ"
date: "2026-03-30"
excerpt: "Router có schema, tool có scope/timeout, handoff state — bài đầy đủ từ intro tới pitfall multi-agent."
category: gen-ai
---

## VI

### TL;DR

- **Router** chọn đường (RAG / tool / chuyên gia) thay vì một agent “làm hết”.
- **Tool** có schema, quyền, timeout, log tương quan.
- **max_steps** + phát hiện lặp để tránh vòng lặp vô hạn.

### Giới thiệu

Kiến trúc **multi-agent** dễ phình chi phí và rủi ro nếu không có ranh giới. Bài viết dành cho kỹ sư LLM đang thiết kế hệ có router + nhiều tool — cần khả năng **debug**, **kiểm soát chi phí**, và **an toàn dữ liệu**.

### Khái niệm cốt lõi

- **Router:** output có cấu trúc (`route`, lý do ngắn) + fallback an toàn.
- **Tool boundary:** JSON schema, quyền read-only mặc định cho DB, rate limit.
- **Handoff:** state object gọn giữa agent thay vì forward chat dài.

### Chi tiết và thực hành

Với intent ổn định và latency chặt, có thể **classifier** + rule thay LLM-router cho tầng đầu. LLM-router phù hợp long-tail. Mọi tool call log `correlation_id`, đối số, latency, lỗi. Đặt `max_steps`; nếu lặp cùng tool+args, dừng và báo.

**Bảng gợi ý phân quyền tool (minh hoạ):**

| Tool | Mặc định | Ghi chú |
| ---- | --------- | ------- |
| Đọc DB | Cho phép scoped | Predicate bắt buộc |
| Ghi DB | Cần luồng approve | Không mở trong POC |
| Gửi email | Chỉ sandbox | Tránh leak PII |

### Checklist vận hành

- [ ] Spec router output (schema) + test unit với ví dụ.
- [ ] Observability: trace span theo session.
- [ ] Confusion matrix intent khi đổi prompt router.
- [ ] Giới hạn token/step trên môi trường prod.

### Rủi ro và lỗi thường gặp

- Tool quyền quá rộng → sự cố dữ liệu.
- Không trace → debug bằng đoán.
- Agent vạn năng làm chi phí nổ.

### Kết luận

Multi-agent ổn định khi **router + tool + handoff** được thiết kế như service có SLA và log — không chỉ prompt xếp chồng.

## EN

### TL;DR

- A **router** chooses paths (RAG / tools / specialists) instead of one mega-agent.
- **Tools** carry schemas, scopes, timeouts, and correlation logs.
- Enforce **max_steps** and loop detection.

### Introduction

**Multi-agent** stacks balloon in cost and risk without boundaries. This note targets engineers designing routers + tool ecosystems who need **debuggability**, **cost control**, and **data safety**.

### Core concepts

- **Router:** structured output (`route`, short rationale) with a safe fallback.
- **Tool boundaries:** JSON schema; default read-only DB paths; rate limits.
- **Handoffs:** compact **state objects** between agents rather than unbounded transcripts.

### Details and practice

For stable intents with tight latency, classical **classifiers + rules** may front the router; reserve LLM routing for long-tail cases. Log every tool invocation with correlation IDs. Cap steps; halt on repeated tool arguments. 

**Illustrative tool policy:**

| Tool | Default | Note |
| ---- | ------- | ---- |
| DB read | Scoped predicates | Required filtering |
| DB write | Approval flow | Keep off POCs |
| Email | Sandbox only | Guard PII |

### Operational checklist

- [ ] Router schema + fixtures tested in CI.
- [ ] Observability spans per session.
- [ ] Intent confusion checks after prompt changes.
- [ ] Token/step budgets in production configs.

### Pitfalls and failure modes

- Overpowered tools causing data incidents.
- Missing traces — debugging by vibes.
- Omnibus agents exploding token costs.

### Takeaways

Stable multi-agent systems treat **routers, tools, and handoffs** like services with logs and budgets — not prompt spaghetti.
