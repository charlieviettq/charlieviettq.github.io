---
title: "Chất lượng DAG Airflow — retry, SLA, alerting"
date: "2026-03-28"
excerpt: "DAG production: idempotency, SLA miss, pools, alert có ngữ cảnh — và lỗi vận hành hay gặp."
category: data-engineering
---

## VI

### TL;DR

- Thiết kế task **idempotent** và tách giai đoạn giòn (extract vs transform) để rerun an toàn.
- **SLA** đặt trên task “cửa hậu” của dữ liệu downstream, không chỉ task đầu pipeline.
- **Alert** phải kèm ngữ cảnh (DAG, run id, link log); tránh spam làm tắt cảnh báo.

DAG Airflow “chạy được demo” khác DAG **vận hành được**. Ở production, lỗi mạng, quota warehouse, hoặc file đến trễ là bình thường — thiết kế phải giả định retry và partial failure.

**Idempotency:** cùng một `logical date`, chạy lại task không được nhân đôi fact hay phá dimension. Pattern: **staging truncate+load** có kiểm soát, **merge** theo khóa, hoặc **partition overwrite** với predicate rõ. Tránh “append mù” khi upstream gửi lại file.

**Retry & backoff:** bật retry cho lỗi thoáng qua (HTTP 5xx, timeout); giới hạn số lần để không kẹt queue. Phân biệt lỗi **không thể retry** (schema sai) — fail nhanh và page đúng owner.

**SLA:** đặt trên task mà team downstream **cam kết thời điểm có dữ liệu** (vd. mart risk 06:00). SLA miss phải nối vào **runbook**: ai xử lý, escalation nào, có cho phép chạy partial downstream với cờ “stale” không.

**Pools & concurrency:** hạn chế song song truy vấn nặng lên cùng cluster; dùng pool theo warehouse hoặc theo tier DAG. Một DAG “ăn hết slot” làm nghẽn DAG khác — symptom hay gặp khi không phân tách.

**Alerting có cảnh:** template Slack/PagerDuty gồm DAG id, task, try number, link log, và **git revision** của code (nếu có). Gom cảnh báo trùng trong cửa sổ ngắn; suppress theo maintenance window đã đăng ký.

**Checklist vận hành:**

| Hạng mục | Câu hỏi |
| -------- | ------- |
| Idempotency proof | Rerun safe on same logical date? |
| SLA mapping | Downstream có biết data freshness không? |
| DQ gate | Có task chạy Great Expectations/dbt test trước publish? |
| Backfill | Có kịch bản chạy lại range ngày sau bug? |
| Upgrade path | Operator migration không phá DAG cũ? |

**Failure modes:** alert fatigue → tắt page; SLA trên task sai (đo sai “đi muộn”); task phụ thuộc file landing nhưng không check **sensor** timeout rõ; DAG parse chậm do import nặng ở top-level.

## EN

### TL;DR

- Assume failures: make tasks **idempotent** and split brittle stages.
- Attach **SLAs** to the commitments downstream actually cares about.
- Alerts need **context and dedupe** — otherwise ops disables them.

A production DAG tolerates **retries**, **late data**, and **partial outages**. Demo DAGs often hide these realities.

**Idempotency:** rerunning for the same logical date must not duplicate facts or corrupt dimensions. Prefer explicit **merge keys**, **partition overwrites**, or controlled staging swaps — not blind appends.

**Retries:** use exponential backoff for transient faults; cap attempts; classify **non-retryable** errors (schema mismatch) for fast failure with clear ownership.

**SLAs:** place them on the tasks that define **data-ready time** for consumers. An SLA miss should point to a **runbook**, not just an email into the void.

**Pools/concurrency:** protect the warehouse from a single DAG monopolizing slots; separate heavy batch from interactive-critical paths.

**Alert quality:** include DAG, task, attempt, log URL, and ideally **code revision**. Dedupe noisy pages; honor maintenance windows.

**Operational checklist:**

| Item | Question |
| ---- | -------- |
| Idempotency | Safe rerun for same logical date? |
| SLA | Does it mirror real consumer promises? |
| DQ gate | Tests before publishing marts? |
| Backfill | Documented range replay after fixes? |
| Upgrades | Operator migrations planned without breaking history? |

**Failure modes:** alert fatigue; SLAs on irrelevant tasks; missing sensor timeouts; heavy top-level imports slowing scheduler parsing.
