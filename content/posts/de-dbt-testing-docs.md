---
title: "dbt tests và docs như contract trên warehouse"
date: "2026-03-22"
excerpt: "Coi schema tests + assertions + lineage trong dbt như SLA nội bộ giữa analytics và platform."
category: data-engineering
---

## VI

**dbt tests** (`unique`, `not_null`, `relationships`, v.v.) và **tests tùy chỉnh** biến mô hình SQL thành “hợp đồng”: mỗi lần build, warehouse phải thỏa các rule đã thống nhất. Khi test fail, Airflow/GitHub Action có thể chặn merge hoặc cảnh báo SLA — giảm bảng kim cương hỏng lan xuống dashboard/ML.

**Docs + lineage** trong dbt (manifest, DAG trong UI) giúp người mới hiểu nguồn cột và owner — quan trọng khi model dày đặc. Kết hợp **tags** theo domain và **exposures** cho dashboard downstream tạo bản đồ rủi ro thay đổi schema.

**Gợi ý:** ưu tiên test trên critical path (fact tiền, đồng nhất user id); snapshot slowly changing dimensions nếu cần audit; không nhân đôi logic giữa BI tool và dbt — single source trong repo.

## EN

dbt turns SQL models into **enforced contracts**: built-in and custom tests fail the pipeline when invariants break — blocking bad merges or paging owners. That beats discovering orphan keys in a dashboard weeks later.

**Documentation and lineage** (column descriptions, DAG graph, exposures to BI tools) onboard analysts faster and show blast radius when schemas change.

**Tips:** test the money-path models first; snapshot slowly changing attributes when history matters; keep semantic logic out of duplicated BI calculated fields — one source in git.
