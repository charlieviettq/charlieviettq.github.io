---
title: "Limit Assignment Và Risk-Based Pricing: Khi PD Đi Vào Quyết Định Tiền Thật"
date: "2026-06-12"
excerpt: >
  Hai khách hàng cùng PD không nhất thiết có cùng expected loss. Khi score đi vào
  hạn mức và pricing, DS phải nối PD với EAD, LGD, utilization, conversion, margin
  và adverse selection.
category: data-science
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 7 / 8  
> Trước: [Bài 6 — Cutoff simulation](/blog/cutoff-policy-simulation-credit-scoring/)  
> Tiếp: [Bài 8 — Collection score](/blog/collection-score-design/)

---

## Điểm cần nhớ

- PD chỉ là xác suất bad; expected loss còn phụ thuộc LGD và EAD.
- Limit cao làm exposure lớn hơn, nên cùng PD vẫn có thể tạo loss rất khác.
- Risk-based pricing cần tính conversion và adverse selection, không chỉ cộng thêm lãi suất.
- Behavioral uplift nên tối ưu incremental value, không chỉ chọn khách PD thấp nhất.
- Pricing/limit strategy phải được monitor theo band, vintage, utilization và profitability.

## VI

## 1. Limit assignment là gì?

Limit assignment trả lời:

```text
Nếu approve, cấp bao nhiêu hạn mức hoặc khoản vay?
```

Input thường gồm PD, income, affordability, debt-to-income, bureau obligations, existing exposure, product type, tenor và policy cap.

Logic đơn giản:

```text
Low PD + strong affordability -> higher limit
High PD + weak affordability -> lower limit or reject
```

## 2. Vì sao bad rate chưa đủ?

Hai nhóm có cùng bad rate nhưng exposure khác nhau sẽ có loss khác nhau.

```text
Customer A: PD = 5%, EAD = 5M, LGD = 80%
Expected loss = 5% x 80% x 5M = 0.2M

Customer B: PD = 5%, EAD = 40M, LGD = 80%
Expected loss = 5% x 80% x 40M = 1.6M
```

Cùng PD, Customer B có expected loss gấp 8 lần vì EAD cao hơn.

## 3. Risk-based pricing

Risk-based pricing định giá theo rủi ro:

```text
PD thấp -> price thấp hơn, limit tốt hơn
PD cao -> price cao hơn, limit thấp hơn hoặc manual review
```

Nhưng tăng price không tự động giải quyết risk. Nếu price quá cao, khách tốt có thể từ chối, còn khách rủi ro vẫn nhận vì ít lựa chọn hơn. Đây là adverse selection.

## 4. Unit economics

Một khoản vay nên được đọc bằng economics:

```text
Expected profit
= Expected revenue
- Expected loss
- Funding cost
- Operating cost
- Acquisition cost
```

Nếu DS chỉ report bad rate mà không nối sang expected profit, Business và Finance sẽ khó dùng kết quả để quyết định.

## 5. Strategy theo PD band

Ví dụ:

| PD band | Decision | Limit multiplier | Pricing |
|---|---|---:|---|
| 0-2.5% | Approve | 100% eligible limit | Low |
| 2.5-5% | Approve | 80% | Standard |
| 5-7.5% | Approve | 60% | Higher |
| 7.5-10% | Manual review | 40% | High |
| >10% | Reject | - | - |

Policy này chỉ là starting point. Cần validate bằng actual utilization, conversion, bad rate và profit theo vintage.

## 6. Behavioral uplift

Với behavioral score cho uplift, câu hỏi đúng không phải chỉ là:

```text
Ai ít rủi ro nhất?
```

Mà là:

```text
Tăng limit cho ai tạo incremental profit lớn hơn incremental risk?
```

Một framework thực dụng:

| Dimension | Câu hỏi |
|---|---|
| Risk | Khách có an toàn không? |
| Need | Khách có khả năng dùng thêm limit không? |
| Response | Khách có nhận offer không? |
| Profit | Incremental margin có bù expected loss không? |

## 7. Stakeholder translation

Nếu Risk hỏi vì sao PD 6% vẫn approve:

> Vì quyết định không chỉ dựa vào PD. Với limit thấp hơn, pricing phù hợp và expected utilization được kiểm soát, nhóm này vẫn có expected profit dương và nằm trong risk appetite. Em đề xuất monitor riêng vintage và 30+ DPD theo limit band.

## 8. Checklist

- PD đã calibrated chưa?
- EAD dùng current balance, limit hay expected utilization?
- LGD/recovery assumption là gì?
- Pricing có ảnh hưởng conversion không?
- Có monitor adverse selection không?
- Có đọc profit theo marginal limit increase không?

## EN

### PD enters real money decisions

Limit assignment decides how much exposure to grant. Risk-based pricing decides whether the price compensates for expected loss. PD alone is not enough.

### Expected loss

Two customers with the same PD can have very different expected losses:

```text
Expected loss = PD x LGD x EAD
```

Higher limit and utilization increase EAD, which increases expected loss.

### Pricing caveat

Higher pricing does not automatically solve higher risk. It can reduce conversion among good customers and attract riskier customers who have fewer alternatives. This is adverse selection.

### Behavioral uplift

For limit uplift, do not simply target the lowest-risk customers. Target customers where incremental revenue is expected to exceed incremental loss and cost.
