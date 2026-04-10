---
title: "WOE / IV gợi ý biến cho credit scoring"
date: "2026-03-18"
excerpt: "Cách đọc Weight of Evidence và Information Value như thăm dò đơn điệu và sức tách, không thay thế causal reasoning."
category: data-science
---

## VI

**Weight of Evidence (WOE)** binning biến (thường categorical hoặc numeric đã chia nhóm) và đo log-odds tương đối giữa “good” và “bad” trong từng bin. **Information Value (IV)** tổng hợp độ “mạnh” của biến đó trên toàn bộ bins. IV thường được dùng như heuristic: thấp → yếu; trung bình → ứng viên; rất cao → kiểm tra leakage/overfit.

WOE giúp kiểm tra **tính đơn điệu** (monotonic) sau khi gom nhóm: nếu đường WOE “zig-zag” khó hiểu, có thể cần regroup hoặc xem lại độ tin cậy mẫu trong bin. WOE/IV **không** chứng minh nhân quả — chỉ hỗ trợ feature engineering và giao tiếp với risk.

**Lưu ý:** missing/rare categories nên có chiến lược riêng; IV trên train lệch nếu mẫu chọn lọc; luôn confirm trên holdout/OOT.

## EN

**Weight of Evidence (WOE)** encodes each bin’s log-odds separation between good and bad outcomes. **Information Value (IV)** aggregates how much a variable explains across bins. IV rules of thumb are guides only: weak, medium, strong — very high IV deserves a leakage / overfit review.

WOE plots expose **monotonicity** after grouping: jagged patterns may mean unstable bins or need for regrouping. WOE/IV supports screening and explainability — not causal claims.

**Watchouts:** handle missing/rare levels explicitly; IV on biased samples misleads; validate on holdout and OOT slices.
