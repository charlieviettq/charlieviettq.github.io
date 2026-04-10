---
title: "Từ điểm số đến policy — threshold và giám sát"
date: "2026-04-09"
excerpt: "Scorecard là đầu vào; policy và ngưỡng quyết định cần monitor, không chỉ AUC trên lab."
category: banking
---

## VI

**Điểm số ML** thường đi cùng **ngưỡng** và quy tắc nghiệp vụ (DTI, flags). Thay đổi ngưỡng ảnh hưởng trực tiếp approval rate và portfolio risk — nên kiểm soát versioning và phê duyệt thay đổi giống như thay model.

**Giám sát sau triển khai:** phân phối score theo thời gian, performance theo segment, và tỷ lệ override thủ công. Deviation so với mô phỏng trước triển khai là tín hiệu cần review.

Bài viết **không** đề xuất mức ngưỡng cụ thể hay chiến lược danh mục — chỉ nhấn mạnh governance và observability kỹ thuật.

## EN

Production **scores** meet **thresholds** and business rules. Threshold moves shift approval rates — treat them like model releases with approvals and audit trails.

**Monitoring:** score distributions over time, vintage performance by segment, manual override rates. Gaps vs pre-launch simulation should trigger structured reviews.

This is not prescriptive on levels or portfolio strategy — it highlights operational controls around decisions.
