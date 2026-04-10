---
title: "Checklist đánh giá RAG — grounding và regression"
date: "2026-04-05"
excerpt: "Golden set, abstain khi không có bằng chứng, version corpus/prompt/reranker — và lỗi eval hay gặp."
category: gen-ai
---

## VI

### TL;DR

- **Grounding** không phải vibe: cần bộ câu hỏi cố định + tiêu chí pass/fail rõ (trích dẫn, số liệu khớp ngữ cảnh).
- Mỗi lần đổi **chunk / embedding / reranker / prompt**, chạy lại **cùng một golden set** — đó mới là regression thật.
- **Từ chối trả lời** (abstain) là feature: giảm hallucination có chủ đích.

Đánh giá RAG trong môi trường công việc khác demo: bạn cần chứng minh hệ **ít làm sai** khi tài liệu thay đổi, traffic tăng, hoặc người dùng hỏi méo mó.

**Grounding — kiểm tra gì:**

| Loại câu | Kỳ vọng |
| -------- | ------- |
| Fact trong doc | Trả lời khớp passage; có trích dẫn id/chunk |
| Aggregates (sum/count) | Khớp bảng/đoạn nguồn; nếu không đủ → abstain |
| Không có trong kho | Từ chối rõ ràng, không bịa nguồn |
| Đa ý / mơ hồ | Hỏi làm rõ hoặc liệt kê giả định |

**Regression harness:** “đóng băng” một **golden set** (Q, ground truth hoặc rubric chấm). Mỗi release ghi **version**: corpus snapshot, embedding model id, reranker, prompt hash, top-k, temperature. So sánh không chỉ “LLM judge” một chiều — dùng judge có **rubric** và mẫu con người định kỳ cho subset nhạy cảm.

**Latency & cost:** log p50/p95 end-to-end; theo dõi token prompt; cache embedding truy vấn lặp; cap `top_k` và độ dài context — trade-off giữa recall và noise trong prompt.

**Safety / privacy:** lọc PII trong index; phân quyền retrieval theo tenant; watermark nguồn nội bộ.

**Failure modes:** golden set quá dễ (chỉ FAQ); để LLM tự chấm không có rubric → điểm “ảo”; thay đổi chunk nhưng không re-embed toàn bộ; benchmark không cover **ngôn ngữ** (VI/EN) mà prod thực sự dùng.

**Checklist trước khi ship:** abstain path tested; adversarial set có nhãn; monitor online: rate trích dẫn rỗng, feedback thumbs-down map tới ticket.

## EN

### TL;DR

- **Grounding** needs labeled expectations — not a feels-good demo.
- True regression means **re-running a frozen golden set** after any retrieval change.
- Teach the system **to abstain** when evidence is missing.

RAG evaluation is about **failure budgets** as docs, embeddings, and prompts churn.

**Grounding matrix:**

| Query class | Expectation |
| ----------- | ----------- |
| Supported fact | Answer aligns with cited passage(s) |
| Numeric totals | Matches source tables; else abstain |
| Out-of-corpus | Clear “insufficient evidence” |
| Ambiguous | Clarify or state assumptions |

**Regression harness:** version **corpus snapshots**, **embedding & reranker IDs**, **prompt text/hash**, and retrieval hyperparameters. Automate runs on every change; keep human spot checks on high-risk slices.

**Latency/cost:** watch p95 and token volumes; cache repeated query embeddings; tune `top_k` vs context noise.

**Privacy:** index hygiene for sensitive fields; tenant-scoped retrieval; traceability for internal-only sources.

**Failure modes:** trivial benchmarks; uncritiqued LLM judges; partial re-embedding after chunking changes; language mismatch between eval set and production.

**Pre-ship checklist:** abstain behavior verified; adversarial suite labeled; production monitors tie thumbs-down to incident workflow.
