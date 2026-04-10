---
title: "Chất lượng DAG Airflow — retry, SLA, alerting"
date: "2026-03-28"
excerpt: "Patterns vận hành: idempotent tasks, SLA misses, pools và observability cho pipeline batch."
category: data-engineering
---

## VI

DAG tốt không chỉ “chạy được” mà **dự đoán lỗi**: task idempotent (chạy lại an toàn), phân tách extract/transform rõ, **retry** với backoff cho lỗi thoáng qua, và **SLA** trên task quan trọng để phát hiện trễ dữ liệu trước khi stakeholder mở ticket.

**Alerting** nên đi qua kênh đã ưu tiên (PagerDuty/Slack) với ngữ cảnh: DAG id, task, lần chạy, link log. Tránh cảnh báo spam — gom theo fail liên tiếp hoặc suppress trong cửa sổ bảo trì.

**Pools / concurrency** giúp không làm quá tải warehouse; **data quality checks** (Great Expectations, dbt tests) như task đầu DAG downstream. Kiểm tra **backfill** và migration phiên bản operator trước khi nâng Airflow.

## EN

Production DAGs assume failure: make tasks **idempotent**, split brittle stages, use **retries** with sane limits, and attach **SLAs** to critical path tasks so you detect late data early.

Tune **alerts** with context and dedupe rules — noisy on-call pages erode trust. Route heavy jobs through **pools** to protect the warehouse. Run **data quality gates** as explicit tasks before consumers read tables.

Before upgrades, rehearse **backfills** and operator migrations so historical runs remain reproducible.
