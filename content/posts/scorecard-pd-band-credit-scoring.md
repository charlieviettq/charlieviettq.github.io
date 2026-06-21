---
title: "Scorecard Và PD Band: Biến Model Score Thành Ngôn Ngữ Policy"
date: "2026-06-05"
excerpt: >
  Model score chỉ có giá trị khi nó được dịch thành policy language. Bài này đi từ
  scorecard, WOE/IV đến PD band, actual bad rate, cum rate, cum bad rate và marginal risk.
category: data-science
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 4 / 8  
> Trước: [Bài 3 — DPD, MOB và vintage analysis](/blog/dpd-mob-vintage-analysis/)  
> Tiếp: [Bài 5 — Calibration trong credit scoring](/blog/model-calibration-credit-scoring/)

---

## Điểm cần nhớ

- Model score không tự nói được policy; PD band mới giúp Risk và Business ra quyết định.
- Scorecard vẫn sống khỏe trong credit risk vì explainability, auditability và reason code.
- WOE/IV hữu ích để đọc feature, nhưng IV quá cao là tín hiệu phải kiểm tra leakage.
- Actual bad rate by band kiểm tra risk ordering; predicted PD vs actual bad rate kiểm tra calibration.
- Cum bad rate cho thấy portfolio tại cutoff; marginal/bin bad rate cho thấy nhóm approve thêm rủi ro thế nào.

## VI

## 1. Score không phải ngôn ngữ cuối cùng

Trong notebook, model output là một con số. Trong credit policy, con số đó phải trở thành quyết định: approve tới band nào, giảm limit ở đâu, pricing tăng bao nhiêu, nhóm nào manual review.

Đó là lý do scorecard, score band và PD band vẫn quan trọng. Chúng biến model thành một ngôn ngữ mà Risk, Business, Finance và Operations có thể dùng chung.

## 2. Scorecard: vì sao cách cũ vẫn hữu ích

Scorecard thường dùng logistic regression với binning và WOE. Nó không phải lúc nào cũng mạnh nhất về rank-order performance, nhưng có ba lợi thế lớn trong credit risk:

| Lợi thế | Vì sao quan trọng |
|---|---|
| Explainability | Dễ giải thích vì sao khách bị điểm thấp |
| Governance | Dễ audit, document, review policy |
| Operationalization | Dễ chuyển thành reason code và policy rule |

ML model có thể tốt hơn về AUC/Gini, nhưng nếu không dịch được thành decision bands và reason story, stakeholder vẫn khó dùng.

## 3. WOE/IV: đọc feature theo ngôn ngữ risk

**WOE (Weight of Evidence)** cho biết một bin thiên về Good hay Bad:

```text
WOE = ln(%Good in bin / %Bad in bin)
```

**IV (Information Value)** đo sức phân biệt của feature:

```text
IV = sum((%Good - %Bad) x WOE)
```

| IV | Cách đọc |
|---:|---|
| < 0.02 | Yếu |
| 0.02-0.1 | Thấp |
| 0.1-0.3 | Trung bình |
| 0.3-0.5 | Mạnh |
| > 0.5 | Rất mạnh, cần kiểm tra leakage hoặc proxy quá gần label |

Common mistake: thấy IV cao và mừng quá sớm. Trong credit, một feature quá mạnh có thể là future information, collection status sau booking, hoặc proxy cho chính label.

## 4. PD band: nơi model gặp policy

Nếu model output là probability of bad, band nên được đọc theo PD:

```text
PD thấp = rủi ro thấp
PD cao = rủi ro cao
```

Ví dụ:

```python
ntb_bins = [-1, 0, 0.025, 0.04, 0.05, 0.075, 0.1, 0.125, 0.15, 0.2, 0.5, 1]
```

Bins thường mịn hơn ở vùng PD thấp vì đó là nơi decision thật xảy ra: approve, limit, pricing, manual review. Vùng PD rất cao có thể rộng hơn vì nhiều hồ sơ bị reject.

## 5. Actual bad rate by band

Một bảng band monitoring tốt không chỉ có volume. Nó phải cho thấy model có rank đúng và có calibrated không.

| PD band | Volume | Avg predicted PD | Actual 30+ DPD | Cách đọc |
|---|---:|---:|---:|---|
| 0-2.5% | 10,000 | 1.6% | 1.8% | Tốt |
| 2.5-4% | 8,000 | 3.2% | 3.5% | Tốt |
| 4-5% | 5,000 | 4.5% | 4.7% | Tốt |
| 5-7.5% | 3,000 | 6.2% | 8.5% | Underestimate risk |
| 7.5-10% | 1,500 | 8.4% | 11.0% | Underestimate risk |

Nếu actual bad rate tăng đều theo band, rank ordering vẫn ổn. Nếu actual cao hơn predicted PD ở nhiều band, vấn đề chính là calibration hoặc population shift.

## 6. Cum rate, cum bad rate và marginal risk

Khi sort từ PD thấp đến cao:

```text
Cum rate = cumulative volume / total population
Cum bad rate = cumulative bad / cumulative volume
```

Ví dụ:

| PD band | Volume | Bad | Bin bad rate | Cum rate | Cum bad rate |
|---|---:|---:|---:|---:|---:|
| 0-2.5% | 1,000 | 10 | 1.0% | 10% | 1.0% |
| 2.5-5% | 2,000 | 60 | 3.0% | 30% | 2.3% |
| 5-7.5% | 1,500 | 90 | 6.0% | 45% | 3.6% |

Nếu cutoff là `PD <= 7.5%`, approval/cum rate là 45%, cum bad rate là 3.6%. Nhưng nhóm approve thêm từ `5%` lên `7.5%` có bin bad rate 6.0%. Đây là marginal risk.

## 7. Mini case: portfolio nhìn ổn, marginal group không ổn

Risk appetite là bad rate tối đa 4%. Cutoff `PD <= 7.5%` có cum bad rate 3.6%, nhìn có vẻ pass. Nhưng marginal group `5% < PD <= 7.5%` có bad rate 6.0% và chủ yếu đến từ affiliate channel.

Recommendation tốt:

> Overall cutoff vẫn dưới risk appetite, nhưng marginal risk của affiliate channel không tốt. Em đề xuất giữ cutoff cho salaried và existing customer, còn affiliate channel áp dụng lower limit hoặc manual review.

## 8. Checklist

- Band có đủ volume và bad count không?
- Actual bad rate có monotonic theo PD band không?
- Predicted PD có gần actual bad rate không?
- Có đọc bin bad rate cùng với cum bad rate không?
- Marginal group có profit dương không?
- Kết quả có tách theo channel, product, NTB/ETB không?

## 9. Takeaway

Model score là vật liệu thô. PD band là nơi model đi vào policy. Nếu DS không đọc được band, cum rate và marginal risk, model rất dễ bị dùng như một con số đẹp thay vì một công cụ quyết định.

## EN

### A model score needs policy language

A model score is not the final language of credit decisioning. It has to become approval bands, limit rules, pricing tiers, manual review queues and monitoring guardrails.

### Why scorecards still matter

Scorecards remain useful because they are explainable, auditable and easy to operationalize. ML models may rank better, but they still need to be translated into PD bands and decision rules.

### Band monitoring

Monitor volume, average predicted PD, actual bad rate, cum rate, cum bad rate and marginal/bin bad rate. Actual bad rate by band checks risk ordering. Predicted PD versus actual bad rate checks calibration.

### Practical takeaway

If `PD <= 7.5%` gives a cumulative bad rate below risk appetite, do not stop there. Check the marginal group `5% < PD <= 7.5%`. That is the group your new policy is actually adding.
