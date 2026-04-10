---
title: "Checklist đánh giá RAG — grounding và regression"
date: "2026-04-05"
excerpt: "Bộ câu hỏi ngắn trước khi ship RAG: trích dẫn, độ trùng câu trả lời, và theo dõi khi đổi chunk/embedding."
category: gen-ai
---

## VI

**Grounding:** câu trả lời có bám trích dẫn không? Thử bộ câu “cần số liệu cụ thể” và câu adversarial (không có trong kho) — model phải từ chối hoặc nói rõ không đủ bằng chứng.

**Regression:** khi đổi chiến lược chunk, embedding model, hoặc reranker, chạy lại **bộ benchmark cố định** (golden Q&A + điểm human/LLM-judge có kiểm soát). Log version corpus, prompt, và tham số retrieval để tái hiện lỗi.

**Latency & cost:** đo p95 end-to-end; cache embedding truy vấn lặp; giới hạn top-k và độ dài context. **Safety:** lọc PII trong kho; watermark nguồn nội bộ.

## EN

**Grounding checks:** can answers cite retrieved chunks? Include adversarial queries with no support — the system should abstain clearly.

**Regression harness:** whenever chunking, embeddings, or rerankers change, re-run a **frozen eval set** (golden QA plus careful automated judges). Version the corpus, prompts, and retrieval params.

**Latency and cost:** track p95; cache query embeddings; cap top-k and context size. **Safety:** scan corpora for sensitive fields; tag internal-only sources.
