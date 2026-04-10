---
title: "Từ điểm số đến policy — threshold và giám sát"
date: "2026-04-09"
excerpt: "Score là đầu vào; cutoff và rule nghiệp vụ cần versioning và monitor — không đề xuất ngưỡng cụ thể."
category: banking
---

## VI

### TL;DR

- **Điểm số** (scorecard, boosting, v.v.) hiếm khi là quyết định cuối — **policy**, **ngưỡng**, rule nghiệp vụ và override định hình portfolio.
- Thay đổi cutoff nên được **quản lý phiên bản** như thay model: ai phê duyệt, lý do, kỳ vọng approval/bad rate (mô tả, không khuyên mức cụ thể).
- Giám sát sau triển khai: phân phối score, hiệu năng theo segment/cohort, tỷ lệ override — so với mô phỏng trước go-live.

**Disclaimer:** Bài viết **mô tả khái niệm kỹ thuật và governance** xung quanh score → decision. **Không** đưa ngưỡng điểm cụ thể, khuyến nghị danh mục, hay ý kiến pháp lý. Thực tế triển khai phụ thuộc chính sách nội bộ và quy định.

Trong thực tế, pipeline quyết định tín dụng thường kết hợp **model score** với **rule** (DTI, fraud flag, internal list, v.v.) và đôi khi **override** thủ công có lý do. Điểm quan trọng cho đội data là: thay đổi **cutoff** hoặc trọng số rule có thể tác động mạnh tới **approval rate** và risk mix **mà không đổi file model** — vì vậy việc audit phải theo dõi **cả** lớp policy, không chỉ AUC trong notebook.

**Phiên bản hóa:** lưu `model_version`, `policy_version`, và mapping score→decision (có thể là bảng bậc thang). Thay đổi emergency cần ticket + post-mortem; tránh chỉnh tay trên prod không trace.

**Giám sát sau triển khai — gói checklist:**

| Metric / tín hiệu | Mục đích |
| ----------------- | -------- |
| Phân phối score theo tuần/tháng | Phát hiện shift dân sách |
| Approval / decline mix | So kỳ vọng pre-launch |
| Performance theo cohort/vintage | Kiểm tra calibration thực địa |
| Override rate + lý do | Phát hiện “đường vòng” quanh model |
| Latency & error scoring API | SLA vận hành |

**Trade-off minh họa (không phải khuyến nghị):** cutoff cao hơn thường giảm số approve nhưng tăng “bar” — tác động chính xác phụ thuộc base rate, segment, và rule đi kèm; **phải** đo trên mô phỏng và dữ liệu đại diện nội bộ.

**Failure mode:** monitor chỉ AUC offline trong khi cutoff/policy trôi; không log version policy nên không tái hiện quyết định lịch sử; override không taxonomy → không học được từ ngoại lệ.

## EN

### TL;DR

- A **score** is usually an input to a **broader decision policy** — thresholds, rules, and overrides shape outcomes.
- Treat **threshold moves** like model releases: versioned, approved, auditable.
- Post-launch monitoring spans **distributions, vintages, overrides**, not only offline AUC.

**Disclaimer:** This note discusses **technical governance concepts** around score-to-decision paths. It is **not** prescriptive on cutoffs, portfolio strategy, legal compliance, or investment advice.

In practice, credit decisions combine **model scores** with **business rules** and sometimes **manual overrides**. Changing a **cutoff** can swing approval rates without changing the model artifact — so governance must track **policy layers**, not only notebook metrics.

**Versioning:** record `model_version`, `policy_version`, and the score→decision mapping (e.g., stepwise cutoffs). Emergency changes need tickets and follow-up review; avoid untracked manual tweaks.

**Post-launch monitoring checklist:**

| Signal | Intent |
| ------ | ------ |
| Score distribution (time series) | Population shift |
| Approve/decline mix | Compare to pre-launch expectations |
| Vintage / cohort performance | Field calibration |
| Overrides with reasons | Detect systematic workarounds |
| Scoring API latency/errors | Operational SLA |

**Illustrative trade-off (not advice):** higher cutoffs generally tighten approvals — real impact depends on base rates, segments, and co-rules; validate with internal simulation and representative samples.

**Failure modes:** offline AUC worship while thresholds drift untracked; missing policy version stamps breaking historical replay; unclassified overrides preventing learning from exceptions.
