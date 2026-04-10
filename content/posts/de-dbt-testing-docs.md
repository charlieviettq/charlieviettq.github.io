---
title: "dbt tests và docs như contract trên warehouse"
date: "2026-03-22"
excerpt: "Tests, docs, lineage, exposures: contract dữ liệu từ ý tưởng tới checklist CI và anti-pattern BI trùng logic."
category: data-engineering
---

## VI

### TL;DR

- dbt **tests** là hợp đồng có thể fail pipeline — không chỉ comment.
- **Docs + lineage + exposures** giảm downtime khi đổi schema; map tới dashboard thật.
- Anti-pattern: metric sống trong BI tool thay vì repo SQL.

### Giới thiệu

Bài viết cho data engineer / analytics engineer dùng **dbt** trên warehouse dùng chung cho báo cáo và đôi khi **feature** cho ML. Khi càng nhiều mart dùng chung, giá trị của **test**, **tài liệu**, và **phụ thuộc có hướng** càng lớn — đặc biệt khi mỗi PR có thể làm vỡ báo cáo điều hành hoặc score input.

### Khái niệm cốt lõi

- **Tests built-in/generic:** `unique`, `not_null`, `relationships`, custom generic theo domain.
- **Singular tests:** SQL assert nghiệp vụ (đối soát, conservation of mass).
- **Docs & lineage:** cột có nghĩa, graph phụ thuộc; **exposures** nối tới BI tool.

### Chi tiết và thực hành

Ưu tiên test trên **money path** và **khóa grain** của mart được nhiều team dùng. Freshness trên **sources** nếu SLA ingest là cổng vào. Trong CI: `dbt build --select state:modified+` hoặc chiến lược tương đương để vừa nhanh vừa an toàn.

Khi test fail, log cần có **environment + git sha** để trace. Với warehouse lớn, cân nhắc predicate partition trong test custom để tránh scan full table vô ích.

**Ma trận ưu tiên (minh hoạ):**

| Ưu tiên | Loại test | Lý do |
| ------- | --------- | ----- |
| P0 | Grain + PK mart tiền | Lan nhanh nếu hỏng |
| P1 | FK logic facts → dims | Orphan rows gây sai dashboard |
| P2 | Freshness critical path | Phát hiện pipeline đến trễ |
| P3 | Singular đối soát theo ngày | Sai số tiền / balance |

### Checklist vận hành

- [ ] Tests chạy trên PR; merge block khi fail ở P0/P1.
- [ ] Generate docs theo release tag; lưu artifact.
- [ ] `meta` owner trên model quan trọng.
- [ ] Exposures trùng dashboard đang dùng (Metabase/Looker/PBI…).

### Rủi ro và lỗi thường gặp

- `warn` thay vì `error` mãi cho invariant tiền/bạc.
- Docs không cập nhật nhưng cột đổi nghĩa — tin cậy wiki nội bộ sai.
- Logic lặp giữa dbt và BI → drift ngữ nghĩa.

### Kết luận

dbt biến SQL thành **sản phẩm có kiểm soát chất lượng**. Đầu tư tests + lineage là bảo hiểm rẻ cho warehouse dùng chung.

## EN

### TL;DR

- dbt **tests** enforce contracts — not decorative YAML.
- **Docs, lineage, and exposures** shrink incident time; ground exposures in real BI assets.
- Anti-pattern: metrics defined only in a BI layer.

### Introduction

For engineers running **dbt** on shared warehouses feeding exec reporting and sometimes **ML features**, quality gates and discoverability scale better than heroics. This note frames how tests and documentation behave as **operating infrastructure**.

### Core concepts

- **Built-in / generic tests:** keys, nullability, relationships, domain generics.
- **Singular tests:** business assertions and reconciliations.
- **Docs & lineage:** meaning and DAG; **exposures** map to dashboards.

### Details and practice

Prioritize tests on **money paths** and **conformed grains**. Track **source freshness** when SLAs matter. In CI, balance speed (`state:modified+` patterns) with breadth on main. On failure, logs should carry **git SHA** and environment. Add partition predicates to heavy checks when needed.

**Priority illustration:**

| Tier | Tests | Why |
| ---- | ----- | --- |
| P0 | Grain + money mart PKs | Fast, wide blast radius |
| P1 | Logical FK checks | Orphan rows break trust |
| P2 | Critical-path freshness | Late data detection |
| P3 | Daily reconciliation SQL | Catches monetary drift |

### Operational checklist

- [ ] CI on PRs; block merges on P0/P1 failures.
- [ ] Publish docs per release; archive artifacts.
- [ ] Model **owners** in `meta`.
- [ ] Exposures aligned with live dashboards.

### Pitfalls and failure modes

- Permanent `warn` on money invariants.
- Stale docs while semantics drift.
- Duplicated semantics across dbt and BI tools.

### Takeaways

dbt turns warehouse SQL into **quality-managed products**. Tests plus explicit **lineage** are cheap insurance at scale.
