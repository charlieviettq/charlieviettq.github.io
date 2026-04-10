---
title: "Vòng đời tín dụng bán lẻ — góc nhìn dữ liệu và ML"
date: "2026-04-07"
excerpt: "Từ acquisition đến collections: dữ liệu và mô hình thường xuất hiện ở đâu — mô tả khái niệm, không phải tư vấn pháp lý."
category: banking
---

## VI

Trong tín dụng bán lẻ, dữ liệu và mô hình thường gắn với các pha: **acquisition** (điểm marketing, fraud signal nhẹ), **underwriting / decisioning** (application score, policy rules), **account management** (behavior score, limit review), và **collections** (propensity to pay).

Mỗi pha có **mục tiêu và ràng buộc** khác nhau — feature availability và độ trễ khác nhau (real-time vs batch). Data platform cần **lineage** rõ: ngày chốt, snapshot hành vi, và phân quyền truy cập.

Nội dung này chỉ mô tả **khung nghiệp vụ và kỹ thuật**; quy trình cụ thể phụ thuộc quy định nội bộ và pháp lý từng tổ chức.

## EN

Retail credit lifecycles touch multiple analytics surfaces: **acquisition** (response and fraud-lite signals), **underwriting** (application scores plus policy), **servicing** (behavioral scores, exposure reviews), and **collections** (repayment propensity).

Each stage exposes different **features and latency budgets** — design warehouses and feature stores with clear **as-of semantics** and access controls.

This note is descriptive about typical data/ML touchpoints, not legal or investment guidance.
