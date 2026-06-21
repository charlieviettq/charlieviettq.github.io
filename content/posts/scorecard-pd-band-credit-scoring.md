---
title: "Scorecard Và PD Band: Biến Model Score Thành Ngôn Ngữ Policy"
date: "2026-06-05"
excerpt: >
  Model score chỉ hữu ích khi Risk và Business dùng được nó trong policy. Bài này
  giải thích scorecard, WOE/IV, PD band, actual bad rate, cum rate, cum bad rate
  và cách đọc marginal risk.
category: data-science
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 4 / 8  
> Trước: [Bài 3 — DPD, MOB và vintage analysis](/blog/dpd-mob-vintage-analysis/)  
> Tiếp: [Bài 5 — Calibration trong credit scoring](/blog/model-calibration-credit-scoring/)

---

## Điểm cần nhớ

- Scorecard vẫn quan trọng vì dễ giải thích, dễ audit và dễ policy hóa.
- WOE/IV giúp đọc feature theo ngôn ngữ good/bad, nhưng IV quá cao cần kiểm tra leakage.
- Nếu model output là PD, band thấp là rủi ro thấp; band cao là rủi ro cao.
- Actual bad rate by band kiểm tra model có rank đúng không.
- Cum rate và cum bad rate giúp đọc cutoff, nhưng marginal/bin bad rate mới cho thấy nhóm approve thêm rủi ro thế nào.

## VI

## 1. Scorecard là gì?

Scorecard là cách chấm điểm tín dụng truyền thống, thường dùng logistic regression với biến đã được binning và WOE. Dù nhiều team dùng XGBoost/LightGBM, scorecard vẫn phổ biến trong môi trường cần explainability, compliance và reason code.

Ví dụ:

```text
No overdue last 12M: +50 điểm
Stable income: +30 điểm
High bureau score: +80 điểm
```

Score cao thường nghĩa là risk thấp, nhưng mỗi tổ chức có convention riêng.

## 2. WOE và IV

**WOE (Weight of Evidence)** đo một bin có thiên về Good hay Bad:

```text
WOE = ln(%Good in bin / %Bad in bin)
```

**IV (Information Value)** đo sức phân biệt của feature:

```text
IV = sum((%Good - %Bad) x WOE)
```

Rule of thumb:

| IV | Cách đọc |
|---:|---|
| < 0.02 | Yếu |
| 0.02-0.1 | Thấp |
| 0.1-0.3 | Trung bình |
| 0.3-0.5 | Mạnh |
| > 0.5 | Rất mạnh, cần kiểm tra leakage/overfit |

## 3. PD band

Với ML model, output thường là predicted probability of bad, tức PD. Khi đó:

```text
PD thấp = tốt
PD cao = xấu
```

Ví dụ band:

```python
ntb_bins = [-1, 0, 0.025, 0.04, 0.05, 0.075, 0.1, 0.125, 0.15, 0.2, 0.5, 1]
```

Bins mịn ở vùng PD thấp vì đây thường là vùng quyết định approve, limit và pricing. Vùng PD cao có thể rộng hơn vì nhiều khách bị reject hoặc manual review.

## 4. Actual bad rate by band

Một PD band tốt nên có actual bad rate tăng dần:

| PD band | Avg predicted PD | Actual 30+ DPD |
|---|---:|---:|
| 0-2.5% | 1.6% | 1.8% |
| 2.5-4% | 3.2% | 3.5% |
| 4-5% | 4.5% | 4.7% |
| 5-7.5% | 6.2% | 7.0% |
| 7.5-10% | 8.4% | 9.5% |

Nếu actual bad rate vẫn tăng đều, model rank ổn. Nếu actual cao hơn predicted ở hầu hết bin, đó chủ yếu là calibration issue.

## 5. Cum rate và cum bad rate

Nếu sort từ PD thấp đến cao:

```text
Cum rate = volume tích lũy / total population
Cum bad rate = bad tích lũy / volume tích lũy
```

Trong policy, cum rate thường gần với approval rate nếu approve từ band tốt nhất đến cutoff.

Ví dụ:

| PD band | Volume | Bad | Cum rate | Cum bad rate |
|---|---:|---:|---:|---:|
| 0-2.5% | 1,000 | 10 | 10% | 1.0% |
| 2.5-5% | 2,000 | 60 | 30% | 2.3% |
| 5-7.5% | 1,500 | 90 | 45% | 3.6% |

Nếu cutoff là `PD <= 7.5%`, approval/cum rate là 45%, cum bad rate là 3.6%.

## 6. Marginal risk

Cum bad rate có thể làm portfolio nhìn ổn vì các band tốt kéo trung bình xuống. Khi nới cutoff, hãy nhìn nhóm marginal.

Ví dụ nới từ `PD <= 5%` lên `PD <= 7.5%`:

```text
Marginal group = 5% < PD <= 7.5%
```

Nếu marginal bad rate là 6% nhưng portfolio cum bad rate chỉ 3.6%, stakeholder cần biết nhóm approve thêm đang rủi ro hơn baseline.

## 7. Checklist

- Band có đủ volume không?
- Actual bad rate có monotonic theo PD không?
- Avg predicted PD có gần actual bad rate không?
- Cum bad rate có nằm trong risk appetite không?
- Marginal group có profit dương không?
- Có tách theo channel, product, NTB/ETB không?

## EN

### From model score to policy language

A model score becomes useful when Risk and Business can use it in policy. Scorecards remain popular because they are explainable, auditable and easy to translate into rules.

### WOE and IV

WOE measures whether a bin is more Good-heavy or Bad-heavy. IV measures the discriminatory power of a feature. Very high IV should trigger leakage and overfit checks.

### PD bands

If the model output is PD, lower bands are lower risk and higher bands are higher risk. Monitor average predicted PD, actual bad rate, volume and approval by band.

### Cum rate and cum bad rate

Cum rate is the cumulative share of the population up to a cutoff. Cum bad rate is cumulative bads divided by cumulative accounts. These are useful for cutoff discussions, but marginal/bin bad rate tells you the risk of newly approved customers.

### Practical takeaway

When relaxing a cutoff from `PD <= 5%` to `PD <= 7.5%`, analyze the marginal group `5% < PD <= 7.5%`. The portfolio average may look acceptable while the incremental group is unprofitable.
