---
title: "OOT và Stability: 'Phanh an toàn' của mô hình rủi ro"
date: "2026-04-01"
excerpt: "Đừng để mô hình của bạn 'đẹp trên giấy, gãy ngoài đời'. Tìm hiểu cách dùng OOT và PSI làm chốt chặn an toàn để kiểm soát rủi ro tín dụng một cách bền vững."
category: data-science
---

## VI

### Tóm lược

- **OOT (Out-of-Time)** là bài thi "thực tế" nhất: Cho AI đoán dữ liệu của tương lai mà nó chưa từng thấy lúc học. Nếu điểm thi OOT thấp, đừng vội ship mô hình.
- **PSI (Population Stability Index)** là cái phong vũ biểu đo độ ổn định. Nó báo cho bạn biết khách hàng hôm nay có đang "khác lạ" so với lúc bạn xây dựng mô hình hay không.
- Đừng chỉ học công thức, hãy xây dựng một bản hướng dẫn xử lý (**Playbook**) khi các chỉ số này vượt ngưỡng đỏ.

### Giới thiệu

Hãy tưởng tượng bạn đang lái một chiếc xe đua. Bạn đã tập luyện rất kỹ trên một đường đua quen thuộc và đạt kỷ lục thời gian. Nhưng liệu bạn có dám mang chiếc xe đó đi đua ở một quốc gia khác, với khí hậu và mặt đường hoàn toàn xa lạ không?

Xây dựng mô hình rủi ro (Risk Model) cũng vậy. Một mô hình có thể đạt AUC cực cao trên tập dữ liệu cũ, nhưng lại "gãy" thảm hại khi gặp những biến động thị trường mới. Bài viết này mình chia sẻ về cách thiết lập những "chiếc phanh an toàn" (OOT và Stability) để đảm bảo mô hình của bạn luôn vững tay lái trước mọi sóng gió.

### Khái niệm cốt lõi: Những chốt chặn an toàn

1. **Thử thách tương lai (OOT):** Thay vì chia dữ liệu ngẫu nhiên, bạn hãy dành riêng một khoảng thời gian *sau cùng* làm bài thi cuối kỳ. Nếu mô hình đoán đúng tương lai, nó mới thực sự đáng tin.

2. **Cái cân dân cư (PSI):** PSI không nói mô hình đúng hay sai, nó chỉ nói: "Này, tập khách hàng hôm nay trông lạ lắm!". Nếu PSI cao, có thể là do thị trường thay đổi, hoặc một kênh marketing mới đang mang về tệp khách hàng hoàn toàn khác.

3. **Kiểm tra sức khỏe (Calibration):** So sánh xác suất dự báo với thực tế xảy ra theo từng nhóm thời gian. Việc này giúp bạn biết mô hình có đang quá lạc quan hay quá bi quan không.

### Chi tiết từ "hiện trường"

Đừng bao giờ coi OOT là một con số tĩnh. Hãy đào sâu (drill-down) theo từng kênh, từng dòng sản phẩm. Có những lúc PSI nhảy vọt nhưng không phải lỗi của mô hình, mà đơn giản là do ngân hàng vừa quyết định dừng một sản phẩm rủi ro nào đó.

**Ngưỡng PSI chuẩn ngành:**

| PSI | Tín hiệu | Hành động |
|---|---|---|
| < 0.10 | ✅ Ổn định | Monitor định kỳ, không cần can thiệp |
| 0.10 – 0.25 | ⚠️ Cần chú ý | Investigate: tìm nguyên nhân shift |
| > 0.25 | 🔴 Shift nghiêm trọng | Review model, cân nhắc retrain |

**Bảng hướng dẫn trực chiến:**

| Tín hiệu | Bạn nên làm gì? |
| -------- | ---------------- |
| PSI tăng theo tuần | So với baseline và xem trend 4 tuần gần nhất |
| OOT lệch mạnh so với Live | Tổ chức workshop giữa DS và Risk ngay lập tức |
| Approval mix đổi đột ngột | Kiểm tra lại chính sách (Policy) trước khi đổ lỗi cho AI |

**Playbook mẫu khi PSI > 0.25:**

```
Bước 1: Feature-level PSI
  → Tính PSI cho từng feature riêng lẻ
  → Xác định biến nào thay đổi nhiều nhất

Bước 2: Kiểm tra nguyên nhân
  → Có campaign marketing mới không?
  → Có thay đổi policy trong period đó không?
  → Có seasonal effect (Tết, mùa mưa) không?

Bước 3: Đánh giá impact
  → Chạy OOT trên 3 tháng gần nhất
  → Nếu OOT Gini giảm > 5pt → escalate
  → Nếu OOT Gini ổn định → document và monitor

Bước 4: Quyết định
  → Gini ổn + nguyên nhân rõ ràng → document, tiếp tục monitor
  → Gini giảm + nguyên nhân không rõ → trigger model review
```

:::note[Lưu ý quan trọng]
PSI cao ≠ model kém. PSI đo **population shift**, không đo model performance. Một model hoàn hảo vẫn có PSI cao nếu khách hàng thay đổi. Luôn pair PSI với Gini/KS để có bức tranh đầy đủ.
:::

### Những rủi ro thường trực

- **Rò rỉ thông tin (Leakage):** Dùng dữ liệu "sau khi đã quyết định" để dạy cho AI đoán "trước khi quyết định". Đây là lỗi cơ bản nhưng cực kỳ tinh vi.
- **Báo động giả:** Cảnh báo quá nhiều làm team bị "lờn thuốc" (Alert fatigue), dẫn đến việc bỏ qua những sự cố thực sự nghiêm trọng.

### Kết luận

OOT và PSI chính là "lương tâm" của một kỹ sư làm mô hình rủi ro. Đầu tư vào tài liệu, định nghĩa mẫu và các quy trình vận hành (Playbook) thường mang lại giá trị cao hơn nhiều so với việc cố nhồi thêm một vài tính năng (feature) nhỏ lẻ vào Model. Hãy lái xe an toàn nhé!

---

## EN

### At a glance

- **OOT (Out-of-Time)** is the ultimate "real-world" test: asking the AI to predict a future it never saw during training. If OOT scores tank, don't ship the model.
- **PSI (Population Stability Index)** is your barometer. It tells you if today's customers look significantly different from those used to build the model.
- Don't just memorize formulas; build a **Playbook** for when these indicators hit the red zone.

### Introduction

Imagine tuning a race car to perfection on a familiar track. Would you drive it at 200mph on a new circuit in a different country without testing the brakes first?

Building risk models is no different. A model can boast a high AUC on historic data but fail miserably when the market shifts. This post is about setting up your "safety brakes" (OOT and Stability) to ensure your model stays on track.

### PSI Thresholds — Industry Standard

| PSI | Signal | Action |
|---|---|---|
| < 0.10 | ✅ Stable | Routine monitoring |
| 0.10 – 0.25 | ⚠️ Investigate | Find root cause before acting |
| > 0.25 | 🔴 Significant shift | Model review, consider retraining |

### Model Degradation vs Population Shift — A Critical Distinction

When PSI spikes, two very different things could be happening:

**Population shift (PSI's job to detect):** The applicant mix changed — new channel, seasonal effect, marketing campaign. The model may still be perfectly valid for the *original* population. The right response is to understand the shift, not immediately retrain.

**Model degradation (Gini/KS's job to detect):** The model's discriminatory power on *any* population has declined — features lost predictive power, the economic environment changed fundamentally. The right response is model review and potential retraining.

Always diagnose which one you're facing before deciding on action.

### Sample Playbook When PSI > 0.25

```
Step 1: Feature-level PSI
  → Calculate PSI for each feature individually
  → Identify which variables are driving the shift

Step 2: Investigate root cause
  → Any new marketing campaigns or channels?
  → Any policy changes during the period?
  → Seasonal effects (holidays, economic events)?

Step 3: Assess model performance impact
  → Run OOT on the most recent 3 months
  → If OOT Gini drops > 5pt → escalate to model review
  → If OOT Gini holds → document cause and continue monitoring

Step 4: Decision
  → Gini stable + clear cause identified → document, continue monitoring
  → Gini declining + unclear cause → trigger formal model review
```

### Takeaways

OOT and PSI are the production hygiene of risk modeling. Investing in clear sample definitions, robust documentation, and actionable **Runbooks** pays off far more than marginal gains from extra features.

The most important discipline: distinguish between "the model got worse" and "the customers changed." PSI tells you the latter. Gini and KS tell you the former. You need both signals before making any decision about retraining.
