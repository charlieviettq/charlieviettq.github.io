---
title: "Hành trình của một khoản vay: Khi dữ liệu kể chuyện về lòng tin"
date: "2026-04-07"
excerpt: "Từ lúc tiếp cận đến khi thu hồi: Khám phá bức tranh kỹ thuật đằng sau vòng đời tín dụng — NTB vs ETB, Feature Store, Vintage Analysis, Roll Rate và cách ML len lỏi vào từng nhịp đập của ngân hàng số."
category: banking
---

## VI

### Tóm lược

- Mỗi giai đoạn của một khoản vay cần **loại dữ liệu và pipeline khác nhau**. Đừng nhầm lẫn giữa feature marketing và feature rủi ro.
- **NTB (New to Bank) vs ETB (Existing to Bank)** là phân tách cơ bản nhất: NTB dùng thin-file features (hành vi app, telco), ETB dùng lịch sử giao dịch nội bộ.
- **Feature Store** (Feast + BigQuery) giải quyết vấn đề as-of semantics — đảm bảo không có data leakage qua point-in-time join.
- **Vintage Analysis** và **Roll Rate Matrix** là hai công cụ cốt lõi trong Servicing và Collections — không phải ML model nào cũng thay thế được chúng.

### Giới thiệu

**Disclaimer:** Bài viết này chia sẻ dưới góc độ kỹ thuật về cách dữ liệu và ML vận hành trong tín dụng bán lẻ. Mỗi ngân hàng, mỗi quốc gia sẽ có quy định riêng — đây không thay thế cho tư vấn pháp lý hay chính sách rủi ro chính thức.

Bạn đã bao giờ tự hỏi điều gì xảy ra sau khi nhấn nút "Đăng ký vay" trên ứng dụng ngân hàng số chưa? Đằng sau giao diện mượt mà đó là một hành trình dữ liệu phức tạp, với nhiều pipeline chạy song song ở những tần suất và grain hoàn toàn khác nhau.

### NTB vs ETB: Phân tách cơ bản nhất

Trước khi nói về vòng đời tín dụng, cần hiểu rõ hai phân khúc khách hàng chính, vì chúng đòi hỏi chiến lược dữ liệu hoàn toàn khác nhau:

| Tiêu chí | NTB (New to Bank) | ETB (Existing to Bank) |
|----------|-------------------|------------------------|
| Lịch sử nội bộ | Không có | Có (giao dịch, sản phẩm) |
| Feature chính | App behavior, telco, bureau | Avg balance 6M, transaction patterns |
| Model approach | Thin-file model, bureau-heavy | Rich behavioral model |
| Data challenge | Cold start, leakage từ bureau | Point-in-time correctness |

NTB khó hơn vì dữ liệu ít, và rủi ro leakage cao hơn (bureau data có thể chứa thông tin "hậu sự kiện"). ETB dễ hơn nhưng phức tạp hơn ở as-of semantics — cần biết chính xác balance của khách hàng tại ngày nộp đơn, không phải ngày hôm nay.

### Hành trình bốn giai đoạn của tín dụng

**Giai đoạn 1 — Tiếp cận (Acquisition)**

Mục tiêu: tìm đúng khách hàng để chào mời. Data chủ yếu là behavioral (hành vi trên app, click marketing) và demographic. Xử lý batch.

Pipeline điển hình:
- Airflow DAG chạy daily: aggregate behavioral features → BigQuery mart
- Propensity model: dự báo khả năng khách hàng quan tâm đến sản phẩm vay
- **Lưu ý:** Features ở giai đoạn này là marketing features, KHÔNG được dùng trực tiếp cho credit model

**Giai đoạn 2 — Quyết định (Decisioning)**

Giai đoạn nóng nhất: latency là sống còn. Hệ thống phải trả về quyết định trong < 2 giây.

```python
# Feast point-in-time join — đảm bảo as-of semantics
from feast import FeatureStore

store = FeatureStore(repo_path=".")

entity_df = pd.DataFrame({
    "customer_id": applications["customer_id"],
    "event_timestamp": applications["application_date"],  # as-of cutoff
})

# NTB features: app behavioral (7-day, 30-day)
ntb_features = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "ntb_feature_view:app_session_count_7d",
        "ntb_feature_view:avg_session_duration_30d",
        "ntb_feature_view:product_view_count_30d",
    ],
)

# ETB features: internal transaction history
etb_features = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "etb_feature_view:avg_balance_6m",
        "etb_feature_view:salary_credit_count_3m",
        "etb_feature_view:debit_transaction_amt_1m",
    ],
)
```

Point-in-time join đảm bảo `event_timestamp` của feature ≤ `application_date` — ngăn chặn data leakage từ tương lai vào past.

**Giai đoạn 3 — Quản lý (Servicing)**

Khoản vay đã giải ngân. Nhiệm vụ: phát hiện sớm dấu hiệu rủi ro.

**Vintage Analysis** là công cụ quan trọng nhất ở giai đoạn này:

```sql
-- Vintage analysis: bad rate by origination cohort
-- Track how each monthly cohort performs over time
SELECT
  DATE_TRUNC(origination_date, MONTH)  AS vintage_month,
  DATE_DIFF(observation_date, origination_date, MONTH) AS months_on_book,
  COUNT(*) AS total_loans,
  COUNTIF(dpd >= 30) AS dpd30_count,
  ROUND(COUNTIF(dpd >= 30) / COUNT(*), 4) AS bad_rate_dpd30
FROM loan_performance
WHERE observation_date <= CURRENT_DATE()
GROUP BY 1, 2
ORDER BY 1, 2
```

Vintage analysis giúp trả lời: "Cohort tháng 3 đang worse hơn cohort tháng 1 ở cùng MOB (Months on Book) không?" — nếu có, đó là early warning signal cần điều tra ngay.

**Giai đoạn 4 — Thu hồi (Collections)**

Khi khách hàng bắt đầu trễ hạn, **Roll Rate Matrix** là công cụ để forecast migration giữa các bucket delinquency:

| Từ \ Đến | Current | DPD 1-29 | DPD 30-59 | DPD 60-89 | DPD 90+ |
|----------|---------|----------|-----------|-----------|---------|
| Current | 96% | 4% | — | — | — |
| DPD 1-29 | 35% | 30% | 35% | — | — |
| DPD 30-59 | 15% | 10% | 25% | 50% | — |
| DPD 60-89 | 5% | 5% | 10% | 20% | 60% |

Roll rate giúp: (1) forecast provisioning requirement, (2) ưu tiên đội thu hồi tập trung vào bucket nào, (3) detect deterioration sớm khi roll rate từ Current → DPD tăng bất thường.

### Những "hố đen" cần tránh

**1. Dùng chung data warehouse cho tất cả giai đoạn**

Mỗi giai đoạn cần grain khác nhau:
- Acquisition: customer-level daily snapshot
- Decisioning: application-level point-in-time
- Servicing: loan-level monthly observation
- Collections: account-level weekly

Nhồi tất cả vào một bảng dẫn đến fan-out joins sai grain và temporal leakage.

**2. Quên as-of semantics khi train model**

```python
# SAI: join loan data với current balance (leakage!)
df = loans.merge(balances, on='customer_id')  # balances là "hôm nay"

# ĐÚNG: chỉ lấy balance tại thời điểm application
df = loans.merge(
    balances[balances['snapshot_date'] <= loans['application_date']],
    on=['customer_id', 'snapshot_date'],  # point-in-time join
)
```

**3. Aggregate metrics che giấu vintage deterioration**

Nhìn vào "overall bad rate = 2%" không nói lên gì. Bad rate của cohort tháng 3/2026 đang worse 40% so với cohort tháng 1/2026 ở cùng MOB — đó mới là thông tin đáng lo ngại.

### Bảng tóm tắt kỹ thuật

| Giai đoạn | Grain | Frequency | Key ML task | Data challenge |
|-----------|-------|-----------|-------------|----------------|
| Acquisition | Customer-day | Daily batch | Propensity model | Marketing vs risk feature mixing |
| Decisioning | Application | Real-time | Credit scoring | As-of semantics, latency < 2s |
| Servicing | Loan-month | Daily/Weekly | Early warning | Vintage cohort tracking |
| Collections | Account-week | Weekly | Recovery optimization | Compliance, communication rules |

### Kết luận

Hiểu vòng đời tín dụng giúp chúng ta thoát khỏi vỏ bọc "kỹ sư chỉ biết code". NTB hay ETB, Acquisition hay Collections — mỗi giai đoạn có ngôn ngữ dữ liệu riêng. Khi bạn nói đúng ngôn ngữ đó, những dòng code của mình mới thực sự bảo vệ được đồng tiền và lòng tin.

---

## EN

### At a glance

- Each credit lifecycle stage requires **different data shapes and pipelines**. Marketing features ≠ risk features — mixing them is a leakage risk.
- **NTB (New to Bank) vs ETB (Existing to Bank)** is the fundamental split: NTB relies on thin-file features; ETB leverages internal transaction history.
- **Feature Store + point-in-time joins** (Feast / BigQuery) enforce as-of semantics and prevent temporal leakage.
- **Vintage Analysis** and **Roll Rate Matrix** are irreplaceable tools in Servicing and Collections — understand them before reaching for an ML model.

### Introduction

**Disclaimer:** This is a technical overview of data and ML patterns in retail credit. Practices vary by institution; consult official advisors for binding risk or legal decisions.

After you tap "Apply for Loan" in a fintech app, dozens of systems activate in milliseconds. This post maps the technical landscape of each lifecycle stage — helping data/ML engineers speak the language of credit risk.

### NTB vs ETB: The Fundamental Split

Before any lifecycle stage, you need to know who your customer is:

- **NTB (New to Bank):** No internal history. You rely on app behavior, telco data, credit bureau. Cold-start challenge.
- **ETB (Existing to Bank):** Rich internal history — avg balance, salary credits, transaction patterns. As-of correctness becomes critical.

These two segments often run as **separate models** with separate feature views in the Feature Store.

### The Four Lifecycle Stages

**Stage 1 — Acquisition**

Goal: find the right customers to offer credit. Data is behavioral and demographic; processing is batch.

Key risk: mixing acquisition (marketing) features with risk model features. A customer with high propensity to apply is not the same as a low-risk customer.

**Stage 2 — Decisioning**

The hot path. Latency < 2 seconds; correctness is non-negotiable.

Point-in-time joins via Feast guarantee that every feature seen by the model reflects only what was observable at `application_date`:

```python
entity_df = pd.DataFrame({
    "customer_id": applications["customer_id"],
    "event_timestamp": applications["application_date"],  # as-of cutoff
})
features = store.get_historical_features(
    entity_df=entity_df,
    features=["etb_fv:avg_balance_6m", "ntb_fv:app_session_count_7d"],
)
```

**Stage 3 — Servicing**

Loan is disbursed. Monitor portfolio health via **Vintage Analysis**:

```sql
SELECT
  DATE_TRUNC(origination_date, MONTH) AS vintage_month,
  DATE_DIFF(observation_date, origination_date, MONTH) AS mob,
  ROUND(COUNTIF(dpd >= 30) / COUNT(*), 4) AS bad_rate_dpd30
FROM loan_performance
GROUP BY 1, 2
ORDER BY 1, 2
```

Vintage analysis answers: "Is the March cohort performing worse than January at the same MOB?" If yes — investigate before it becomes a provisioning problem.

**Stage 4 — Collections**

**Roll Rate Matrix** forecasts delinquency migration and drives collection strategy:

| From → To | Current | DPD 1-29 | DPD 30-59 | DPD 60-89 | DPD 90+ |
|-----------|---------|----------|-----------|-----------|---------|
| Current | 96% | 4% | — | — | — |
| DPD 1-29 | 35% | 30% | 35% | — | — |
| DPD 30-59 | 15% | 10% | 25% | 50% | — |

When Current → DPD roll rate spikes week-over-week, that's an early warning signal — not a lagging indicator.

### Common Failure Modes

1. **Same warehouse for all stages:** Different stages need different grains. Mixing them causes fan-out errors and time leakage.
2. **Current-state joins for historical training:** Always use point-in-time joins when building training datasets.
3. **Aggregate metrics masking vintage deterioration:** "Overall bad rate = 2%" hides that the March cohort is 40% worse than January at the same MOB.

### Takeaways

The credit lifecycle is a data contract: each stage has a distinct grain, frequency, and correctness requirement. NTB vs ETB, Acquisition vs Collections — each speaks a different data language. When you understand that language, your pipelines don't just process data; they protect trust.
