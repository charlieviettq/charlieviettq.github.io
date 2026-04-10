---
title: "WOE / IV gợi ý biến cho credit scoring"
date: "2026-03-18"
excerpt: "WOE/IV như thăm dò đơn điệu và độ mạnh biến: khi tin, khi không, leakage IV cao, và checklist binning."
category: data-science
---

## VI

### TL;DR

- **WOE** giúp **binning** có cấu trúc và kiểm tra đơn điệu; **IV** là **heuristic** sàng lọc, không thay thế holdout/OOT.
- IV **cực cao** → nghi **leakage**, proxy trễ, hoặc bin không ổn định — đừng tự động “vô hiệu hóa” biến chỉ vì IV thấp trên mẫu chọn lọc.
- Binning cần quy tắc cho **missing**, **rare level**, và **ổn định theo thời gian**.

**Weight of Evidence (WOE)** mã hóa mỗi bin bằng log-odds tương đối giữa “good” và “bad” trong định nghĩa mẫu bạn chọn (performing vs charged-off, hoàn khác tuỳ policy). Điểm mạnh: WOE làm rõ **chiều tác động** sau khi gom nhóm, và giúp phát hiện **zig-zag** (không đơn điệu) — tín hiệu cần regroup, gom category, hoặc kiểm tra kích thước bin.

**Information Value (IV)** gom mức tách biệt trên toàn bộ bins. Bảng heuristic phổ biến (chỉ mang tính tham chiếu, không cứng):

| IV (train) | Diễn giải heuristic |
| ---------- | -------------------- |
| &lt; 0.02 | Thường rất yếu trên tổng thể |
| 0.02–0.1 | Ứng viên cần xem thêm ổn định/OOT |
| 0.1–0.3 | Thường được coi là “hữu ích” (phụ thuộc base rate, segment) |
| &gt; 0.3 | Kiểm tra leakage / target proxy / bin quá khít |

**Khi nào WOE/IV phù hợp:** exploratory screening, xây **scorecard** tuyến tính theo bin, giao tiếp với risk/business bằng “nhóm rủi ro”. **Khi nào hạn chế:** mô hình tree-based với tương tác phức tạp — IV trên biến đơn lẻ không đo tương tác; cần **SHAP**, **permutation**, hoặc ablation trên pipeline đã khóa feature.

**Khi nào IV cao là red flag:** biến phản ánh **outcome gián tiếp** (vd. dữ liệu hậu quyết định lọt vào feature), **sampling bias** (mẫu chỉ chứa approve), hoặc bin quá nhỏ tạo WOE cực đoan.

**Checklist binning / WOE:**

- Định nghĩa good/bad và **horizon** observation rõ ràng.
- Xử lý **missing** riêng (bin Missing) thay vì impute mù.
- Gom **rare categories** trước khi tính WOE.
- Kiểm tra **ổn định WOE** theo kỳ (train vs OOT): biến tốt mà WOE đảo chiều giữa kỳ → nghi ngờ shift hoặc bin quá mảnh.
- Lưu **bảng WOE** cùng version model trong repo / doc.

**Trade-off:** WOE biến continuous thành staircase — mất độ chi tiết nhưng tăng **ổn định** và giải thích. Với boosting, đôi khi dùng raw + monotonic constraints thay vì pre-binned WOE — quyết định là của pipeline và policy giám sát.

**Failure mode:** dùng IV trên **train** chồng lấn thời gian với label; báo cáo IV “đẹp” nhưng không có **holdout độc lập**; copy WOE table cũ sang model mới khi dân sách đã đổi.

## EN

### TL;DR

- **WOE** structures **bins** and surfaces **monotonicity** checks; **IV** is a **screening heuristic**, not a substitute for OOT/holdout.
- Very high **IV** demands a **leakage review** — not celebration.
- Treat **missing / rare levels / temporal stability** as first-class concerns.

**Weight of Evidence (WOE)** encodes per-bin log-odds separation between “good” and “bad” under your sample definition. Its strength is readability: you can see directionality and spot **non-monotonic** jumps that suggest unstable bins or bad merges.

**Information Value (IV)** aggregates separation across bins. Common heuristics (use as *guides only*):

| IV (train) | Rule-of-thumb |
| ---------- | ------------- |
| &lt; 0.02 | Often weak overall |
| 0.02–0.1 | Worth review + stability/OOT |
| 0.1–0.3 | Often “useful” (depends on base rate, segment) |
| &gt; 0.3 | Scrutinize leakage / proxies / over-fine bins |

**When WOE/IV shines:** exploratory screening, **linear scorecard** style models, stakeholder-friendly explanations. **When it is limited:** deep tree ensembles with heavy interactions — IV on marginals misses interaction structure; pair with **holdout**, **permutation/SHAP-style** analysis on the locked pipeline.

**Red flags for high IV:** post-decision data, distorted sampling (e.g., approvals-only), or microscopic bins manufacturing separation.

**Binning checklist:**

- Freeze good/bad definitions and **observation horizon**.
- Give **missing** its own bin where sensible.
- Collapse **sparse categories** early.
- Compare **WOE stability** train vs OOT across time.
- Version **WOE tables** with the model artifact.

**Trade-off:** binning simplifies signals for stability; gradient boosting on raw may win accuracy but needs different monitoring. Choose based on **model class + governance**.

**Failure modes:** time-contaminated labels; pretty IV without **independent holdout**; importing stale WOE mappings after a real population shift.
