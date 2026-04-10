---
title: "Routing multi-agent và ranh giới công cụ"
date: "2026-03-30"
excerpt: "Thiết kế router: khi nào gọi tool, khi nào chuyển agent — tránh vòng lặp và phân quyền quá rộng."
category: gen-ai
---

## VI

**Router** (có thể là classifier nhẹ hoặc LLM structured output) quyết định luồng: RAG-only, code executor, hay agent chuyên môn. Ranh giới rõ giúp giảm chi phí và hallucination — không mặc định “agent làm mọi thứ”.

**Tool boundaries:** mỗi tool khai báo input schema, quyền (read-only DB vs write), và timeout. Ghi log **tool call** với correlation id để debug. Tránh chuỗi gọi sâu không có điều kiện dừng — đặt `max_steps` và detector lặp.

**Handoff:** khi chuyển giữa agent, truyền **tóm tắt trạng thái** có cấu trúc (JSON) thay vì chat dài vô hạn. Đánh giá router bằng confusion matrix intent trên bộ dữ liệu có nhãn.

## EN

A **router** picks specialized paths — pure RAG, a coding agent, or a domain agent — instead of one generalist trying everything. Clear routing cuts cost and error modes.

**Tool governance:** strict schemas, capability scopes, timeouts, and structured logging on every invocation. Cap recursion with **max steps** and loop detection.

**Agent handoffs:** pass compact state objects, not unbounded transcripts. Measure routing quality with labeled intent sets and confusion analysis.
