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

**Bảng hướng dẫn trực chiến:**

| Tín hiệu | Bạn nên làm gì? |
| -------- | ---------------- |
| PSI tăng theo tuần | So với baseline và xem trend 4 tuần gần nhất |
| OOT lệch mạnh so với Live | Tổ chức workshop giữa DS và Risk ngay lập tức |
| Approval mix đổi đột ngột | Kiểm tra lại chính sách (Policy) trước khi đổ lỗi cho AI |

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

### Takeaways

OOT and PSI are the production hygiene of risk modeling. Investing in clear sample definitions, robust documentation, and actionable **Runbooks** pays off far more than marginal gains from extra features. Stay safe on the data road!
