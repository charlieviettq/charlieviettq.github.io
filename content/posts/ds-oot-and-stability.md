---
title: "OOT, population stability và sanity check cho risk model"
date: "2026-04-01"
excerpt: "Khung practitioner: OOT không phải tùy chọn, PSI/drift là tín hiệu cần ngữ cảnh — checklist monitor và lỗi thường gặp."
category: data-science
---

## VI

### TL;DR

- **OOT (out-of-time)** là “cửa sổ tương lai” bạn không được đụng khi fit; bỏ qua thì AUC trong lab dễ **lạc quan giả**.
- **PSI** và các metric drift khác là **tín hiệu vận hành**, không phải phán xét tuyệt đối — phải cắt theo segment và thời gian.
- Thiếu **tài liệu hóa ngưỡng + hành động** (playbook) là lỗi governance hay gặp hơn thiếu công thức.

Khi huấn luyện mô hình rủi ro tín dụng, **in-sample** và cross-validation ngẫu nhiên chỉ trả lời “mô hình có học được pattern lịch sử không”. Rủi ro thực tế là **thời gian**: seasonality, chính sách, mix kênh thay đổi, hoặc feature “ăn theo” một kỳ đặc biệt. **Out-of-time (OOT)** giữ một khoảng thời gian hoàn toàn không dùng khi fit — thường là các tháng/ quý *sau* train — để mô phỏng “điểm cắt” gần với production hơn. OOT tốt mà train CV kém có thể gợi ý leakage hoặc cài đặt CV sai; ngược lại, CV tốt mà OOT xấu thường là dấu hiệu **overfit theo thời điểm** hoặc **population shift**.

**Population Stability Index (PSI)** so sánh phân phối score (hoặc biến quan trọng) giữa baseline (train/accept) và mẫu mới. PSI cao *gợi ý* dân sách hoặc behaviour khác — nhưng không cho biết *tốt hay xấu* cho risk: một thay đổi có chủ đích (vd. dừng kênh rủi ro) cũng làm PSI nhảy. Do đó PSI phải đi cùng **business slice** (kênh, sản phẩm, geography), **xu hướng rolling**, và **performance theo cohort** (approval rate, default proxy nếu có).

**Khi nào ưu tiên OOT sâu hơn:** mô hình quyết định cổng (application score), tần suất refresh thấp, hoặc lịch sử dữ liệu có “kỳ lạ” (đại dịch, campaign lớn). **Khi PSI dễ nhiễu:** mẫu nhỏ theo bin, feature tái xử lý liên tục, hoặc label delay ngắn.

**Checklist vận hành (rút gọn):**

| Hạng mục | Ghi chú |
| -------- | ------- |
| Định nghĩa cửa sổ OOT | Ghi rõ timezone, cutoff application, rule loại trừ |
| Baseline PSI | Ghi version model + mẫu baseline |
| Segment drill-down | Tối thiểu: kênh, tier, vintage |
| Calibration | So train vs OOT vs live; phát hiện flatten/shift |
| Playbook | PSI > ngưỡng → ai xem, trong bao lâu, có pause scoring không |

**Failure mode thường gặp:** (1) OOT trùng logic feature leakage (vd. dùng thông tin sau quyết định). (2) PSI trên score đã **tái scale** không nhất quán giữa kỳ. (3) Cảnh báo drift quá nhiều → team tắt monitor. (4) Không đồng bộ **ngưỡng** giữa DS và risk/legal — chỉ nên mô tả kỹ thuật trong blog; quyết định kinh doanh là tầng khác.

**Thực hành:** cố định lịch OOT trong tài liệu model; lưu artifact biểu đồ calibration; log PSI theo tuần/tháng; một trang wiki “model phù hợp tới đâu” cho stakeholder phi kỹ thuật.

## EN

### TL;DR

- **OOT** is a held-out *future* window; skipping it is the fastest path to **false confidence** in credit risk.
- **PSI** flags distribution movement — interpret it with **segments and trend**, not as good/bad by itself.
- The usual gap is not math but **governance**: who acts, when, and how alerts tie to model version + sample definition.

For credit risk models, random **cross-validation** alone answers whether you memorized history. **Out-of-time (OOT)** validation holds out a time range you never touch during training — often months *after* the fit window — to approximate the deployment cut. Strong in-CV but weak OOT commonly signals **temporal overfit** or subtle **leakage**; the reverse pattern also deserves investigation (e.g., misconfigured splits).

**Population Stability Index (PSI)** compares score (or key driver) distributions between a **baseline** cohort and a newer cohort. A spike suggests the through-the-door population differs — but deliberate portfolio moves also move PSI. Always pair PSI with **segment cuts**, **rolling trends**, and **vintage-style performance** where possible.

**When to invest more in OOT:** gatekeeping application scores, low refresh cadence, or history with regime breaks. **When PSI is noisy:** thin bins, unstable feature imputations, or short history after policy changes.

**Operational checklist:**

| Item | Note |
| ---- | ---- |
| OOT window spec | Timezone, application date cutoff, exclusion rules |
| PSI baseline | Frozen model version + baseline sample id |
| Drill-downs | At least channel, product/tier, coarse geo |
| Calibration | Train vs OOT vs live monitoring |
| Playbook | Escalation owner, SLA, optional scoring pause criteria |

**Common failure modes:** (1) OOT accidentally includes post-decision information. (2) PSI on scores that were **rescored/recalibrated** inconsistently. (3) Alert fatigue disables monitoring. (4) Threshold debates happen outside a documented **model risk** forum — keep public writing descriptive, not prescriptive on policy.

**Practice:** publish OOT policy with each major model version; archive calibration charts; trend PSI with clear baselines; maintain a short “what still fits?” note for non-technical partners.
