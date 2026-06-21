---
title: "Vòng Đời Tín Dụng: Credit Scoring Nằm Ở Đâu Trong Risk Decisioning"
date: "2026-06-01"
excerpt: >
  Credit scoring không chỉ là một model dự báo bad. Nó nằm trong toàn bộ vòng đời
  tín dụng, từ application, underwriting, booking, repayment đến collection. Bài này
  đặt lại bản đồ để DS hiểu model của mình đang phục vụ quyết định nào.
category: banking
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 1 / 8  
> Tiếp: [Bài 2 — Labels, outcome window và maturity](/blog/credit-labels-outcome-window/)  
> Khóa học: Credit Scoring & Risk Decisioning for Data Scientists

---

## Điểm cần nhớ

- Credit scoring là một phần của **risk decisioning**, không phải một notebook model độc lập.
- Application score trả lời ai được duyệt, hạn mức bao nhiêu và pricing thế nào.
- Behavioral score trả lời khách hàng đang khỏe lên hay xấu đi sau khi đã book.
- NPL là chỉ số đến muộn; DS cần nối score với FPD, DPD, vintage, expected loss và portfolio risk.
- Stakeholder không chỉ hỏi AUC. Họ hỏi approval, risk appetite, provision, profit và operational impact.

## VI

## 1. Tổng quan: Model sống trong credit lifecycle

Một khoản vay bán lẻ thường đi qua chuỗi quyết định như sau:

```text
Application -> Underwriting -> Approval/Reject -> Booking -> Repayment
-> Delinquency -> Collection -> Write-off / Recovery
```

Credit scoring xuất hiện ở nhiều điểm trong chuỗi này. Nếu DS không biết model được dùng ở đâu, rất dễ tối ưu sai mục tiêu: model đẹp trên validation nhưng khó dùng trong policy, pricing hoặc portfolio monitoring.

:::note[Positioning của series]
Series này đi theo tinh thần **Credit Scoring & Risk Decisioning for Data Scientists**: không chỉ build model, mà hiểu model đi vào quyết định tín dụng, danh mục và stakeholder conversation như thế nào.
:::

## 2. Application score: quyết định trước khi book

Application score chạy tại thời điểm khách hàng apply hoặc underwriting. Dữ liệu thường gồm application form, bureau, affordability, device/fraud signals và channel.

Các quyết định thường gặp:

| Quyết định | Câu hỏi nghiệp vụ | Metric cần theo dõi |
|---|---|---|
| Approve/reject | Có nên cấp tín dụng không? | Approval rate, bad rate, expected loss |
| Limit | Cấp bao nhiêu exposure? | EAD, utilization, loss per booked amount |
| Pricing | Lãi suất/fee có bù rủi ro không? | Risk-adjusted margin, conversion |
| Manual review | Hồ sơ nào cần kiểm tra thêm? | Review rate, overturn rate, SLA |

Điểm DS cần nhớ: application score không chỉ rank khách hàng. Nếu output là PD và đi vào limit/pricing, **calibration** trở thành yêu cầu quản trị mô hình.

## 3. Behavioral score: quyết định sau khi khách hàng active

Behavioral score chạy sau booking, thường theo snapshot tháng, tuần hoặc ngày. Model có thêm dữ liệu thật: repayment, utilization, balance trend, missed payment, transaction behavior và contactability.

Các use case phổ biến:

| Use case | Câu hỏi | Output nên dùng |
|---|---|---|
| Early warning | Ai có nguy cơ thành delinquent? | P(30+ DPD trong 3 tháng) |
| Limit uplift | Ai nên được tăng hạn mức? | Risk + usage + profit |
| Retention/cross-sell | Ai phù hợp offer mới? | Response + risk after take-up |
| Collection prevention | Ai cần nhắc sớm? | Roll-forward probability |

Với uplift, model không nên chỉ hỏi “ai ít rủi ro nhất”. Một khách PD thấp nhưng không có nhu cầu dùng thêm limit có thể không tạo incremental value.

## 4. Stakeholder map

Một DS scoring giỏi phải dịch cùng một model sang nhiều ngôn ngữ:

| Stakeholder | Họ quan tâm | DS nên nói bằng |
|---|---|---|
| Risk | Risk appetite, bad rate, NPL | PD band, actual bad rate, vintage |
| Business | Growth, approval, conversion | Approval lift, booked volume |
| Finance | Profit, provision, ECL | Expected loss = PD x LGD x EAD |
| Portfolio | Sức khỏe danh mục | MOB, vintage, roll rate, channel mix |
| Collection | Workload, recovery | Cure rate, roll-forward, treatment value |

Model metric là ngôn ngữ của DS. Portfolio metric là ngôn ngữ của Risk. P&L metric là ngôn ngữ của Business và Finance.

## 5. Mini case: approval tăng nhưng NPL chưa tăng

Business giảm cutoff để tăng approval từ 35% lên 45%. Một tháng sau, NPL ratio vẫn ổn. Có thể kết luận policy mới an toàn không?

Chưa nên. NPL là lagging metric. Khoản vay mới cần thời gian để đi qua repayment cycle, phát sinh DPD và mature thành NPL. DS nên đọc:

```text
Incremental approval group
Score/PD band mix
FPD và 30+ DPD at MOB 1-3
Vintage by channel/product
Expected loss và marginal profit
```

Câu trả lời tốt trong meeting:

> NPL chưa tăng chưa đủ để kết luận. Em sẽ so vintage của cohort sau policy với cohort trước đó tại cùng MOB, đặc biệt FPD và 30+ DPD. Nếu nhóm approve thêm có early delinquency cao hơn baseline, NPL có thể tăng muộn hơn.

## 6. Checklist cho DS

- Model chạy tại submit application, underwriting hay trước disbursement?
- Feature có available tại decision point không?
- Score dùng cho rank, cutoff, limit, pricing hay reporting?
- Bad definition và performance window có khớp với monitoring không?
- Có đo impact theo marginal group, không chỉ portfolio average không?
- Có stakeholder translation cho Risk, Business, Finance và Collection không?

## EN

### Credit scoring is part of risk decisioning

A retail credit account usually moves through:

```text
Application -> Underwriting -> Approval/Reject -> Booking -> Repayment
-> Delinquency -> Collection -> Write-off / Recovery
```

Credit scoring is not just a model that predicts bad customers. It supports decisions across the lifecycle: approval, limit, pricing, early warning, portfolio monitoring and collection.

### Application score

An application score is used before booking, usually at application submission or underwriting. It supports approve/reject, credit limit, pricing and manual review decisions. If the model output is used as PD in pricing or expected loss, calibration matters as much as ranking.

### Behavioral score

A behavioral score is used after the account is active. It can use repayment, utilization, missed payment, balance trend and transaction behavior. Common use cases include early warning, limit uplift, cross-sell, retention and collection prevention.

### Stakeholder translation

Different stakeholders read the same model differently:

| Stakeholder | Main concern | DS translation |
|---|---|---|
| Risk | Risk appetite, bad rate, NPL | PD bands, actual bad rate, vintage |
| Business | Growth and conversion | Approval lift, booked volume |
| Finance | Profit and provision | Expected loss = PD x LGD x EAD |
| Portfolio | Book health | MOB, vintage, roll rate |
| Collection | Workload and recovery | Cure rate, roll-forward, treatment value |

### Practical takeaway

If approval increases but NPL has not moved, do not conclude the new policy is safe. NPL is a lagging metric. Check FPD, 30+ DPD at early MOB, vintage performance and the marginal approval group.
