---
title: "DPD, MOB Và Vintage Analysis: Vì Sao NPL Luôn Đến Muộn"
date: "2026-06-03"
excerpt: >
  NPL là một chỉ số đến muộn. Nếu chờ NPL để đánh giá policy mới, bạn có thể đã để
  rủi ro đi quá xa. Bài này dùng DPD, FPD, MOB và vintage để đọc tín hiệu sớm hơn.
category: banking
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 3 / 8  
> Trước: [Bài 2 — Labels, outcome window và maturity](/blog/credit-labels-outcome-window/)  
> Tiếp: [Bài 4 — Scorecard và PD band](/blog/scorecard-pd-band-credit-scoring/)

---

## Điểm cần nhớ

- NPL là lagging metric; early delinquency và vintage mới là nơi policy change lộ tín hiệu sớm.
- DPD bucket là cách portfolio team nhìn dòng chảy rủi ro qua thời gian.
- MOB giúp so các khoản vay ở cùng “độ tuổi”, tránh kết luận sai vì cohort chưa mature.
- FPD và 30+ DPD at MOB 1-3 là cầu nối giữa approval tăng hôm nay và NPL vài tháng sau.
- Vintage analysis là công cụ stakeholder management: nó biến tranh luận “có vẻ ổn” thành bằng chứng theo cohort.

## VI

## 1. Nếu chờ NPL, bạn đang đọc quá khứ

Khi business hỏi “approval tăng rồi, sao NPL chưa tăng?”, câu trả lời ngắn là: vì NPL cần thời gian để xuất hiện. Một khoản vay mới book tháng này chưa thể thành 90+ DPD ngay nếu chưa đi qua đủ repayment cycle.

NPL hữu ích để biết danh mục đã xấu đến đâu. Nhưng để biết policy mới **đang bắt đầu xấu đi hay chưa**, DS cần đọc sớm hơn:

```text
FPD -> 30+ DPD at MOB 1-3 -> 60+ DPD at MOB 3-6 -> NPL/90+ DPD
```

Đây là lý do DPD, MOB và vintage analysis quan trọng hơn nhiều so với một bảng NPL hiện tại trong policy review.

## 2. DPD bucket: dòng chảy của rủi ro

**DPD (Days Past Due)** đo số ngày quá hạn. Nhưng trong portfolio management, điều quan trọng không chỉ là DPD tại một thời điểm, mà là khách hàng đang di chuyển qua bucket nào.

| Bucket | Cách đọc | Decision implication |
|---|---|---|
| Current | Đang performing | Monitor risk signal |
| 1-30 DPD | Early delinquency | Reminder, early collection |
| 31-60 DPD | Roll-forward risk rõ hơn | Call treatment, payment plan |
| 61-90 DPD | Khó cure hơn | Intensive collection |
| 90+ DPD | Default/NPL theo nhiều quy ước | Provision, recovery, write-off strategy |

DPD bucket cho DS một cách nhìn động: risk không “nhảy” thẳng từ good sang NPL. Nó thường roll qua nhiều trạng thái.

## 3. FPD: tín hiệu rất sớm về quality of approval

**FPD (First Payment Default)** là việc khách hàng trễ hoặc không trả kỳ thanh toán đầu tiên. Tùy policy, có thể là FPD1, FPD5, FPD30.

FPD đặc biệt hữu ích khi vừa thay đổi cutoff, channel, underwriting rule hoặc fraud rule. Nếu nhóm approve thêm có FPD cao bất thường, vấn đề có thể nằm ở affordability, fraud, onboarding hoặc channel quality.

Stakeholder-ready answer:

> NPL chưa tăng chưa có nghĩa policy mới an toàn. Em sẽ xem FPD và 30+ DPD ở các cohort mới trước. Nếu FPD tăng ở marginal approval group, đó là tín hiệu sớm rằng NPL có thể tăng sau khi cohort mature.

## 4. MOB: so sánh công bằng theo tuổi khoản vay

**MOB (Months on Books)** là số tháng kể từ khi khoản vay được book.

```text
MOB 0: tháng book
MOB 1: sau 1 tháng
MOB 3: sau 3 tháng
MOB 6: sau 6 tháng
```

Không nên so NPL của cohort book tháng trước với cohort đã book 12 tháng. Cohort mới chưa có đủ thời gian để lộ bad. MOB giúp so apples-to-apples: Jan tại MOB 3 với Feb tại MOB 3, không phải Jan hiện tại với Feb hiện tại.

## 5. Vintage analysis: policy monitoring theo cohort

Vintage analysis chia danh mục theo tháng book, rồi đọc performance tại cùng MOB.

| Vintage | MOB 1 30+ DPD | MOB 3 30+ DPD | MOB 6 90+ DPD |
|---|---:|---:|---:|
| Jan | 1.2% | 2.8% | 3.5% |
| Feb | 1.3% | 3.0% | - |
| Mar | 2.1% | - | - |

Nếu Mar tại MOB 1 đã cao hơn Jan/Feb rõ rệt, DS không cần chờ Mar tới MOB 6 mới điều tra. Vintage không chỉ là chart đẹp; nó là hệ thống cảnh báo sớm cho policy và channel shift.

## 6. Mini case: cutoff mới trông ổn vì cohort còn non-MOB

Policy giảm cutoff từ `PD <= 5%` xuống `PD <= 7.5%` từ tháng 3. Tháng 4, NPL ratio vẫn không đổi. Business kết luận policy tốt.

Cách phản biện:

| Kiểm tra | Vì sao cần |
|---|---|
| Marginal group `5% < PD <= 7.5%` | Đây mới là nhóm được approve thêm |
| FPD by channel | Bắt tín hiệu affordability/fraud sớm |
| 30+ DPD at MOB 1-3 | Khớp với bad definition 30+ |
| Vintage Mar vs Jan/Feb | So cùng độ tuổi khoản vay |
| Booked amount by band | Risk có thể tăng theo exposure, không chỉ account count |

Kết luận tốt:

> Policy chưa đủ mature để đọc bằng NPL. Early vintage cho thấy marginal group từ affiliate channel có FPD cao hơn baseline. Em đề xuất giữ cutoff mới cho salaried segment, nhưng đưa affiliate vào manual review đến khi MOB 3 đủ dữ liệu.

## 7. Common mistakes

| Mistake | Hậu quả |
|---|---|
| Gán Good cho cohort chưa mature | Model underestimate risk |
| So NPL cohort mới với cohort cũ | Kết luận policy mới “đẹp” giả tạo |
| Chỉ đọc overall vintage | Channel xấu bị che bởi segment tốt |
| Dùng FPD như credit bad tuyệt đối | Có thể lẫn fraud, onboarding và payment setup issue |

## 8. Checklist

- Bad definition là 30+, 60+ hay 90+ DPD?
- Performance window là bao lâu?
- Cohort đã đủ mature chưa?
- Vintage có tách theo PD band, product, channel, NTB/ETB không?
- Có đọc marginal approval group không?
- Có guardrail cho FPD và 30+ DPD at MOB 1-3 không?

## 9. Takeaway

NPL cho bạn biết rủi ro đã đến nơi. Vintage cho bạn biết rủi ro đang đi tới đó như thế nào. Trong credit decisioning, đọc được đường đi quan trọng hơn chờ điểm cuối.

## EN

### NPL is late by design

If you wait for NPL to evaluate a new policy, you are reading the past. A newly booked loan needs time to pass through repayment cycles, become delinquent and mature into default.

The earlier chain is:

```text
FPD -> 30+ DPD at MOB 1-3 -> 60+ DPD at MOB 3-6 -> NPL/90+ DPD
```

### Why MOB and vintage matter

MOB makes comparisons fair by account age. Vintage analysis groups loans by booking month and compares performance at the same MOB. This prevents a common mistake: declaring a new cohort safe simply because it is too young to show NPL.

### Practical case

If a cutoff is relaxed from `PD <= 5%` to `PD <= 7.5%`, do not judge the change by current NPL. Read the marginal group, FPD, 30+ DPD at MOB 1-3, and vintage by channel and product.

### Takeaway

NPL tells you where risk has already arrived. Vintage tells you how risk is moving. A DS in lending needs the second view to manage stakeholders before the first one becomes painful.
