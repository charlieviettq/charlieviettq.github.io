---
title: "dbt tests và docs như contract trên warehouse"
date: "2026-03-22"
excerpt: "Tests + lineage + exposures = contract nội bộ: lớp test ưu tiên, CI, anti-pattern BI trùng logic, và khi DAG fail."
category: data-engineering
---

## VI

### TL;DR

- Coi **dbt tests** (built-in + generic + singular) như **SLA dữ liệu**: fail là tín hiệu merge/deploy cần dừng hoặc cảnh báo có owner.
- **Docs + lineage + exposures** giảm “ai đổi cột này?” — đặc biệt khi mart phục vụ **scoring / báo cáo điều hành**.
- Lỗi hay gặp: test chỉ chạy cục bộ, logic trùng giữa BI tool và dbt, exposures không map tới dashboard thật.

dbt biến SQL trong repo thành **hợp đồng có thực thi**: mỗi lần `dbt build`, warehouse phải thỏa các invariant đã cam kết (`unique`, `not_null`, `relationships`, test generic theo cột, hoặc **singular** SQL kiểm tra nghiệp vụ). Trong tổ chức có Airflow/GitHub Actions, test fail có thể **chặn merge** hoặc **page** on-call — tương đương với việc không cho bảng “hỏng” lan xuống dashboard hay feature view mà không ai ký nhận.

**Tài liệu & lineage** (manifest, graph trong dbt docs, mô tả cột) giúp người mới hiểu **nguồn** và **ý nghĩa** metric — tránh hiểu nhầm khi cùng tên cột ở hai mart khác nhau. **Exposures** nối model tới BI asset (Looker/Power BI/Metabase): khi schema đổi, bạn nhìn được **blast radius**.

**Ưu tiên test (pragmatic):**

| Lớp | Ví dụ | Khi nào ưu tiên |
| --- | ----- | ---------------- |
| Khóa & grain | `unique` + `not_null` trên khóa tự nhiên mart | Mọi mart tiêu thụ bởi ML/report |
| Tham chiếu | `relationships` tới dimension | Fact có FK logic |
| Phạm vi nghiệp vụ | singular: tổng debit = tổng credit trong ngày T | Số tiền / hạch toán |
| Freshness | source freshness | SLA ingest |

**Khi không nên “test bừa”:** bảng thử sandbox; chi phí full-table scan quá lớn — dùng **sample** hoặc partition predicate có kiểm soát (vẫn ghi rõ trade-off).

**Anti-pattern:** metric quan trọng chỉ được định nghĩa trong tool BI; khi dbt đổi, dashboard vẫn chạy nhưng **sai ngữ nghĩa**. Hướng xử lý: **single source** trong dbt (metric layer hoặc view chuẩn), BI chỉ visualize.

**Failure mode khi DAG fail:** phân biệt **lỗi ingest** vs **lỗi transform**; idempotency để rerun; log nhiệm vụ dbt với **job id** map tới PR. Nếu test fail sau khi data vendor đổi schema — cập nhật contract và thông báo consumer, không silent `warn` mãi.

**Checklist triển khai:** tests trong CI; docs generate theo tag release; owners trên models (meta); exposures trùng với dashboard đang dùng thật.

## EN

### TL;DR

- Treat dbt **tests** as **enforceable contracts**, not checkbox documentation.
- **Docs + lineage + exposures** shorten incident time when a column meaning drifts.
- The expensive mistake is **duplicated semantics** across dbt and a BI layer.

dbt makes warehouse SQL **executable policy**: `not_null`, `unique`, `relationships`, custom generic tests, and **singular** assertions express what “healthy” means for a mart. Wire failures into CI/CD or orchestration so bad tables do not silently feed **ML features** or exec dashboards.

**Documentation and lineage** reduce tribal knowledge — especially when similarly named fields differ by mart. **Exposures** link models to downstream BI assets so schema changes surface **blast radius** early.

**Pragmatic test prioritization:**

| Layer | Examples | Prioritize when |
| ----- | -------- | --------------- |
| Keys & grain | natural keys on conformed marts | ML/report consumers |
| Referential | `relationships` to dims | facts with logical FKs |
| Business invariants | singular reconciliation checks | money / balances |
| Freshness | `source` freshness | SLA-driven ingestion |

**Avoid blind spots:** “tests only run on laptops”; massive scans without **partition filters**; accepting `warn` as permanent for money paths.

**Anti-pattern:** the “true” metric lives only in a BI calculated field. Prefer **single-source** semantic views or metrics in dbt; let BI visualize.

**When DAGs fail:** separate ingest vs transform failures; ensure **idempotent** reruns; stamp runs with **git SHA**. Vendor schema drift should bump contracts and notify consumers — not hide behind warnings.

**Rollout checklist:** CI runs on PR; docs published per release; model **owners** in `meta`; exposures grounded in real dashboards.
