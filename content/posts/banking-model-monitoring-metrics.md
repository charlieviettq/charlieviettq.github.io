---
title: "Gini, KS, PSI: Ba câu hỏi mà mọi model credit risk cần trả lời"
date: "2026-04-24"
excerpt: "AUC tháng trước 0.72, tháng này vẫn 0.72. Nhưng khách hàng đã thay đổi, policy đã thay đổi. Model có còn hoạt động không? Ba metrics này sẽ trả lời."
category: banking
---

## VI

### Tóm tắt

Ba câu hỏi cơ bản khi giám sát model credit risk:

1. **Model còn phân biệt được good vs bad không?** → Gini (hay AUC)
2. **Điểm tách biệt cực đại ở đâu?** → KS
3. **Khách hàng hôm nay có khác lúc train không?** → PSI

Ba câu hỏi độc lập. Có thể Gini ổn nhưng PSI cảnh báo. Có thể PSI cao nhưng không phải vì model kém mà vì policy thay đổi. Cần cả ba để có bức tranh đầy đủ.

---

### Ba màn hình trong phòng ICU

Bác sĩ trong ICU theo dõi đồng thời ba chỉ số: SpO₂ (nồng độ oxy), huyết áp, nhịp tim. Không ai nói "chỉ cần nhịp tim là đủ." Mỗi màn hình đo một thứ khác nhau, cùng nhau tạo thành bức tranh toàn diện về bệnh nhân.

Model credit risk cũng vậy. AUC 0.72 tuần này và 0.72 tuần trước trông giống nhau trên báo cáo. Nhưng nếu khách hàng đang apply loan tháng này là một population hoàn toàn khác (seasonal workers, new channel, macro shock), model đó có thể đang cho ra quyết định sai hàng loạt — mà dashboard AUC không hề thấy.

---

### Metric 1: Gini / AUC — "Model còn phân biệt được không?"

**AUC (Area Under ROC Curve)** đo xác suất model xếp hạng một good customer cao hơn một bad customer nếu chọn ngẫu nhiên.

**Gini = 2 × AUC − 1**

Cách đọc thực tế:

| AUC | Gini | Đánh giá trong credit |
|---|---|---|
| 0.50 | 0.00 | Random, vô dụng |
| 0.65 | 0.30 | Chấp nhận được (subprime) |
| 0.72 | 0.44 | Tốt (retail credit) |
| 0.80 | 0.60 | Xuất sắc |
| > 0.85 | > 0.70 | Đáng nghi — có thể leakage |

Threshold thực tế cho retail credit tại ngân hàng: **Gini ≥ 35%** trên OOT là acceptable. Dưới 30% cần review nghiêm túc.

**Khi Gini giảm, hỏi 3 câu:**
- Giảm trên train hay chỉ trên OOT? (Nếu chỉ OOT: model aging hoặc population shift)
- Giảm đồng đều hay chỉ ở một số segment? (Drill down by channel, product, vintage)
- Approval mix có thay đổi không? (Approve nhiều hơn ở score thấp sẽ kéo Gini xuống)

---

### Metric 2: KS — "Điểm tách biệt cực đại ở đâu?"

**KS (Kolmogorov-Smirnov)** là khoảng cách tối đa giữa cumulative distribution của good customers và bad customers theo thứ tự score.

Hình dung: xếp tất cả khách hàng theo score từ thấp đến cao. Vẽ hai đường: % bad đã "bắt được" tích lũy theo score, và % good đã "bắt được" tích lũy theo score. KS là khoảng cách tối đa giữa hai đường đó.

**KS = 42** nghĩa là tại một điểm trên score distribution, model đã capture được 42% khoảng cách giữa bad và good population.

| KS | Đánh giá |
|---|---|
| < 20 | Yếu |
| 20 – 30 | Chấp nhận được |
| 30 – 40 | Tốt |
| > 40 | Rất tốt |

**KS thường dùng để làm gì trong thực tế?**
- Tìm điểm cutoff tối ưu: điểm có KS cao nhất thường là vùng phân biệt tốt nhất
- So sánh hai model: model nào có KS cao hơn ở cùng score range?
- Visualize bằng Lorenz curve để trình bày cho risk committee

**Lưu ý quan trọng:** KS nhạy cảm với approval mix. Nếu bạn suddenly approve nhiều hơn ở score thấp (policy loosening), KS có thể giảm không phải vì model kém mà vì population on-book thay đổi.

---

### Metric 3: PSI — "Khách hàng có thay đổi không?"

**PSI (Population Stability Index)** so sánh distribution của score (hoặc một feature) giữa **thời điểm hiện tại** và **thời điểm training**. Đây là metric quan trọng nhất cho monitoring hàng tuần.

**Công thức:**

```
PSI = Σ (Actual% − Expected%) × ln(Actual% / Expected%)
```

Trong đó:
- `Expected%` = % khách hàng rơi vào mỗi score bin lúc training
- `Actual%` = % khách hàng rơi vào mỗi score bin hiện tại

**Thresholds chuẩn ngành:**

| PSI | Tín hiệu | Hành động |
|---|---|---|
| < 0.10 | ✅ Ổn định | Monitor định kỳ |
| 0.10 – 0.25 | ⚠️ Cần chú ý | Investigate, tìm nguyên nhân |
| > 0.25 | 🔴 Shift nghiêm trọng | Review model, cân nhắc retrain |

**Ví dụ thực tế:** PSI đột ngột tăng lên 0.31 vào tháng 3. Trước khi panic, hãy kiểm tra:
- Tháng 3 có seasonal effect không? (ví dụ: Tết → applicant profile khác hoàn toàn)
- Có campaign marketing mới targeting segment khác không?
- Có thay đổi channel distribution không?

PSI cao không tự động nghĩa model cần retrain. Nó nghĩa là **population đã thay đổi** — và bạn cần hiểu *tại sao* trước khi quyết định.

---

### Bảng action khi metrics vượt ngưỡng

| Signal | Nguyên nhân phổ biến | Hành động |
|---|---|---|
| Gini giảm > 5pt (OOT) | Model aging, feature drift | Feature-level PSI, OOT drill-down by vintage |
| Gini giảm nhưng PSI ổn | Approval mix shift | Check segment distribution, review cutoff |
| KS giảm > 10pt | Approval policy loosening | Vintage analysis by score band |
| PSI > 0.25 | Population shift, new channel | Feature-level PSI để tìm culprit variable |
| PSI cao + Gini giảm | Genuine drift | Trigger model review, escalate |
| PSI cao nhưng Gini ổn | Policy/seasonal effect | Document, continue monitoring |
| Tất cả ổn nhưng NPL tăng | Macro/external shock | Policy review, không phải model review |

---

### Monitoring cadence thực tế

Không phải mọi metric đều cần theo dõi hàng ngày — đó là recipe cho alert fatigue:

| Metric | Cadence | Lý do |
|---|---|---|
| PSI (score) | Weekly | Nhẹ, chạy tự động, catch shift sớm |
| PSI (key features) | Bi-weekly | Tìm culprit variable khi score PSI cao |
| Gini / KS | Monthly | Cần đủ volume để estimate ổn định |
| Calibration check | Quarterly | Cần outcome đã mature (3–6 months) |
| Full OOT re-run | Semi-annually | Đánh giá toàn diện, báo cáo risk committee |

---

### Pitfalls phổ biến

**Alert fatigue.** Đặt quá nhiều threshold → mọi người ignore hết. Prioritize: PSI của score là tier 1, feature PSI là tier 2, Gini/KS là tier 3.

**Confuse PSI cao với model kém.** PSI đo population shift, không đo model performance. Một model hoàn hảo vẫn có PSI cao nếu khách hàng thay đổi. Luôn pair PSI với Gini/KS.

**Gini trên approve-only vs through-the-door.** Nếu bạn chỉ tính Gini trên approved population (vì đó là người có outcome), Gini sẽ cao hơn thực tế — bạn đang loại bỏ phần khó của distribution. Phân biệt rõ hai loại report này.

**Không drill down khi tín hiệu đỏ.** PSI > 0.25 không phải là điểm kết thúc investigation — đó là điểm bắt đầu. Channel nào? Segment nào? Feature nào dẫn đầu shift?

---

### Takeaway

**Gini** hỏi: "Model còn phân biệt được risk không?"
**KS** hỏi: "Điểm tách biệt tốt nhất của model nằm ở đâu?"
**PSI** hỏi: "Khách hàng hôm nay có phải là người model đã học không?"

Ba câu hỏi khác nhau, ba công cụ khác nhau. Dùng cả ba, hiểu giới hạn của từng metric, và đừng để một con số duy nhất che giấu toàn bộ bức tranh.

---

## EN

### At a Glance

Three fundamental questions for credit model monitoring:

1. **Can the model still distinguish good from bad?** → Gini (or AUC)
2. **Where is the maximum separation point?** → KS
3. **Has the applicant population changed since training?** → PSI

These are independent questions. Gini can be stable while PSI is screaming. PSI can spike due to a marketing campaign, not model decay. You need all three for an accurate picture.

---

### The ICU Analogy

An ICU nurse monitors three vitals simultaneously: SpO₂, blood pressure, heart rate. No one says "heart rate alone is enough." Each monitor measures something different; together they tell the full story.

Credit model monitoring works the same way. An AUC of 0.72 this week and last week looks identical on a dashboard. But if the applicants this month are a completely different population — seasonal workers, a new acquisition channel, a macro shock — that same model may be producing systematically wrong decisions while the AUC dashboard stays flat.

---

### Gini / AUC — Discrimination Power

**AUC** measures the probability that the model ranks a randomly chosen good customer above a randomly chosen bad customer.

**Gini = 2 × AUC − 1**

Practical benchmarks for retail credit:

| AUC | Gini | Assessment |
|---|---|---|
| 0.50 | 0.00 | Random — useless |
| 0.65 | 0.30 | Acceptable (subprime) |
| 0.72 | 0.44 | Good (retail credit) |
| 0.80 | 0.60 | Excellent |
| > 0.85 | > 0.70 | Suspicious — check for leakage |

When Gini drops, ask three questions before acting: Is the drop on OOT only (model aging) or also on recent train data (data pipeline issue)? Is it uniform or concentrated in a specific segment? Has the approval mix shifted (approving more at lower scores will mechanically pull Gini down)?

---

### KS — Maximum Separation

**KS** is the maximum distance between the cumulative distributions of good and bad customers sorted by score.

A KS of 42 means: at the optimal score cutpoint, there's a 42-percentage-point gap between the proportion of bads captured and goods captured — the model's peak discriminatory power.

| KS | Assessment |
|---|---|
| < 20 | Weak |
| 20 – 30 | Acceptable |
| 30 – 40 | Good |
| > 40 | Strong |

KS is sensitive to approval mix. A policy that suddenly approves more applicants at lower scores will mechanically compress KS — not because the model got worse, but because the on-book population changed.

---

### PSI — Population Stability

**PSI** compares the score distribution today versus the training period. It's the most operationally important metric for weekly monitoring.

```
PSI = Σ (Actual% − Expected%) × ln(Actual% / Expected%)
```

**Industry thresholds:**

| PSI | Signal | Action |
|---|---|---|
| < 0.10 | ✅ Stable | Routine monitoring |
| 0.10 – 0.25 | ⚠️ Investigate | Find root cause |
| > 0.25 | 🔴 Significant shift | Model review, consider retraining |

**Critical nuance:** High PSI does not automatically mean the model is broken. It means the population has shifted. Before triggering a retrain, investigate: seasonal effects? new acquisition channel? policy change that altered the applicant mix? Document the reason and continue monitoring.

---

### Action Table

| Signal | Likely cause | Action |
|---|---|---|
| Gini drops > 5pt (OOT) | Model aging or feature drift | Feature-level PSI, vintage drill-down |
| Gini drops, PSI stable | Approval mix shift | Review segment distribution, check cutoff |
| PSI > 0.25 | Population shift | Feature-level PSI to find culprit variable |
| PSI high + Gini drops | Genuine drift | Escalate model review |
| PSI high, Gini stable | Policy or seasonal effect | Document, continue monitoring |
| All metrics fine, NPL rising | Macro/external shock | Policy review, not a model problem |

---

### Monitoring Cadence

| Metric | Frequency | Rationale |
|---|---|---|
| Score PSI | Weekly | Lightweight, automated, early warning |
| Feature PSI | Bi-weekly | Identifies which variable is driving shift |
| Gini / KS | Monthly | Needs sufficient volume for stable estimates |
| Calibration | Quarterly | Requires 3–6 month outcome maturity |
| Full OOT re-run | Semi-annually | Comprehensive review for risk committee |

---

### Takeaway

**Gini** asks: "Can the model still rank risk correctly?"
**KS** asks: "Where is the model's peak discrimination?"
**PSI** asks: "Are today's applicants the same population the model learned from?"

Three different questions, three different tools. Use all three, understand each one's limitations, and never let a single metric hide the full picture.
