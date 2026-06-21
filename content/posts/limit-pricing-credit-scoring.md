---
title: "Limit Assignment Và Risk-Based Pricing: Khi PD Đi Vào Quyết Định Tiền Thật"
date: "2026-06-12"
excerpt: >
  Hai khách hàng cùng PD có thể tạo expected loss rất khác nhau. Khi model score đi
  vào hạn mức và pricing, DS phải nối probability với exposure, utilization, margin
  và adverse selection.
category: data-science
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 7 / 8  
> Trước: [Bài 6 — Cutoff simulation](/blog/cutoff-policy-simulation-credit-scoring/)  
> Tiếp: [Bài 8 — Collection score](/blog/collection-score-design/)

---

## Điểm cần nhớ

- Credit decisioning không thể dừng ở PD; loss còn phụ thuộc LGD và EAD.
- Limit là exposure decision, không chỉ là benefit cho khách hàng.
- Pricing cao hơn không tự động bù risk; nó có thể làm conversion giảm và adverse selection tăng.
- Behavioral uplift cần tối ưu incremental value, không chỉ chọn khách hàng có PD thấp.
- Một strategy tốt phải monitor theo PD band, limit band, utilization, vintage và profit.

## VI

## 1. PD không phải toàn bộ câu chuyện tiền

PD trả lời xác suất khách hàng bad. Nhưng ngân hàng/fintech mất bao nhiêu tiền còn phụ thuộc khoản exposure khi bad và khả năng recovery.

```text
Expected loss = PD x LGD x EAD
```

Hai khách hàng cùng PD có thể tạo expected loss rất khác nhau:

```text
Customer A: PD = 5%, EAD = 5M, LGD = 80%
Expected loss = 0.2M

Customer B: PD = 5%, EAD = 40M, LGD = 80%
Expected loss = 1.6M
```

Cùng probability, nhưng B tạo expected loss gấp 8 lần vì EAD cao hơn. Đây là lý do limit assignment là một quyết định risk, không chỉ là quyết định growth.

## 2. Limit assignment: cấp exposure có chủ đích

Limit assignment trả lời:

```text
Nếu approve, tổ chức nên chấp nhận bao nhiêu exposure?
```

Input thường gồm:

| Input | Vai trò |
|---|---|
| PD / risk band | Xác suất bad |
| Income / affordability | Khả năng trả |
| Existing obligations | Debt burden |
| Product / tenor | Cơ chế trả nợ |
| Expected utilization | EAD thực tế có thể phát sinh |
| Policy cap | Giới hạn kiểm soát |

Một policy đơn giản có thể như sau:

| PD band | Decision | Limit multiplier | Pricing |
|---|---|---:|---|
| 0-2.5% | Approve | 100% eligible limit | Low |
| 2.5-5% | Approve | 80% | Standard |
| 5-7.5% | Approve | 60% | Higher |
| 7.5-10% | Manual review | 40% | High |
| >10% | Reject | - | - |

Nhưng bảng này chỉ là starting point. Nó phải được kiểm chứng bằng utilization, actual bad rate và profit theo vintage.

## 3. Risk-based pricing và bẫy adverse selection

Risk-based pricing nghe đơn giản: khách rủi ro cao trả lãi cao hơn. Nhưng lending không phải pricing trong chân không. Giá thay đổi hành vi chọn offer.

Nếu price quá cao:

```text
Good customers leave
Riskier customers still accept
Portfolio mix worsens
```

Đó là adverse selection. Vì vậy pricing simulation cần có take-up/conversion curve, không chỉ cộng thêm spread vào nhóm PD cao.

## 4. Unit economics: nói chuyện với Finance bằng tiền

Một decision package nên đọc bằng unit economics:

```text
Expected profit
= Interest and fee revenue
- Expected loss
- Funding cost
- Operating cost
- Acquisition cost
```

Nếu DS chỉ nói “bad rate tăng từ 3% lên 4%”, Finance vẫn phải tự dịch sang tiền. Nếu DS nói “expected loss tăng 1.7B nhưng revenue tăng 2.3B, sau funding cost profit vẫn dương 0.4B”, cuộc họp sẽ khác.

## 5. Behavioral uplift: không phải cứ khách tốt là tăng limit

Với behavioral score, uplift thường bị hiểu nhầm là “tăng limit cho khách rủi ro thấp”. Nhưng khách PD thấp, utilization thấp, không có nhu cầu dùng thêm limit có thể tạo rất ít incremental revenue.

Framework tốt hơn:

| Dimension | Câu hỏi |
|---|---|
| Risk | Khách có an toàn nếu tăng exposure không? |
| Need | Khách có khả năng dùng thêm limit không? |
| Response | Khách có nhận offer không? |
| Economics | Incremental margin có bù incremental expected loss không? |

## 6. Mini case: cùng PD, policy khác nhau

Hai khách đều PD 5%. Customer A có income ổn, utilization thấp, nhu cầu thấp. Customer B có repayment tốt, utilization cao, income ổn và thường dùng hết hạn mức.

Recommendation:

| Customer | Risk | Need | Decision |
|---|---|---|---|
| A | Low | Low | Không ưu tiên uplift |
| B | Medium-low | High | Uplift có cap, monitor utilization và 30+ DPD |

Không phải vì B “an toàn hơn”, mà vì incremental value có khả năng cao hơn sau khi đã cap risk.

## 7. Stakeholder-ready answer

Nếu Risk hỏi:

> Vì sao khách PD 6% vẫn approve?

Trả lời:

> Vì decision không chỉ dựa vào PD. Với limit thấp hơn, expected utilization được kiểm soát và pricing phù hợp, nhóm này vẫn có expected profit dương và nằm trong risk appetite. Em đề xuất monitor riêng theo PD band x limit band, đặc biệt 30+ DPD at MOB 3.

## 8. Common mistakes

| Mistake | Hậu quả |
|---|---|
| Dùng PD như risk duy nhất | Bỏ qua exposure và recovery |
| Pricing cao để “bù hết risk” | Dễ tạo adverse selection |
| Không tính take-up | Revenue/profit bị overestimate |
| Tăng limit cho khách tốt nhất | Có thể không tạo incremental usage |
| Monitor bad rate nhưng không monitor loss amount | Exposure mix bị bỏ qua |

## 9. Checklist

- PD dùng trong pricing đã calibrated chưa?
- EAD estimate dựa trên limit, balance hay expected utilization?
- LGD/recovery assumption đến từ đâu?
- Pricing có làm conversion thay đổi không?
- Strategy có tách theo PD band x limit band không?
- Có monitor adverse selection sau rollout không?

## 10. Takeaway

PD là xác suất. Limit và pricing biến xác suất đó thành tiền thật. Khi DS nối được PD với exposure, utilization và margin, họ không còn chỉ “support model”; họ đang thiết kế credit economics.

## EN

### Credit decisioning cannot stop at PD

Two customers with the same PD can generate very different expected losses. The missing pieces are LGD and EAD:

```text
Expected loss = PD x LGD x EAD
```

Limit assignment is therefore an exposure decision, not just a customer benefit.

### Pricing changes the population

Higher pricing does not automatically compensate for higher risk. It can reduce conversion among good customers and leave a riskier mix of customers accepting the offer. That is adverse selection.

### Behavioral uplift

For limit uplift, do not simply target the lowest-risk customers. Target accounts where incremental usage and margin are expected to exceed incremental expected loss and cost.

### Practical takeaway

PD is probability. Limit and pricing turn that probability into money. A strong DS connects calibrated PD with exposure, utilization, conversion and unit economics.
