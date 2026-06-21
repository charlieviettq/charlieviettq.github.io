---
title: "Collection Score: Thiết Kế Label, Treatment Và Recovery Strategy"
date: "2026-06-16"
excerpt: >
  Collection score không chỉ dự báo ai dễ trả. Một model hữu ích phải nối label,
  bucket, treatment, capacity, recovery amount và collection cost để giúp đội thu hồi
  chọn đúng khách hàng và đúng hành động.
category: banking
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 8 / 8  
> Trước: [Bài 7 — Limit assignment và risk-based pricing](/blog/limit-pricing-credit-scoring/)  
> Nền tảng: [Bài 3 — DPD, MOB và vintage analysis](/blog/dpd-mob-vintage-analysis/)

---

## Điểm cần nhớ

- Collection score cần label rõ: payment, cure, roll-forward, recovery hay uplift.
- Population nên tách theo bucket như 1-30, 31-60, 61-90, 90+ DPD.
- Gọi nhóm dễ trả nhất chưa chắc tối ưu, vì họ có thể tự trả nếu chỉ nhận reminder nhẹ.
- Lift@topK, recovery captured và cost per recovery thường hữu ích hơn chỉ nhìn AUC.
- Treatment history dễ gây bias; cần phân biệt propensity với uplift.

## VI

## 1. Collection score trả lời câu hỏi gì?

Application score hỏi:

```text
Có nên cho vay không?
```

Collection score hỏi:

```text
Ai cần được tác động?
Tác động bằng kênh nào?
Kỳ vọng thu được bao nhiêu?
Chi phí có đáng không?
```

Vì vậy collection score phải gắn với action thật của collection team.

## 2. Chọn objective trước khi chọn label

Không có một label mặc định cho collection score. Label phụ thuộc objective.

| Objective | Label 1 | Label 0 | Metric tổng hợp |
|---|---|---|---|
| Payment propensity | Trả minimum due trong 14 ngày | Không trả | Payment rate |
| Cure model | Quay về Current trong 30 ngày | Không cure | Cure rate |
| Roll-forward risk | Roll sang bucket xấu hơn | Không roll | Roll rate |
| Recovery model | Có trả tiền trong 30/60/90 ngày | Không trả | Recovery rate |
| Recovery amount | Số tiền thu hồi | - | Expected recovery |

Label là nhãn ở cấp dòng dữ liệu. Roll rate, cure rate hoặc payment rate là metric tổng hợp từ nhiều dòng.

## 3. Population và scoring date

Collection model nên tách theo bucket:

```text
Current high risk
1-30 DPD
31-60 DPD
61-90 DPD
90+ DPD
Write-off
```

Ví dụ model cho early collection:

```text
Population = accounts entering 1-30 DPD
Scoring date = ngày account vào 1-30 DPD
Performance window = 14 ngày
Label 1 = paid minimum due trong 14 ngày
```

Feature chỉ được lấy trước hoặc tại scoring date.

## 4. Feature groups

Các nhóm feature thường dùng:

| Nhóm | Ví dụ |
|---|---|
| Delinquency | Current DPD, max DPD, bucket history |
| Payment behavior | Last payment amount, partial payment, days since last payment |
| Exposure | Outstanding, due amount, installment, tenor remaining |
| Contactability | Valid phone, SMS delivered, app push opened |
| Treatment history | Calls, reminders, promise-to-pay, field visit |

Treatment history mạnh nhưng nguy hiểm. Nếu nhóm được gọi nhiều hơn có payment rate cao hơn, chưa chắc họ vốn dễ trả; có thể do họ được treatment nhiều hơn.

## 5. Propensity khác uplift

Propensity model dự báo:

```text
P(pay in 14 days)
```

Nhưng nếu call center chỉ gọi được 20% khách hàng, gọi nhóm có P(pay) cao nhất có thể lãng phí capacity, vì nhiều người trong nhóm đó sẽ tự trả sau SMS.

Uplift model hỏi câu khó hơn:

```text
Call có làm xác suất trả tăng thêm không?
```

Trong thực tế, nếu chưa có experiment tốt, có thể bắt đầu bằng propensity + business rules, sau đó thiết kế champion/challenger để đo treatment effect.

## 6. Metrics đánh giá

Ngoài AUC/KS, collection nên đọc:

```text
Lift@top 10% hoặc top 20%
Precision@topK
Recovery captured@topK
Cure rate
Roll-forward rate
Cost per collected amount
Net recovery = recovery amount - collection cost
```

Nếu top 20% theo model capture 50% tổng recovery, model đang giúp allocation capacity tốt hơn.

## 7. Stakeholder translation

Nếu Collection hỏi vì sao không gọi nhóm dễ trả nhất:

> Nhóm dễ trả có thể tự cure với reminder nhẹ. Với call capacity giới hạn, mình nên ưu tiên nhóm có expected incremental recovery cao hơn sau khi trừ collection cost. Propensity score là bước đầu; để tối ưu hơn cần đo uplift hoặc champion/challenger.

## 8. Checklist

- Objective là payment, cure, roll-forward, recovery hay uplift?
- Population là bucket nào?
- Scoring date là ngày nào?
- Performance window có khớp SLA collection không?
- Feature có leakage sau scoring date không?
- Có treatment bias không?
- Model được đánh giá bằng lift@capacity chưa?

## EN

### Collection score is action-oriented

A collection score should not only predict who is risky. It should help decide who to contact, through which channel, when and at what expected net recovery.

### Label design

The label depends on the objective:

| Objective | Label |
|---|---|
| Payment propensity | Paid minimum due within 14 days |
| Cure | Returned to Current within 30 days |
| Roll-forward | Rolled to a worse DPD bucket |
| Recovery | Paid any amount or recovered amount within a window |

Population and scoring date must be explicit. A model for 1-30 DPD customers should not be mixed casually with 90+ DPD or write-off accounts.

### Propensity versus uplift

Calling customers with the highest probability to pay is not always optimal. Some of them may pay without a call. With limited capacity, collection teams should target expected incremental recovery net of collection cost.

### Practical takeaway

Start with a clear label and lift@capacity. Then move toward champion/challenger or uplift modeling when treatment data is reliable enough.
