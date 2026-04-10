---
title: "Notes on agents & RAG / Ghi chép agent & RAG"
date: "2026-04-09"
excerpt: "Short VI+EN notes on multi-agent routing, tools, and evaluation."
---

## VI

Vài điểm mình hay nhắc khi làm hệ agent / RAG:

1. **Tách rõ** retrieval, tool-calling, và bước tổng hợp cuối — dễ debug và đo chất lượng.
2. **Grounding**: luôn có cách trích dẫn hoặc log retrieval để kiểm tra hallucination.
3. **Eval**: không chỉ “feel good”; cần bộ test có cấu trúc (regression prompts, golden answers nếu được).

## EN

A few principles I keep coming back to for agentic RAG:

1. **Separate** retrieval, tool execution, and final synthesis — easier to debug and score.
2. **Grounding**: make retrieval auditable; don’t treat the LLM as a black-box truth machine.
3. **Evaluation**: structured regression sets beat vibes-only review for iterative improvement.
