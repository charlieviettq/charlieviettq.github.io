---
title: "DPD, MOB Và Vintage Analysis: Vì Sao NPL Luôn Đến Muộn"
date: "2026-06-03"
excerpt: >
  Approval tăng hôm nay không làm NPL tăng ngay ngày mai. Để đọc rủi ro sớm, DS cần
  hiểu DPD, FPD, MOB, matured cohort và vintage analysis thay vì chỉ nhìn NPL hiện tại.
category: banking
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 3 / 8  
> Trước: [Bài 2 — Labels, outcome window và maturity](/blog/credit-labels-outcome-window/)  
> Tiếp: [Bài 4 — Scorecard và PD band](/blog/scorecard-pd-band-credit-scoring/)

---

## Điểm cần nhớ

- DPD đo số ngày quá hạn; DPD bucket là ngôn ngữ vận hành của portfolio risk.
- FPD là tín hiệu rất sớm sau booking, hữu ích khi review chất lượng approval mới.
- MOB giúp so sánh khoản vay ở cùng độ tuổi; không nên so cohort mới với cohort đã mature.
- Vintage analysis cho biết rủi ro đang phát triển theo tháng book như thế nào.
- NPL thường là lagging metric; nếu chờ NPL mới hành động thì policy có thể đã đi quá xa.

## VI

## 1. DPD là gì?

**DPD (Days Past Due)** là số ngày khách hàng trễ hạn so với ngày phải thanh toán.

Các bucket thường gặp:

| Bucket | Cách hiểu | Ý nghĩa risk |
|---|---|---|
| Current | Chưa quá hạn | Portfolio đang performing |
| 1-30 DPD | Trễ nhẹ | Early delinquency |
| 31-60 DPD | Trễ vừa | Bắt đầu có roll-forward risk |
| 61-90 DPD | Trễ nặng | Khó cure hơn |
| 90+ DPD | Default/NPL theo nhiều quy ước | Rủi ro đã mature |

Với application score, bad definition của nhiều team có thể là `30+ DPD within 6 months` hoặc `90+ DPD within 12 months`. Hai label này không tương đương.

## 2. FPD là gì?

**FPD (First Payment Default)** là việc khách hàng trễ hoặc không thanh toán ngay kỳ đầu tiên. Tùy công ty, FPD có thể là FPD1, FPD5, FPD30.

FPD hữu ích vì nó xuất hiện sớm hơn NPL. Nếu sau khi nới cutoff, FPD tăng mạnh ở cohort mới, đó là tín hiệu chất lượng approval đang xấu đi, dù NPL hiện tại chưa đổi.

## 3. MOB là gì?

**MOB (Months on Books)** là số tháng kể từ khi khoản vay được book hoặc giải ngân.

```text
MOB 0: tháng book
MOB 1: sau 1 tháng
MOB 3: sau 3 tháng
MOB 6: sau 6 tháng
```

MOB giúp tránh so sánh sai. Một cohort mới book 2 tháng chưa có đủ thời gian để trở thành 90+ DPD, nên nhìn NPL của cohort đó sẽ luôn “đẹp” hơn cohort cũ.

## 4. Vintage analysis là gì?

Vintage analysis chia danh mục theo tháng hoặc quý book, rồi so performance tại cùng MOB.

Ví dụ:

| Vintage | MOB 1 30+ DPD | MOB 3 30+ DPD | MOB 6 90+ DPD |
|---|---:|---:|---:|
| Jan | 1.2% | 2.8% | 3.5% |
| Feb | 1.3% | 3.0% | - |
| Mar | 2.1% | - | - |

Nếu Mar tại MOB 1 đã cao hơn Jan/Feb nhiều, DS nên cảnh báo sớm. Không cần chờ Mar mature tới MOB 6 mới bắt đầu điều tra.

## 5. Matured cohort

Nếu bad definition là `30+ DPD within 6 months`, chỉ những khoản vay đã đi qua đủ 6 tháng mới có thể gán Good/Bad cuối cùng.

Khoản vay chưa đủ performance window không nên bị gán Good chỉ vì hiện tại chưa bad. Đây là lỗi làm model underestimate risk.

## 6. Mini case: policy giảm cutoff

Policy mới approve thêm nhóm `5% < PD <= 7.5%`. Sau 1 tháng, NPL chưa tăng.

Cách đọc đúng:

```text
NPL chưa tăng: chưa kết luận
FPD tăng: tín hiệu sớm
30+ DPD at MOB 1-3 tăng: risk đang hình thành
Vintage mới xấu hơn vintage cũ: cần điều tra channel/segment
```

Câu trả lời stakeholder-ready:

> Approval tăng chưa chắc làm NPL tăng ngay vì NPL là lagging metric. Em sẽ đọc vintage theo MOB, đặc biệt FPD và 30+ DPD ở MOB 1-3 của nhóm marginal approval, rồi so với cohort trước policy.

## 7. Checklist monitoring

- Bad definition là 30+, 60+ hay 90+ DPD?
- Performance window là 3, 6, 12 tháng hay khác?
- Cohort đã mature chưa?
- Có tách vintage theo score band, channel và product không?
- Có đọc marginal group sau policy change không?
- Có phân biệt bin bad rate và cumulative bad rate không?

## EN

### Why NPL comes late

Approval changes show up immediately. NPL does not. New loans need time to pass through repayment cycles, become delinquent and mature into default. That is why DS teams should monitor early delinquency and vintage curves, not only current NPL.

### Core concepts

DPD measures days past due. FPD captures default on the first payment. MOB measures months on books. Vintage analysis compares cohorts at the same account age.

### Practical readout

If a cutoff change increases approval but NPL has not moved, check:

```text
FPD
30+ DPD at MOB 1-3
Vintage by score/PD band
Vintage by channel and product
Marginal approval group performance
```

### Key warning

Do not label unmatured loans as Good. If the label is `30+ DPD within 6 months`, a loan booked 2 months ago has not had enough time to reveal the outcome.
