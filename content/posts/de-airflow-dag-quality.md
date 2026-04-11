---
title: "Chất lượng DAG Airflow: Đừng để Pipeline thành 'mớ bòng bong'"
date: "2026-03-28"
excerpt: "Vận hành Airflow trong production không chỉ là nối các mắt xích lại với nhau. Hãy học cách xây dựng những Pipeline bền bỉ với Idempotency, SLA và hệ thống cảnh báo thông minh."
category: data-engineering
---

## VI

### Tóm lược

- Một DAG tốt phải có tính **Idempotent**: Chạy lại 10 lần cùng một ngày dữ liệu thì kết quả vẫn phải y hệt nhau, không được nhân đôi hay sai lệch.
- Đừng đặt **SLA** (cam kết thời gian) bừa bãi. Hãy chỉ đặt ở những "điểm chạm" quan trọng mà phía sau thực sự cần dữ liệu.
- Cảnh báo (**Alert**) phải đi kèm với "địa chỉ" cụ thể và người chịu trách nhiệm. Đừng để hệ thống spam tin nhắn khiến team phải tắt thông báo đi ngủ.

### Giới thiệu

Hãy tưởng tượng bạn đang quản lý một bếp ăn công nghiệp phục vụ hàng ngàn suất ăn mỗi ngày. Nếu một món ăn bị hỏng, bạn cần một quy trình để nấu lại món đó ngay lập tức mà không làm ảnh hưởng đến các món khác, và tuyệt đối không được giao nhầm hai suất cho cùng một người.

Trong thế giới Data Engineering, Airflow chính là vị "bếp trưởng" điều phối các dòng chảy dữ liệu. Bài viết này mình dành cho các team đang vận hành Airflow, giúp bạn xây dựng những "công thức" (DAG) chuẩn chỉnh, đủ sức chịu nhiệt khi đưa vào môi trường Production thực thụ.

### Khái niệm cốt lõi: Những cột trụ của sự ổn định

1. **Tính nhất quán (Idempotency):** Đây là luật chơi số 1. Dù hệ thống có sập, dù bạn có bấm nút "Rerun" bao nhiêu lần, dữ liệu cuối cùng trong kho vẫn phải đúng. Hãy ưu tiên dùng các pattern như `Overwrite Partition` thay vì `Append` mù quáng.

2. **Cơ chế tự phục hồi (Retry & Backoff):** Lỗi mạng, lỗi kết nối là chuyện thường ngày. Hãy dạy cho DAG cách kiên nhẫn thử lại, nhưng cũng phải biết "fail nhanh" nếu đó là lỗi cấu trúc dữ liệu không thể cứu vãn.

3. **Cam kết chất lượng (SLA):** Đừng để đến lúc sếp hỏi "Sao báo cáo hôm nay chưa có?" bạn mới đi kiểm tra. SLA giúp bạn phát hiện sớm những Pipeline đang "lê bước" chậm chạp để kịp thời xử lý.

### Chi tiết từ "hiện trường"

Mình thường khuyên các bạn hãy chia Pipeline thành các giai đoạn rõ ràng: Staging → Transform → Publish. Mỗi giai đoạn là một chốt chặn. Nếu bước Transform lỗi, dữ liệu sai sẽ không bao giờ được "Publish" ra cho người dùng cuối thấy.

**Bảng câu hỏi tự kiểm tra:**

| Câu hỏi sống còn | Trạng thái lý tưởng |
| ------- | -------- |
| Chạy lại cùng một ngày có an toàn không? | Tuyệt đối an toàn (Idempotent) |
| Ai sẽ nhận tin nhắn khi bước này lỗi? | Có Owner rõ ràng và Link dẫn thẳng tới Log |
| Có bước kiểm tra chất lượng trước khi lưu không? | Có (dùng dbt test hoặc GE) |

### Những sai lầm "nhức nhối"

- **Cảnh báo tràn lan:** Spam tin nhắn lỗi vào Group chung khiến mọi người bị "lờn thuốc". Đến lúc có lỗi thật thì chẳng ai để ý.
- **DAG đợi vô hạn:** Quên đặt `timeout` cho các cảm biến (Sensor), khiến một Pipeline đứng đợi dữ liệu từ năm này qua năm khác, chiếm dụng hết tài nguyên của hệ thống.

### Kết luận

Một DAG tốt không chỉ là một sơ đồ chạy mượt khi trời quang mây tạnh. Nó là một thiết kế biết dự đoán trước những rủi ro, biết tự đứng dậy sau khi ngã và biết "kêu cứu" đúng lúc, đúng chỗ. Hãy đầu tư vào chất lượng DAG để có những đêm ngon giấc nhé!

---

## EN

### At a glance

- A great DAG must be **Idempotent**: rerunning it 10 times for the same date must yield the exact same result—no duplicates, no corruption.
- Don't set **SLAs** everywhere. Only attach them to critical data milestones that downstream consumers actually depend on.
- **Alerts** must have context and a clear owner. Avoid spamming the team until they mute all notifications.

### Introduction

Imagine managing a commercial kitchen. If a dish fails, you need a protocol to remake it without disrupting the entire service, and you certainly can't serve the same plate twice.

In Data Engineering, Airflow is your "Head Chef" coordinating data flows. This post is for teams operating Airflow, helping you build "recipes" (DAGs) that are robust enough for the heat of Production.

### Takeaways

Great DAGs anticipate retries and latency. Investing in Idempotency, correct SLAs, and clean alerts reduces the number of mid-night fire drills. Build pipelines that you can trust!
