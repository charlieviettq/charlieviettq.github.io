---
title: "Checklist đánh giá RAG — grounding và regression"
date: "2026-04-05"
excerpt: "Golden set, abstain, version corpus/prompt/reranker — khung đầy đủ từ giới thiệu tới pitfall eval RAG."
category: gen-ai
---

## VI

### TL;DR

- **Grounding** cần bộ câu có tiêu chí pass/fail — không chỉ demo.
- Mỗi lần đổi chunk/embed/rerank/prompt: chạy lại **cùng golden set**.
- **Abstain** là tính năng: giảm bịa khi không có bằng chứng.

### Giới thiệu

Dành cho kỹ sư triển khai **RAG** nội bộ: khi tài liệu, embedding, hoặc prompt đổi, chất lượng có thể **trượt ngầm**. Bài này cố định khung **đánh giá** và **regression** để team không phụ thuộc “cảm giác” sau khi ship.

### Khái niệm cốt lõi

- **Grounding:** câu trả lời bám trích dẫn / bảng nguồn; từ chối khi không đủ bằng chứng.
- **Golden set:** tập Q cố định + rubric (hoặc nhãn) để tái chạy.
- **Versioning:** snapshot corpus, model embedding, reranker, prompt hash, top-k.

### Chi tiết và thực hành

Xây ma trận loại câu: fact trong doc, aggregate số, out-of-corpus, ambiguous. Với mỗi loại định nghĩa **pass**. Kết hợp judge tự động có rubric và spot-check con người định kỳ. Log **p95 latency**, token usage; cache embedding truy vấn lặp; cap context để cân recall vs nhiễu.

**Ví dụ rubric ngắn (minh hoạ):**

| Loại | Pass khi |
| ---- | -------- |
| Fact | Trích đúng passage; không thêm fact không có |
| Aggregate | Khớp nguồn hoặc abstain rõ |
| OOC | Không bịa nguồn |

### Checklist vận hành

- [ ] Golden set được “đóng băng” trong git hoặc DVC.
- [ ] Pipeline eval chạy trên PR đổi retrieval/prompt (nếu phạm vi cho phép).
- [ ] Monitor online: rate abstain, feedback âm map ticket.
- [ ] Quy trình PII trong index theo policy.

### Rủi ro và lỗi thường gặp

- Bộ benchmark quá dễ hoặc lệch ngôn ngữ so production.
- LLM judge không có rubric → điểm không tin cậy.
- Đổi chunk nhưng không re-embed đồng bộ.

### Kết luận

RAG bền vững nhờ **eval có khung** và **version hóa** mọi thành phần retrieval — không chỉ nhìn vào một demo đẹp.

## EN

### TL;DR

- **Grounding** needs explicit pass/fail criteria — not vibes.
- Re-run the same **golden set** after any retrieval or prompt change.
- **Abstention** is a first-class behavior to curb hallucinations.

### Introduction

For teams shipping **internal RAG**, quality can silently regress as docs, embeddings, or prompts shift. This note frames **evaluation** and **regression** habits beyond one-off demos.

### Core concepts

- **Grounding:** answers tied to citations / source tables; abstain when evidence is missing.
- **Golden set:** frozen questions with rubrics or labels for replay.
- **Versioning:** corpus snapshot IDs, embedding models, rerankers, prompt hashes, top-k.

### Details and practice

Design query classes: in-doc facts, numeric aggregates, out-of-corpus, ambiguous prompts. Define **pass** per class. Pair automated judges with rubrics and periodic human audits. Track **p95 latency** and tokens; cache embeddings for repeats; cap context to balance recall vs noise.

**Illustrative rubric:**

| Class | Pass when |
| ----- | --------- |
| Fact | Correct passage grounding; no fabricated facts |
| Aggregate | Matches source or clear abstention |
| OOC | No fake citations |

### Operational checklist

- [ ] Golden set frozen in git/DVC.
- [ ] Eval runs on PRs touching retrieval/prompts when feasible.
- [ ] Production monitors tie poor feedback to tickets.
- [ ] PII hygiene in the index per policy.

### Pitfalls and failure modes

- Trivial or language-mismatched benchmarks.
- Uncalibrated LLM judges.
- Chunking changes without consistent re-embedding.

### Takeaways

Durable RAG needs **disciplined eval** and **component versioning** — not demo-driven luck.
