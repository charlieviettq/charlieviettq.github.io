---
title: "Chất lượng DAG Airflow — retry, SLA, alerting"
date: "2026-03-28"
excerpt: "DAG production: idempotency, SLA đúng chỗ, pool, alert có ngữ cảnh — từ giới thiệu tới checklist và pitfall."
category: data-engineering
---

## VI

### TL;DR

- Thiết kế **idempotent** và tách giai đoạn để **rerun** an toàn.
- **SLA** đặt ở cam kết dữ liệu downstream thực sự cần.
- **Alert** phải có ngữ cảnh và owner — tránh spam rồi tắt cảnh báo.

### Giới thiệu

Phù hợp team vận hành pipeline batch trên **Airflow** (hoặc tương đương) phục vụ warehouse / báo cáo. DAG demo thường thiếu **retry có kiểm soát**, **SLA đúng task**, và **pool** — bài này cố định khung suy nghĩ khi DAG vào production.

### Khái niệm cốt lõi

- **Idempotency:** cùng logical date, chạy lại không nhân đôi dữ liệu sai.
- **Retry & backoff:** cho lỗi thoáng qua; fail nhanh với lỗi schema.
- **SLA miss:** báo hiệu trễ so với cam kết **consumer**.
- **Pools / concurrency:** bảo vệ warehouse khỏi một DAG chiếm slot.

### Chi tiết và thực hành

Pattern staging → swap partition / merge theo khóa thường an toàn hơn append mù. Sensor timeout phải rõ; không để DAG đợi vô hạn. Runbook SLA nên nói **ai** escalation và **có chạy downstream partial** với cờ stale không (theo policy nội bộ).

**Checklist thiết kế (rút gọn):**

| Câu hỏi | Mong đợi |
| ------- | -------- |
| Rerun cùng ngày an toàn? | Có chiến lược idempotent |
| SLA gắn task nào? | Đúng “cửa” dữ liệu sẵn sàng |
| Có gate DQ trước publish? | dbt test / GE tùy stack |

### Checklist vận hành

- [ ] Template alert: DAG, task, try, URL log, git revision.
- [ ] Dedupe / maintenance window để giảm noise.
- [ ] Kịch bản **backfill** sau bug được viết và thử.
- [ ] Pools mapping theo tier workload.

### Rủi ro và lỗi thường gặp

- Alert fatigue → pager tắt.
- SLA trên task sai → báo động giả.
- Import nặng ở top-level làm parse DAG chậm.
- Thiếu phân biệt lỗi ingest vs transform.

### Kết luận

DAG tốt là DAG **dự đoán retry và trễ**. Đầu tư idempotency + SLA đúng chỗ + alert sạch giảm đêm trắng không cần thiết.

## EN

### TL;DR

- Build **idempotent** stages and clean phase boundaries for safe **reruns**.
- Attach **SLAs** to the commitments downstream actually depends on.
- Make **alerts actionable** with context and ownership — avoid noisy pages.

### Introduction

For teams operating **Airflow** batch pipelines feeding warehouses and reporting, demo DAGs often miss production realities. This note frames **retries**, **SLAs**, **pools**, and **alert hygiene**.

### Core concepts

- **Idempotency:** reruns for the same logical date must not corrupt facts.
- **Retries:** for transients; fast-fail on schema mismatches.
- **SLA misses:** signal late data versus **consumer promises**.
- **Pools / concurrency:** protect shared warehouses.

### Details and practice

Prefer staging swaps, keyed merges, or partition overwrites over blind appends. Set explicit **sensor timeouts**. SLA runbooks should name **owners** and whether partial downstream runs are acceptable under a **stale** flag per policy.

**Design questions:**

| Question | Expectation |
| -------- | ----------- |
| Safe rerun? | Documented idempotency pattern |
| SLA mapping | Tied to true data-ready milestones |
| Pre-publish DQ | dbt tests or equivalent gates |

### Operational checklist

- [ ] Alert templates include DAG, task, try, log URL, revision.
- [ ] Deduping and planned maintenance windows.
- [ ] Documented **backfill** rehearsal after fixes.
- [ ] Pools aligned to workload tiers.

### Pitfalls and failure modes

- Alert fatigue disabling monitoring.
- SLAs on irrelevant tasks.
- Heavy top-level imports slowing parsing.
- Confusing ingest failures with transform bugs.

### Takeaways

Great DAGs anticipate **retries and latency**. Idempotency, correct SLAs, and clean alerts reduce needless fire drills.
