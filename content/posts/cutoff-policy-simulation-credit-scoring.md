---
title: "Cutoff Simulation: Approval Tăng Thì Risk Và Profit Đổi Thế Nào"
date: "2026-06-09"
excerpt: >
  Cutoff không chỉ là một ngưỡng approve/reject. Đó là điểm cân bằng giữa growth,
  risk appetite, expected loss, pricing, limit và marginal profit của nhóm khách
  được approve thêm.
category: data-science
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 6 / 8  
> Trước: [Bài 5 — Calibration trong credit scoring](/blog/model-calibration-credit-scoring/)  
> Tiếp: [Bài 7 — Limit assignment và risk-based pricing](/blog/limit-pricing-credit-scoring/)

---

## Điểm cần nhớ

- Với PD model, cutoff thường có dạng `approve nếu PD <= threshold`.
- Nới cutoff làm approval tăng nhưng risk không tăng đều ở mọi segment.
- Quyết định cutoff nên dựa vào marginal group, không chỉ portfolio average.
- Expected loss cần dùng PD đã calibrated hoặc actual bad rate đủ mature.
- Một policy tốt có thể nới có chọn lọc theo segment/channel thay vì nới đồng loạt.

## VI

## 1. Cutoff là gì?

Cutoff là ngưỡng biến model score thành quyết định. Nếu model output là PD:

```text
Approve nếu PD <= 5%
Reject hoặc manual review nếu PD > 5%
```

Khi Business muốn tăng approval, họ thường đề xuất nới cutoff:

```text
PD <= 5% -> PD <= 7.5%
```

DS cần trả lời: approve thêm bao nhiêu, risk tăng bao nhiêu và profit còn đáng không.

## 2. Policy simulation table

Bảng simulation tối thiểu nên có:

| Cutoff PD | Approval | Avg PD | Expected loss | Revenue | Profit |
|---|---:|---:|---:|---:|---:|
| <= 4% | 30% | 2.2% | 2.0B | 8.0B | 3.5B |
| <= 5% | 35% | 2.8% | 2.8B | 9.5B | 4.1B |
| <= 7.5% | 45% | 3.6% | 4.5B | 12.0B | 4.0B |
| <= 10% | 55% | 4.8% | 7.0B | 14.0B | 2.5B |

Cutoff approval cao nhất không nhất thiết là cutoff tốt nhất. Trong ví dụ này, `PD <= 5%` có profit cao hơn `PD <= 7.5%`.

## 3. Marginal approval

Nếu nới từ `PD <= 5%` lên `PD <= 7.5%`, nhóm quyết định mới là:

```text
5% < PD <= 7.5%
```

Đây là **marginal group**. Phải đọc riêng:

```text
Volume
Actual bad rate
Expected loss
Revenue
Profit
Channel/segment mix
Limit và pricing
```

Portfolio cum bad rate có thể vẫn dưới risk appetite, nhưng marginal group có thể lỗ.

## 4. Expected loss

Công thức nền:

```text
Expected loss = PD x LGD x EAD
```

Ở mức portfolio:

```text
Total expected loss = sum(PD_i x LGD_i x EAD_i)
```

Nếu chưa có LGD/EAD đủ tốt, có thể dùng proxy như bad rate x average outstanding, nhưng phải ghi rõ assumption.

## 5. Segment và channel simulation

Không nên chỉ simulate overall. Một cutoff mới có thể tốt ở salaried customers nhưng xấu ở affiliate channel.

Ví dụ:

| Marginal segment | Approval lift | Actual bad rate | Recommendation |
|---|---:|---:|---|
| Salaried | +5pp | 4.2% | Approve with standard limit |
| Existing customer | +2pp | 3.8% | Approve |
| Affiliate NTB | +3pp | 8.5% | Exclude or manual review |

Đây là cách biến model analysis thành policy recommendation.

## 6. Stakeholder translation

Nếu Business hỏi:

> Hạ cutoff để approval tăng 10 điểm phần trăm được không?

Câu trả lời tốt:

> Có thể, nhưng không nên nới đồng loạt. Nhóm marginal `5% < PD <= 7.5%` có risk cao hơn baseline. Em đề xuất approve phần salaried và existing customer, giữ manual review hoặc reject affiliate NTB, đồng thời monitor FPD và 30+ DPD at MOB 1-3.

## 7. Checklist

- PD đã calibrated chưa?
- Population là application, approved hay booked?
- Có tính conversion/take-up không?
- Có EAD, LGD, limit, pricing và tenor không?
- Có đọc marginal group không?
- Có tách channel/product/segment không?
- Có rollout guardrail và rollback trigger không?

## EN

### Cutoff is a business decision

A cutoff turns model output into a decision. For a PD model, the rule may be `approve if PD <= threshold`. Relaxing a cutoff increases approval, but it also changes expected loss, pricing, limit and portfolio mix.

### Marginal group matters

If the policy moves from `PD <= 5%` to `PD <= 7.5%`, the marginal group is `5% < PD <= 7.5%`. This is the group that should drive the decision. Portfolio averages may still look acceptable because better bands pull the average down.

### Expected loss

Use:

```text
Expected loss = PD x LGD x EAD
```

Use calibrated PD or mature observed bad rate when possible. If proxies are used, state the assumptions clearly.

### Practical takeaway

A good cutoff recommendation is rarely “approve more everywhere”. It should specify which segments to approve, which channels to exclude, how to adjust limit/pricing and what early metrics to monitor.
