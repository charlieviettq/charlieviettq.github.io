---
title: "Collection Score: Thiết Kế Label, Treatment Và Recovery Strategy"
date: "2026-06-16"
excerpt: >
  Collection score không chỉ tìm người dễ trả. Nó là bài toán phân bổ capacity:
  gọi ai, dùng treatment nào, kỳ vọng thu được bao nhiêu và chi phí có đáng không.
category: banking
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 8 / 8  
> Trước: [Bài 7 — Limit assignment và risk-based pricing](/blog/limit-pricing-credit-scoring/)  
> Nền tảng: [Bài 3 — DPD, MOB và vintage analysis](/blog/dpd-mob-vintage-analysis/)

---

## Điểm cần nhớ

- Collection score là bài toán allocation: capacity, treatment, timing, recovery và cost.
- Label phải khớp objective: payment, cure, roll-forward, recovery amount hoặc uplift.
- Không nên trộn mọi DPD bucket vào một model nếu action và behavior khác nhau.
- Propensity trả lời ai dễ trả; uplift trả lời action có làm họ trả thêm không.
- Lift@topK, recovery captured và net recovery thường hữu ích hơn AUC trong vận hành.

## VI

## 1. Collection không chỉ là dự báo ai trả

Một lỗi phổ biến là build collection score như một model dự báo “ai sẽ trả tiền”. Điều đó hữu ích, nhưng chưa đủ. Collection team không có vô hạn capacity. Họ phải quyết định:

```text
Ai nhận SMS?
Ai cần call?
Ai nên được offer restructuring?
Ai không đáng tốn effort lúc này?
```

Vì vậy collection score không chỉ là risk score. Nó là công cụ phân bổ treatment và chi phí.

## 2. Label đi theo objective

Không có label mặc định cho collection score. Label phải bắt đầu từ câu hỏi vận hành.

| Objective | Label 1 | Label 0 | Metric tổng hợp |
|---|---|---|---|
| Payment propensity | Trả minimum due trong 14 ngày | Không trả | Payment rate |
| Cure | Quay về Current trong 30 ngày | Không cure | Cure rate |
| Roll-forward prevention | Roll sang bucket xấu hơn | Không roll | Roll rate |
| Recovery binary | Có trả bất kỳ amount trong 30/60/90 ngày | Không trả | Recovery rate |
| Recovery amount | Số tiền thu hồi | - | Expected recovery |

Label là nhãn ở cấp account/snapshot. Roll rate, cure rate và recovery rate là metric tổng hợp từ nhiều label.

## 3. Population: bucket khác nhau là bài toán khác nhau

Khách 5 DPD và khách 120 DPD không cùng một bài toán. Một người có thể chỉ cần reminder. Người kia có thể cần restructuring, field collection hoặc recovery strategy.

Collection model nên tách theo bucket:

```text
Current high risk
1-30 DPD
31-60 DPD
61-90 DPD
90+ DPD
Write-off
```

Ví dụ early collection:

```text
Population = accounts entering 1-30 DPD
Scoring date = ngày account vào bucket
Performance window = 14 ngày
Label 1 = paid minimum due trong 14 ngày
```

Feature chỉ được lấy trước hoặc tại scoring date. Payment sau scoring date, collector note sau scoring date, hoặc DPD tương lai đều là leakage.

## 4. Propensity vs uplift

Propensity model dự báo:

```text
P(pay in 14 days)
```

Nhưng gọi nhóm có propensity cao nhất có thể lãng phí capacity, vì họ có thể tự trả sau một reminder nhẹ.

Uplift hỏi câu khác:

```text
P(pay with call) - P(pay without call)
```

Nếu chưa có experiment đủ tốt để làm uplift, có thể bắt đầu bằng propensity + business rules:

| Segment | Propensity | Suggested treatment |
|---|---:|---|
| High propensity | Cao | SMS/app reminder |
| Medium propensity | Trung bình | Call center |
| Low propensity, high balance | Thấp | Intensive treatment/restructure review |
| Low propensity, low balance | Thấp | Low-cost treatment hoặc defer |

## 5. Treatment history và bias

Collection data rất dễ bị treatment bias. Nếu lịch sử cho thấy nhóm được gọi nhiều trả nhiều hơn, có thể là vì họ dễ trả, hoặc vì họ được gọi.

Feature như `number_of_calls_last_7d`, `promise_to_pay_status`, `collector_note` có thể rất predictive nhưng cũng phản ánh strategy cũ. Nếu dùng không cẩn thận, model sẽ học lại bias của operation hiện tại.

Governance câu hỏi nên hỏi:

```text
Feature này có available trước scoring date không?
Feature này là customer signal hay treatment artifact?
Nếu strategy đổi, feature distribution có còn ý nghĩa không?
```

## 6. Metrics: AUC không đủ cho collection capacity

Nếu call center chỉ gọi được 20% khách hàng, AUC toàn bộ population chưa trả lời được câu hỏi vận hành. Cần đọc:

```text
Lift@top 10% / top 20%
Precision@topK
Recovery captured@topK
Cure rate
Roll-forward rate
Cost per collected amount
Net recovery = recovery amount - collection cost
```

Ví dụ:

| Ranking | Top 20% captured recovery | Cost per collected amount |
|---|---:|---:|
| Rule-based champion | 34% | 12% |
| Model challenger | 52% | 8% |

Đây là ngôn ngữ mà Head of Collection dùng được.

## 7. Mini case: gọi người dễ trả nhất chưa chắc tối ưu

Collection có 50,000 account ở 1-30 DPD, nhưng chỉ gọi được 10,000. Model propensity xếp top 20% là nhóm dễ trả nhất. Nhưng analysis cho thấy nhiều account top score tự cure sau SMS.

Recommendation:

> Không dùng call cho toàn bộ top propensity. Nhóm high propensity nhận SMS/app reminder. Call center tập trung vào nhóm medium propensity có balance đủ lớn và historical response tốt. Nhóm low propensity high balance được đưa vào restructuring review. Success metric là net recovery và roll-forward reduction, không chỉ payment rate.

## 8. Common mistakes

| Mistake | Hậu quả |
|---|---|
| Một model cho mọi DPD bucket | Action không khớp behavior |
| Label quá dài so với treatment window | Model khó vận hành |
| Gọi top propensity | Lãng phí call cho người tự trả |
| Không tính collection cost | Recovery gross đẹp nhưng net xấu |
| Dùng treatment artifact làm feature vô tội vạ | Reinforce bias của strategy cũ |

## 9. Checklist

- Objective là payment, cure, roll-forward, recovery hay uplift?
- Population bucket là gì?
- Scoring date có rõ không?
- Performance window có khớp SLA action không?
- Feature có leakage sau scoring date không?
- Có đo lift@capacity không?
- Có đo net recovery sau collection cost không?

## 10. Takeaway

Collection score tốt không chỉ giúp biết ai dễ trả. Nó giúp dùng capacity đúng chỗ. Trong collection, model value nằm ở treatment allocation và net recovery, không chỉ ở probability.

## EN

### Collection score is capacity allocation

A collection score is not only about predicting who will pay. It helps decide who gets SMS, who gets a call, who receives restructuring treatment, and who is not worth expensive effort right now.

### Label follows the objective

Payment, cure, roll-forward and recovery are different objectives. They need different labels, windows and populations. A 1-30 DPD model should not be casually mixed with a 90+ DPD or write-off model.

### Propensity is not uplift

Propensity predicts who is likely to pay. Uplift estimates whether an action makes payment more likely. Calling the highest propensity accounts can waste capacity if those accounts would have paid anyway.

### Practical takeaway

For collection, evaluate lift@capacity, recovery captured, roll-forward reduction and net recovery after cost. AUC is useful, but it does not answer the operational question alone.
