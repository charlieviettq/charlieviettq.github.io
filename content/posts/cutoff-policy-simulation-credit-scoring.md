---
title: "Cutoff Simulation: Approval Tăng Thì Risk Và Profit Đổi Thế Nào"
date: "2026-06-09"
excerpt: >
  Cutoff là một business decision được ngụy trang dưới dạng model threshold. Bài này
  đọc approval, marginal group, expected loss, profit và rollout guardrail như một
  bài toán decisioning, không chỉ là chọn ngưỡng.
category: data-science
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 6 / 8  
> Trước: [Bài 5 — Calibration trong credit scoring](/blog/model-calibration-credit-scoring/)  
> Tiếp: [Bài 7 — Limit assignment và risk-based pricing](/blog/limit-pricing-credit-scoring/)

---

## Điểm cần nhớ

- Cutoff không phải ngưỡng kỹ thuật; nó là nơi growth target, risk appetite và portfolio economics va vào nhau.
- Với PD model, nới cutoff nghĩa là approve thêm một marginal group cụ thể, không phải làm cả portfolio xấu đều nhau.
- Portfolio average có thể đẹp trong khi marginal group lỗ.
- Expected loss nên dùng calibrated PD hoặc observed bad rate đã mature.
- Recommendation tốt thường là nới có chọn lọc theo segment/channel, kèm guardrail và rollback trigger.

## VI

## 1. Cutoff là business decision đội lốt model threshold

Trong notebook, cutoff nhìn như một dòng rule:

```text
Approve nếu PD <= 7.5%
```

Trong business, cutoff là quyết định về việc tổ chức muốn mua thêm bao nhiêu growth với bao nhiêu risk. Nếu cutoff bị xem như tham số kỹ thuật, DS sẽ bị kéo vào tranh luận “hạ thêm chút được không?”. Nếu cutoff được xem như decisioning lever, cuộc nói chuyện chuyển sang câu hỏi đúng hơn:

```text
Approve thêm nhóm nào?
Expected loss tăng bao nhiêu?
Pricing/limit có bù được không?
Segment nào nên exclude?
Monitor bằng guardrail nào?
```

## 2. Cutoff simulation không chỉ là approval curve

Bảng cutoff tối thiểu phải nối approval với risk và economics.

| Cutoff PD | Approval | Avg PD | Expected loss | Revenue | Profit |
|---|---:|---:|---:|---:|---:|
| <= 4% | 30% | 2.2% | 2.0B | 8.0B | 3.5B |
| <= 5% | 35% | 2.8% | 2.8B | 9.5B | 4.1B |
| <= 7.5% | 45% | 3.6% | 4.5B | 12.0B | 4.0B |
| <= 10% | 55% | 4.8% | 7.0B | 14.0B | 2.5B |

Cutoff có approval cao nhất không nhất thiết là cutoff tốt nhất. Ở ví dụ này, `PD <= 5%` tạo profit cao hơn `PD <= 7.5%`, dù growth thấp hơn.

## 3. Marginal group là quyết định thật

Nếu policy đổi từ:

```text
PD <= 5%
```

sang:

```text
PD <= 7.5%
```

quyết định mới không phải toàn bộ nhóm `PD <= 7.5%`. Quyết định mới là:

```text
5% < PD <= 7.5%
```

Đây là marginal group. Nếu nhóm này lỗ, việc portfolio sau cutoff vẫn dưới risk appetite chưa đủ để approve đồng loạt.

| Population | Bad rate | Profit/account | Cách đọc |
|---|---:|---:|---|
| Existing approved `PD <= 5%` | 2.8% | +120K | Core book tốt |
| Marginal `5% < PD <= 7.5%` | 6.5% | -20K | Approve thêm đang phá economics |
| Combined `PD <= 7.5%` | 3.6% | +85K | Average che marginal loss |

## 4. Expected loss: cần xác suất đáng tin

Công thức nền:

```text
Expected loss = PD x LGD x EAD
```

Nếu raw PD chưa calibrated, simulation pricing/limit sẽ sai scale. Nếu cohort chưa mature, actual bad rate cũng chưa đủ tin. Vì vậy cutoff simulation phải ghi rõ nguồn risk estimate:

| Source | Khi nào dùng | Rủi ro |
|---|---|---|
| Calibrated PD | Policy simulation trước rollout | Phụ thuộc calibration và population stability |
| Matured actual bad rate | Backtest hoặc policy review | Cần đủ performance window |
| Proxy bad rate | Thiếu LGD/EAD hoặc data sớm | Phải ghi assumption rõ |

## 5. Segment/channel simulation

Cutoff hiếm khi nên nới đồng loạt. Một cutoff có thể tốt ở salaried customers nhưng xấu ở affiliate channel.

| Marginal segment | Approval lift | Actual bad rate | Expected profit | Recommendation |
|---|---:|---:|---:|---|
| Salaried NTB | +5pp | 4.2% | +60K/account | Roll out |
| Existing customer | +2pp | 3.8% | +80K/account | Roll out |
| Affiliate NTB | +3pp | 8.5% | -40K/account | Exclude/manual review |

Đây là nơi DS chuyển từ “model analysis” sang “policy recommendation”.

## 6. Stakeholder-ready answer

Nếu Business hỏi:

> Hạ cutoff để approval tăng thêm 10 điểm phần trăm được không?

Câu trả lời nên là:

> Có thể tăng approval, nhưng không nên nới đồng loạt. Nhóm marginal `5% < PD <= 7.5%` tạo risk cao hơn baseline. Simulation cho thấy salaried và existing customer vẫn có expected profit dương, còn affiliate NTB âm sau khi tính expected loss. Em đề xuất rollout có chọn lọc và monitor FPD, 30+ DPD at MOB 1-3 theo channel.

## 7. Common mistakes

| Mistake | Vì sao nguy hiểm |
|---|---|
| Chọn cutoff theo approval target trước | Risk và profit thành hậu kiểm |
| Chỉ đọc cum bad rate | Marginal group có thể lỗ |
| Dùng raw PD chưa calibrated | Expected loss/pricing sai scale |
| Không tính conversion/take-up | Revenue bị thổi phồng |
| Không tách channel | Segment xấu bị average che |

## 8. Checklist

- PD đã calibrated chưa?
- Population là application, approved hay booked?
- Có tính conversion từ approved sang booked không?
- Có EAD, LGD, limit, pricing, tenor không?
- Marginal group có profit dương không?
- Có rollout guardrail và rollback trigger không?

## 9. Takeaway

Cutoff là nơi model gặp chiến lược kinh doanh. Một DS tốt không chỉ đưa ra ngưỡng; họ đưa ra policy package: approve ai, không approve ai, cấp bao nhiêu, định giá thế nào, và khi nào phải dừng.

## EN

### A cutoff is a business decision

A cutoff looks like a model threshold, but it is really a decision about how much growth the lender is willing to buy at what risk and economics.

For a PD model, relaxing the rule from `PD <= 5%` to `PD <= 7.5%` adds the marginal group `5% < PD <= 7.5%`. This group should drive the decision.

### The marginal group matters

The combined portfolio can still look acceptable while the marginal group loses money. That is why cutoff simulation should include approval, bad rate, expected loss, revenue, profit and segment/channel mix.

### Practical takeaway

A good recommendation is rarely “lower the cutoff everywhere”. It should specify which segments to approve, which channels to exclude, how to adjust limit/pricing, and which early delinquency guardrails to monitor.
