---
title: "OOT, population stability và sanity check cho risk model"
date: "2026-04-01"
excerpt: "Ghi chú ngắn về out-of-time validation và PSI — tránh lạc quan giả khi drift âm thầm."
category: data-science
---

## VI

Khi huấn luyện mô hình rủi ro tín dụng, **in-sample** và **cross-validation theo thời gian** chỉ là bước đầu. **Out-of-time (OOT)**: giữ một khoảng thời gian hoàn toàn không dùng khi fit, phản ánh “tương lai” so với train — giúp phát hiện leakage và overfitting do seasonality.

**Population Stability Index (PSI)** so sánh phân phối score (hoặc feature quan trọng) giữa baseline (train/accept) và mẫu mới. PSI cao ⇒ dân sách hoặc hành vi thay đổi; cần xem lại định nghĩa mẫu, feature, hoặc vòng đời model. PSI chỉ là tín hiệu: luôn đi kèm business slice (kênh, sản phẩm, vùng) và monitor theo cohort.

**Thực hành:** một lịch OOT cố định trong policy; biểu đồ calibration OOT vs train; rule cảnh báo PSI + trend rolling; tài liệu hóa mốc “model phù hợp tới đâu” cho stakeholder phi kỹ thuật.

## EN

For credit risk models, **out-of-time (OOT)** validation holds out a future window you never touch during training. It catches leakage and time-driven overfitting better than random CV alone.

**Population Stability Index (PSI)** compares the distribution of scores (or key inputs) between a baseline sample and a newer one. Spikes often mean population or behaviour shift — trigger reviews of sampling, features, and refresh policy. PSI is a signal, not a verdict: pair it with segment cuts and time series of drift.

**Practice:** lock OOT windows in governance docs; plot OOT calibration vs train; alert on PSI with rolling trends; document clearly what “still in tolerance” means for non-technical owners.
