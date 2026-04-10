---
title: "OOT, population stability và sanity check cho risk model"
date: "2026-04-01"
excerpt: "Khung đầy đủ: OOT, PSI/drift, playbook monitor; từ giới thiệu tới checklist và pitfall khi triển khai risk model."
category: data-science
---

## VI

### TL;DR

- **OOT** là cửa sổ thời gian “tương lai” không dùng khi fit; bỏ qua dễ **lạc quan giả** về AUC.
- **PSI/drift** là tín hiệu vận hành — phải kết hợp segment, trend và performance cohort.
- Governance: **playbook** khi vượt ngưỡng tốt hơn chỉ biết công thức.

### Giới thiệu

Bài này dành cho data scientist / risk analyst làm mô hình rủi ro tín dụng hoặc hệ thống chấm điểm có **tính thời gian** mạnh. Trong thực tế, mô hình “đẹp” trên cross-validation ngẫu nhiên vẫn có thể **fail ngoài mẫu thời gian** vì leakage, seasonality, hoặc thay đổi mix kênh. Mục tiêu là có **khung kiểm tra** và **monitor** nhất quán giữa DS, risk và vận hành.

### Khái niệm cốt lõi

- **Out-of-time (OOT):** tập kiểm tra theo **trục thời gian**, thường là các kỳ *sau* khoảng train, không được dùng khi huấn luyện hay tune sâu.
- **Population Stability Index (PSI):** đo lệch **phân phối** score (hoặc biến then chốt) giữa baseline và mẫu mới — không tự nói “tốt/xấu” cho risk.
- **Calibration / performance theo cohort:** so khả năng rank và xác suất dự báo theo **khe thời gian** và segment nghiệp vụ.

### Chi tiết và thực hành

OOT nên gắn với **định nghĩa ngày đơn xin / snapshot** thống nhất (timezone, cutoff). Nếu OOT quá ngắn, có thể nhiễu; quá dài có thể trộn nhiều chế độ kinh tế — cần **ghi lý do** trong tài liệu model.

PSI nên được đọc cùng **drill-down** (kênh, tier sản phẩm, vintage). Ví dụ minh hoạ “khi nào PSI nhảy nhưng không phải sự cố model”: dừng một kênh rủi ro có chủ đích làm dân sách qua cổng thay đổi.

**Bảng gợi ý tích hợp monitor (minh hoạ):**

| Tín hiệu | Hành động gợi ý |
| -------- | ---------------- |
| PSI score tuần | So baseline + xem segment; trend 4 tuần |
| Calibration OOT vs live | Workshop DS + risk nếu lệch hệ thống |
| Approval mix đổi đột ngột | Kiểm tra policy / rule trước khi blame model |

### Checklist vận hành

- [ ] Tài liệu hóa cửa sổ OOT và **version** model gắn với baseline PSI.
- [ ] Dashboard: PSI, phân phối score, calibration, tối thiểu 2–3 segment chuẩn.
- [ ] Playbook: ai xử lý, SLA, khi nào cần **dừng scoring** (nếu có chính sách nội bộ).
- [ ] Lưu artifact hình ảnh khi sign-off model để so sau này.

### Rủi ro và lỗi thường gặp

- OOT vẫn chứa **thông tin sau quyết định** → leakage tinh vi.
- PSI trên score đã **rescale** không đồng nhất giữa các kỳ.
- Cảnh báo quá nhiều → team **tắt monitor**; hoặc ngược lại, không ai sở hữu alert.
- Chỉ báo cáo AUC lab mà không nối với **ngưỡng** và policy thực tế.

### Kết luận

OOT + PSI là “phanh an toàn” của risk model trong production thinking. Đầu tư vào **định nghĩa mẫu**, **tài liệu** và **playbook** thường mang lại ROI cao hơn thêm một feature marginal trong notebook.

## EN

### TL;DR

- **OOT** holds out a true **future** window; skipping it invites **false confidence**.
- **PSI / drift** are **signals** — pair with segments, trends, and cohort performance.
- **Governance** (who acts, when) beats a spreadsheet of thresholds alone.

### Introduction

This note is for practitioners building **time-sensitive credit risk** or gatekeeping scores. Great in-sample or random CV metrics can still fail when the world shifts or when subtle **leakage** enters features. The goal is a **repeatable validation story** and **monitoring** that risk and ops can trust.

### Core concepts

- **Out-of-time (OOT) validation:** a time-based holdout *after* the fit window, never used for training or heavy tuning.
- **Population Stability Index (PSI):** compares **distributions** of scores or key drivers between a baseline cohort and newer traffic — not a moral judgment on portfolio quality.
- **Calibration & cohort performance:** how probabilities and ranks behave across **time cuts** and business segments.

### Details and practice

Define OOT with explicit **application dates / as-of semantics** and document regime mixes (campaigns, COVID-like shocks, etc.). Short OOTs can be noisy; very long OOTs may average incompatible regimes — write the trade-off down.

Read PSI with **segmentation**. A deliberate channel shutdown can spike PSI without implying “model broke.”

**Illustrative monitoring integration:**

| Signal | Suggested response |
| ------ | ------------------- |
| Weekly score PSI | Compare to baseline; inspect 4-week trend + segments |
| OOT vs live calibration gap | Joint DS + risk review if systematic |
| Sudden approval mix shift | Check policy/rules before blaming the score |

### Operational checklist

- [ ] Publish OOT windows with each **model version** + PSI baseline id.
- [ ] Dashboards: PSI, score distribution, calibration, a few canonical segments.
- [ ] Playbook: owners, SLA, criteria for **scoring pause** if your policy allows.
- [ ] Archive charts at approval time for later comparisons.

### Pitfalls and failure modes

- OOT still contains **post-decision** information.
- PSI on **incomparable score scales** across periods.
- Alert fatigue disables monitoring — or alerts have **no owner**.
- Reporting offline AUC only, disconnected from **thresholds** and live policy.

### Takeaways

OOT and PSI are production hygiene for risk models. Clarity on **samples**, **documentation**, and **runbooks** usually pays off more than marginal notebook gains.
