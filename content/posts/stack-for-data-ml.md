---
title: "Stack I use for data & ML / Stack mình hay dùng"
date: "2026-04-10"
excerpt: "VI+EN: Airflow, dbt, BigQuery, GCP, and where GenAI fits."
---

## VI

Ở môi trường data platform, mình thường bám theo các lớp sau:

- **Thu thập / vận chuyển**: batch + stream, ưu tiên contract rõ và observability.
- **Transform / mô hình dimensional**: **dbt** trên warehouse (**BigQuery**), kiểm soát lineage và test.
- **ML / risk**: feature store patterns, training có thể tái lập, OOT và monitor drift sau triển khai.
- **GenAI**: RAG, agent, gateway LLM — coi observability và an toàn dữ liệu là phần “mặc định”, không phải add-on.

## EN

For data platforms I usually think in layers: reliable ingestion, **dbt**-dimensional modeling on **BigQuery**, disciplined ML delivery for risk use cases, and **GenAI** (RAG/agents) with observability and data safety as defaults—not extras.
