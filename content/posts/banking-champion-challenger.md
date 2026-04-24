---
title: "Champion-Challenger: Cách prove model mới mà không cần đặt cược toàn bộ"
date: "2026-04-25"
excerpt: "Model mới backtest AUC cao hơn 3%. Risk committee hỏi: 'Trên production thật thì sao?' Champion-Challenger là cách trả lời câu hỏi đó mà không cần gamble."
category: banking
---

## VI

### Tóm tắt

Champion-Challenger (C/C) là framework thử nghiệm model mới trên traffic production thật, với tỷ lệ nhỏ, trong một khoảng thời gian đủ dài để có outcome. Champion là model đang chạy. Challenger là ứng viên thay thế. Sau khi có đủ dữ liệu, so sánh bằng bằng chứng — không phải bằng niềm tin.

---

### Tại sao backtest không đủ

Giả sử bạn vừa train xong model mới. Trên tập OOT, AUC tăng từ 0.72 lên 0.75. Bạn mang kết quả đó vào risk committee và đề xuất deploy.

Risk committee hỏi: "OOT của bạn là data từ 6 tháng trước. Population hiện tại có giống không? Policy có thay đổi không? Nếu model mới cho approval rate thấp hơn, chúng ta mất bao nhiêu doanh thu?"

Đây không phải câu hỏi khó chịu — đây là câu hỏi đúng. Backtest trả lời "model này đã hoạt động tốt trong quá khứ." C/C trả lời "model này đang hoạt động tốt trong hiện tại, trên khách hàng thật, với policy hiện tại."

---

### Metaphor: Tuyển thủ dự bị

Không có HLV nào đưa tân binh vào sân chính từ phút đầu mà không có thời gian warm-up thực chiến. Tân binh được cho vào sân ở những trận ít áp lực hơn — hoặc trong 15 phút cuối khi tỷ số đã được định đoạt.

C/C hoạt động y hệt: Challenger được "vào sân" với một phần nhỏ traffic, trong điều kiện thật, nhưng rủi ro được kiểm soát. Nếu tốt, lên sân chính. Nếu không, bench lại không ai bị thiệt hại nặng.

---

### Framework 4 bước

#### Bước 1: Define success criteria TRƯỚC khi test

Đây là bước quan trọng nhất — và bị bỏ qua nhiều nhất.

Trước khi split traffic, viết rõ: "Challenger win khi..."
- Gini trên real traffic cao hơn Champion ≥ 2 percentage points
- Approval rate không giảm hơn 1%
- DPD30 rate (early delinquency) trong 3 tháng đầu không tệ hơn Champion

Không define *sau* khi thấy kết quả. Nếu bạn define criteria sau, bạn đang tìm kiếm confirmation, không phải evidence.

#### Bước 2: Traffic split

Tỷ lệ split phụ thuộc vào risk appetite và volume:

| Volume | Split tiêu biểu | Lý do |
|---|---|---|
| Cao (>5,000 app/tháng) | 90/10 | Đủ sample cho Challenger |
| Trung bình (1,000–5,000) | 95/5 | Giảm exposure của Challenger |
| Thấp (<1,000) | Cân nhắc lại | Cần sample size đủ lớn để có ý nghĩa thống kê |

**Quan trọng: Split phải ngẫu nhiên và stratified.** Không để Challenger nhận toàn bộ applicant từ một channel cụ thể, một region, hay một loan officer — vì đó không còn là fair comparison nữa. Randomize theo application ID hoặc customer ID.

#### Bước 3: Outcome window

Credit không phải là e-commerce — bạn không biết "kết quả" trong vài ngày. Cần đủ thời gian để outcome materialise:

| Metric | Minimum window |
|---|---|
| DPD30 (early signal) | 1 tháng |
| DPD90 (default signal) | 3 tháng |
| Charge-off rate | 6–12 tháng |
| Vintage Gini | 6–12 tháng |

Đừng rút kết luận sau 3 tuần vì "trông có vẻ tốt." Early delinquency rates trong 3 tuần đầu không đại diện cho long-term performance. Kiên nhẫn là kỷ luật quan trọng nhất trong C/C.

#### Bước 4: Decision framework

Sau khi có đủ outcome:

| Kết quả | Hành động |
|---|---|
| Challenger win rõ ràng (all criteria met) | Promote Challenger 100%, archive Champion |
| Challenger win nhẹ (đa số criteria met) | Tăng traffic Challenger lên 30–50%, extend test |
| Challenger neutral (mixed signals) | Giữ Champion, deep-dive vào segment nào Challenger tệ |
| Challenger thua (at least 1 critical criterion failed) | Discard, post-mortem, không deploy |

---

### Edge cases thực tế

**Seasonality làm lệch kết quả.** Nếu test vào mùa Tết, applicant profile thay đổi hoàn toàn — kết quả không generalize ra ngoài mùa đó. Tốt nhất là test đủ dài để bao phủ ít nhất 1 cycle seasonal, hoặc explicitly document limitation.

**Policy thay đổi trong khi test.** Đây là killer của mọi C/C. Nếu risk appetite thay đổi (nới lỏng hay thắt chặt) trong khi đang test, Champion và Challenger không còn được test trong cùng điều kiện nữa. Phải **lock policy** trong suốt C/C period, hoặc restart test.

**Selection bias trong routing.** Nếu loan officers biết đơn nào đang chạy Challenger và đơn nào đang chạy Champion, họ có thể (vô tình) xử lý khác nhau. C/C nên blind với người xử lý hồ sơ.

**Không đủ volume cho statistical significance.** Một C/C 95/5 split với 500 đơn/tháng có nghĩa là chỉ 25 đơn vào Challenger mỗi tháng. 3 tháng = 75 đơn. Không đủ để kết luận bất cứ điều gì. Tính sample size requirement trước khi commit vào split ratio.

---

### Giá trị governance

C/C không chỉ là kỹ thuật — nó là **ngôn ngữ của risk governance**.

Risk committee không muốn nghe "model mới tốt hơn theo thuật toán." Họ muốn nghe "model mới đã chứng minh tốt hơn trên 2,400 đơn thực trong 4 tháng, với Gini cao hơn 3.2pt và DPD30 thấp hơn 0.8%, với statistical significance p < 0.05."

Câu sau có thể đưa vào meeting minutes, vào model validation report, vào regulatory submission. Câu trước thì không.

C/C tạo ra **audit trail** cho mọi model transition: ai approve, khi nào, trên evidence gì. Đó là thứ bảo vệ bạn 2 năm sau khi model đó có vấn đề và ai đó hỏi "tại sao anh deploy cái này?"

---

### Pitfalls phổ biến

**Define success criteria sau khi thấy kết quả.** Đây là dạng p-hacking trong credit modeling. "Model mới có approval rate cao hơn 2%, vậy ta dùng approval rate làm primary metric." Không. Primary metric phải được định nghĩa trước khi split.

**Test window quá ngắn.** 30 ngày không phải C/C — đó là smoke test. Credit outcome cần thời gian để trưởng thành.

**Không document assumptions.** Sau 6 tháng, không ai nhớ tại sao split là 95/5 thay vì 90/10, tại sao dùng DPD30 thay vì DPD60. Document everything.

**Celebrate uplift mà bỏ qua cost.** Challenger có Gini cao hơn 2pt nhưng approval rate thấp hơn 3%. Tùy vào margin của ngân hàng, revenue loss từ 3% approval rate có thể outweigh benefit của 2pt Gini. Luôn tính full business case.

---

### Takeaway

Champion-Challenger không phải best practice tùy chọn cho các team nào muốn "làm kỹ." Nó là **yêu cầu governance** cho bất kỳ ngân hàng nào có risk committee và model validation function.

Nếu bạn không có C/C, bạn không có bằng chứng — bạn chỉ có niềm tin. Và niềm tin không phải là thứ risk committee chấp nhận khi NPL tăng và ai đó hỏi "tại sao anh deploy model đó?"

---

## EN

### At a Glance

Champion-Challenger (C/C) is the framework for testing a new model on real production traffic at a controlled scale, over a long enough window to collect genuine outcomes. Champion = current deployed model. Challenger = candidate replacement. The winner is determined by evidence, not by backtest confidence.

---

### Why Backtest Isn't Enough

You've trained a new model. OOT AUC improved from 0.72 to 0.75. You present this to the risk committee and propose deployment.

They ask: "Your OOT is six-month-old data. Is today's applicant population the same? Has policy changed? If the new model has a lower approval rate, what's the revenue impact?"

These aren't difficult questions — they're the right questions. Backtesting answers "this model performed well historically." C/C answers "this model is performing well right now, on real customers, under current policy."

---

### The Framework

**Step 1 — Define success criteria before the test begins.** Write down explicitly: "Challenger wins if... Gini on live traffic exceeds Champion by ≥ 2 points, approval rate doesn't drop by more than 1%, and DPD30 rate in the first 3 months isn't worse than Champion." Lock this before looking at any results.

**Step 2 — Traffic split.** Typical splits: 90/10 for high-volume portfolios (>5,000 apps/month), 95/5 for lower volumes. The split must be random and stratified — not by channel, region, or loan officer, which would introduce confounding.

**Step 3 — Outcome window.** Credit outcomes take time to materialise: DPD30 needs 1 month, DPD90 needs 3 months, charge-off rates need 6–12 months. Don't make decisions in week three because "it looks good." Patience is the most important discipline in C/C.

**Step 4 — Decision framework:**

| Result | Action |
|---|---|
| Challenger clearly wins (all criteria met) | Promote Challenger 100%, archive Champion |
| Challenger narrowly wins (most criteria met) | Increase Challenger traffic, extend window |
| Mixed signals | Keep Champion, deep-dive into underperforming segments |
| Challenger loses (any critical criterion fails) | Discard, conduct post-mortem |

---

### Real-World Edge Cases

**Seasonality.** A C/C run over a Lunar New Year period captures a fundamentally different applicant profile. Either run long enough to cover at least one seasonal cycle, or document the limitation explicitly.

**Policy changes mid-test.** If risk appetite shifts during the test window, Champion and Challenger are no longer competing on equal terms. Lock policy for the duration, or restart.

**Statistical significance.** A 95/5 split with 500 applications per month means 25 Challenger applications monthly. After 3 months: 75 data points. You cannot draw conclusions from 75 applications. Calculate required sample size before committing to a split ratio.

---

### The Governance Value

C/C isn't purely technical — it's the language of risk governance.

"The new model performed better by algorithm" doesn't go into a risk committee resolution. "The Challenger model demonstrated a 3.2pt Gini improvement and 0.8pt lower DPD30 rate across 2,400 live applications over 4 months, with p < 0.05 statistical significance" does.

The second version creates an audit trail: who approved what, when, and on what evidence. That's what protects you two years later when someone asks "why was this model deployed?"

---

### Key Pitfalls

- **Defining success criteria after seeing results.** This is p-hacking in credit modeling.
- **Cutting the test short.** 30 days is a smoke test, not a C/C. Credit outcomes need time to mature.
- **Ignoring business cost of uplift.** A 2pt Gini improvement with a 3% approval rate drop may not be a net positive depending on portfolio margins.
- **Not documenting assumptions.** Six months later, no one remembers why the split was 95/5 or why DPD30 was chosen over DPD60. Write it down.

---

### Takeaway

If you don't have Champion-Challenger, you don't have evidence — you have belief. And belief is not what a risk committee accepts when NPL rises and someone asks "why did you deploy that model?"
