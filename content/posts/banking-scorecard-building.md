---
title: "Scorecard tín dụng: Tại sao ngân hàng vẫn dùng mô hình từ thập niên 80?"
date: "2026-04-22"
excerpt: "XGBoost chính xác hơn, nhưng regulator hỏi 'tại sao từ chối khách này?' — scorecard là câu trả lời duy nhất mà ngân hàng có thể đưa ra."
category: banking
layout: case-study
kpis:
  - labelVi: "Lý do tồn tại"
    labelEn: "Why it exists"
    value: "Interpretability"
  - labelVi: "Nền tảng kỹ thuật"
    labelEn: "Technical base"
    value: "WOE + LogReg"
  - labelVi: "Đơn vị đầu ra"
    labelEn: "Output unit"
    value: "Điểm (Points)"
  - labelVi: "Quy tắc calibration"
    labelEn: "Scaling rule"
    value: "PDO"
---

## VI

### Tóm tắt

Scorecard tín dụng vẫn tồn tại năm 2026 không phải vì nó tốt nhất về accuracy — XGBoost hoặc LightGBM đều cho AUC cao hơn. Scorecard tồn tại vì nó là **mô hình duy nhất có thể giải thích từng quyết định** với regulator, với khách hàng, và với chính risk committee của ngân hàng. Bài này đi từ đầu đến cuối: WOE binning → Logistic Regression → chuyển đổi sang điểm → validate → deploy.

---

### Câu hỏi khởi đầu: Bạn bị từ chối vay. Bạn hỏi tại sao?

Hãy tưởng tượng tình huống: khách hàng nộp đơn vay, bị từ chối, và hỏi "vì sao tôi không được duyệt?" Ngân hàng trả lời "thuật toán quyết định." Câu đó có ổn không?

Ở hầu hết thị trường, **không ổn**. ECOA (Equal Credit Opportunity Act) ở Mỹ, hay các quy định Basel tương tự ở châu Á, yêu cầu ngân hàng phải cung cấp **adverse action notice** — lý do cụ thể tại sao bị từ chối. "Thu nhập không đủ" là lý do. "Điểm ML thấp hơn threshold" không phải lý do hợp lệ cho regulator.

Scorecard giải quyết vấn đề này: mỗi biến đóng góp một số điểm, cộng lại ra điểm tổng, điểm thấp → từ chối. Ngân hàng có thể nói "bạn bị từ chối vì thu nhập thấp hơn ngưỡng và lịch sử quá hạn tháng trước" — những thứ *có thể đọc được* từ bảng điểm.

---

### Scorecard là gì — giải thích bằng bảng điểm học sinh

Hãy nghĩ về bảng chấm điểm học sinh: mỗi môn cho điểm, cộng lại ra điểm tổng kết. Scorecard tín dụng hoạt động y hệt:

| Biến | Bin (nhóm) | Điểm |
|---|---|---|
| **Thu nhập** | 0 – 5 triệu/tháng | −25 |
| | 5 – 15 triệu/tháng | +10 |
| | > 15 triệu/tháng | +35 |
| **Lịch sử quá hạn** | Không quá hạn | +20 |
| | Quá hạn 1–30 ngày | −10 |
| | Quá hạn > 30 ngày | −40 |
| **Thâm niên công việc** | < 6 tháng | −15 |
| | 6 – 24 tháng | +5 |
| | > 24 tháng | +20 |

**Khách A** — Thu nhập 8tr + không quá hạn + 3 năm thâm niên:
`10 + 20 + 20 = 50 điểm → Approve`

**Khách B** — Thu nhập 3tr + quá hạn tháng trước + mới đi làm 4 tháng:
`−25 + (−10) + (−15) = −50 điểm → Decline`

Và khi Khách B hỏi tại sao: "Thu nhập thấp hơn ngưỡng 5tr/tháng, có ghi nhận quá hạn trong 30 ngày gần đây." Rõ ràng, actionable, defensible.

---

### 5 bước xây một scorecard

#### Bước 1: WOE binning cho từng biến

Mỗi biến liên tục (thu nhập, tuổi, thời gian tại job) cần được phân nhóm và mã hóa bằng WOE (Weight of Evidence). WOE đo "nhóm này good/bad ratio so với toàn bộ tập huấn luyện là như thế nào."

:::note[Cross-link]
Xem chi tiết WOE và IV tại bài **WOE và IV: Nghệ thuật gạn đục khơi trong**.
:::

Điều quan trọng ở bước này: **monotonicity** — WOE của thu nhập nên tăng đều theo thu nhập (người thu nhập cao → ít rủi ro hơn). Nếu không monotone, cần merge bins hoặc review logic nghiệp vụ.

#### Bước 2: Logistic Regression với WOE-encoded features

Sau khi có WOE, chạy Logistic Regression với WOE values làm input. Tại sao Logistic Regression mà không phải mô hình phức tạp hơn?

- Hệ số β (coefficient) của từng biến có thể dịch trực tiếp sang điểm
- Tuyến tính → interpretable hoàn toàn
- Regularization (L1/L2) để tránh overfitting với ít features

Sau khi train, ta có: `log-odds = β₀ + β₁·WOE(income) + β₂·WOE(dpd) + β₃·WOE(tenure) + ...`

#### Bước 3: Chuyển đổi coefficient sang điểm — PDO

**PDO (Points to Double Odds)** là quy ước ngành ngân hàng: "cứ tăng thêm X điểm, odds good/bad tăng gấp đôi."

PDO thông dụng nhất là **20 điểm**, base score **600** tại odds 1:1. Nghĩa là:
- Score 600 = odds good:bad là 1:1 (50% good)
- Score 620 = odds gấp đôi (67% good)
- Score 640 = odds gấp 4 lần (80% good)
- Score 580 = odds nửa (33% good)

Công thức chuyển đổi từ coefficient sang điểm cho từng bin:

```
Points_bin = −(β_var × WOE_bin + β₀/n_vars) × Factor + Offset
```

Trong đó `Factor = PDO / ln(2)` và `Offset` được tính để base score đạt đúng odds mong muốn.

Thực tế: thư viện như `scorecardpy` (Python) hoặc `scorecard` (R) làm toàn bộ bước này tự động. Điều quan trọng là **hiểu PDO** để điều chỉnh khi business thay đổi khẩu vị rủi ro.

#### Bước 4: Validate trên OOT

Sau khi có scorecard, **không** validate trên cùng tập train hay test thông thường. Dùng **OOT (Out-of-Time)** — dữ liệu từ period *sau* period training.

Lý do: credit model suy giảm theo thời gian. Khách hàng 2024 khác 2022. OOT trên 3–6 tháng gần nhất mới reflect được model hoạt động ra sao trong môi trường thực.

Metrics cần check:
- **Gini ≥ 35%** trên OOT — nếu thấp hơn nhiều so với train, có thể overfit
- **KS ≥ 30** — phân biệt good/bad đủ rõ
- **PSI < 0.10** giữa train và OOT population — nếu cao, sample definition có vấn đề

:::note[Cross-link]
Xem chi tiết Gini, KS, PSI tại bài **Gini, KS, PSI: Ba câu hỏi mà mọi model credit risk cần trả lời**.
:::

#### Bước 5: Set cutoff và bảng scorecard cuối

Cutoff không phải là điểm "tốt nhất" từ thuần toán học — nó là **quyết định kinh doanh**:

- Approval rate target (ví dụ: 60%)
- Risk appetite (NPL tối đa chấp nhận được)
- Vintage analysis xem score band nào có delinquency rate như thế nào

Thông thường có 3 zone: Approve (điểm cao) / Review (điểm trung) / Decline (điểm thấp). Review zone cần underwriter quyết định thủ công.

---

### Code thực tế: Xây scorecard end-to-end với Python

```python
import scorecardpy as sc
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

# Bước 1: WOE binning
# monotonic_binning=True enforce xu hướng đơn điệu (thu nhập cao → WOE cao)
bins = sc.woebin(
    train_df, y='bad_flag',
    x=['monthly_income', 'dpd_max_6m', 'job_tenure_months'],
    bin_num_limit=6,
    # monotonic_binning=True  # bật khi cần enforce
)

# Kiểm tra WOE plot trước khi đi tiếp
sc.woebin_plot(bins['monthly_income'])

# Bước 2: Transform — LUÔN dùng bins từ train, không refit trên test
train_woe = sc.woebin_ply(train_df, bins)
oot_woe   = sc.woebin_ply(oot_df,   bins)  # OOT validation set

feature_cols = [c for c in train_woe.columns if c.endswith('_woe')]

# Bước 3: Logistic Regression với regularization
lr = LogisticRegression(C=0.1, solver='lbfgs', max_iter=500, random_state=42)
lr.fit(train_woe[feature_cols], train_woe['bad_flag'])

# Bước 4: Chuyển về điểm — PDO=20, base=600 tại odds 1:50 (2% bad rate)
card = sc.scorecard(
    bins, lr, feature_cols,
    points0=600,       # base score tại odds0
    odds0=1/50,        # odds bad:good tại base score (1 bad per 50 goods)
    pdo=20             # tăng 20 điểm → odds gấp đôi
)

# Gán điểm cho từng applicant
train_score = sc.scorecard_ply(train_df, card, print_step=0)
oot_score   = sc.scorecard_ply(oot_df,   card, print_step=0)

# Bước 5: Validate
def gini(y_true, y_score):
    return 2 * roc_auc_score(y_true, -y_score) - 1  # âm vì score cao = good

print(f"Train Gini : {gini(train_df['bad_flag'], train_score['score']):.3f}")
print(f"OOT   Gini : {gini(oot_df['bad_flag'],   oot_score['score']):.3f}")
# Nếu OOT Gini thấp hơn Train > 5pt → có thể overfit, review biến
```

### Tại sao không dùng XGBoost thay scorecard?

Câu trả lời thực: nhiều ngân hàng **dùng cả hai**.

| Bài toán | Model phù hợp |
|---|---|
| Final approve/decline (regulated) | Scorecard |
| Pre-screening, tier phân loại | XGBoost / LightGBM |
| Fraud detection | XGBoost + rules |
| Portfolio analytics, pricing | Bất kỳ model nào |

XGBoost tốt hơn về AUC — đúng. Nhưng khi regulator yêu cầu "giải thích từng ca từ chối trong 5 năm qua," bạn cần một bảng điểm tĩnh, không phải 300 cây quyết định.

SHAP values giúp interpret XGBoost, nhưng vẫn là *post-hoc explanation*, không phải *built-in explainability*. Scorecard là built-in — không cần giải thích thêm.

---

### Pitfalls phổ biến

**Quá nhiều biến → overfitting.** Scorecard production thường chỉ có 8–15 biến. Resist the urge to add everything just because IV is positive.

**Không lock binning table.** WOE bins được tính trên training data. Khi deploy, phải dùng **đúng bảng bins đó** — không recalculate trên production data. Nếu không, scorecard sẽ drift theo population.

**PDO calibrate trên tập cũ.** Nếu population thay đổi nhiều (ví dụ: mở rộng sang segment mới), PDO cũ không còn đúng nữa. Calibration check định kỳ là cần thiết.

**Bỏ qua monotonicity.** Một scorecard mà thu nhập cao hơn lại cho điểm thấp hơn sẽ không qua được risk committee review — và họ đúng khi reject nó.

---

### Takeaway

Scorecard không lỗi thời. Nó là **ngôn ngữ chung** mà data scientist, risk officer, underwriter, regulator, và đôi khi cả khách hàng đều có thể đọc được.

Khi bạn xây một scorecard tốt, bạn không chỉ build một model — bạn build một **hợp đồng giải trình** giữa ngân hàng và tất cả những bên liên quan. Đó là lý do nó tồn tại từ thập niên 80 và sẽ còn tồn tại lâu hơn nhiều.

---

## EN

### At a Glance

Credit scorecards still dominate regulated lending in 2026 — not because they're the most accurate, but because they're the only model that can explain every individual decision to a regulator, a customer, or a risk committee. This post walks through the full build: WOE binning → Logistic Regression → point scaling → OOT validation → cutoff setting.

---

### The Compliance Problem XGBoost Can't Solve

When a customer is declined and asks "why?", the answer "the algorithm decided" doesn't fly with regulators. ECOA (US), Basel guidelines, and similar frameworks across Asia require **adverse action notices** — specific, human-readable reasons.

A scorecard delivers this naturally: each variable contributes a fixed number of points, they add up to a total score, and the score determines the decision. "Declined due to income below threshold and recent delinquency record" is a valid adverse action reason. "Score fell below cutoff" is not, if you can't trace *why* the score is what it is.

---

### What a Scorecard Looks Like

Think of it as a student report card: each subject gets a grade, grades add up to a final score.

| Variable | Bin | Points |
|---|---|---|
| **Monthly income** | 0 – 5M VND | −25 |
| | 5 – 15M VND | +10 |
| | > 15M VND | +35 |
| **Delinquency history** | No overdue | +20 |
| | 1–30 days overdue | −10 |
| | > 30 days overdue | −40 |
| **Job tenure** | < 6 months | −15 |
| | 6 – 24 months | +5 |
| | > 24 months | +20 |

**Applicant A** (8M income, no overdue, 3yr tenure): `10 + 20 + 20 = 50 → Approve`

**Applicant B** (3M income, recent overdue, 4mo tenure): `−25 + (−10) + (−15) = −50 → Decline`

When Applicant B asks why: "Income below the 5M/month threshold; delinquency recorded within the past 30 days." Clear, specific, defensible.

---

### The 5-Step Build Process

**Step 1 — WOE binning:** Group continuous variables into discrete bins; encode each bin with its Weight of Evidence relative to the full training population. Enforce monotonicity — higher income should consistently mean lower risk.

**Step 2 — Logistic Regression on WOE features:** Train LR using WOE-encoded inputs. The β coefficients translate directly to scorecard points. L1/L2 regularization keeps the variable count manageable (target 8–15 variables).

**Step 3 — PDO scaling:** Convert coefficients to integer points using the **Points to Double Odds** rule. Industry standard: PDO = 20 points, base score = 600 at 1:1 odds. Every 20-point increase doubles the good:bad odds. Libraries like `scorecardpy` automate this, but understanding PDO matters when business risk appetite changes.

**Step 4 — OOT validation:** Validate on Out-of-Time data — the most recent 3–6 months *not* used in training. Target: Gini ≥ 35%, KS ≥ 30, PSI < 0.10 between train and OOT population.

**Step 5 — Cutoff setting:** Cutoffs are business decisions, not purely mathematical. Set Approve / Review / Decline zones based on approval rate targets, NPL tolerance, and vintage delinquency rates by score band.

### Code Reference — End-to-End Scorecard Build

```python
import scorecardpy as sc
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

# Step 1 — WOE binning (scorecardpy enforces monotonicity optionally)
bins = sc.woebin(
    train_df, y='bad_flag',
    x=['monthly_income', 'dpd_max_6m', 'job_tenure_months'],
    bin_num_limit=6,
)

# Step 2 — Transform: always use bins from training, never refit
train_woe = sc.woebin_ply(train_df, bins)
oot_woe   = sc.woebin_ply(oot_df,   bins)

feature_cols = [c for c in train_woe.columns if c.endswith('_woe')]

# Step 3 — Logistic Regression with L2 regularization
lr = LogisticRegression(C=0.1, solver='lbfgs', max_iter=500, random_state=42)
lr.fit(train_woe[feature_cols], train_woe['bad_flag'])

# Step 4 — Convert to scorecard points (PDO=20, base=600, odds0=1:50)
card = sc.scorecard(bins, lr, feature_cols, points0=600, odds0=1/50, pdo=20)

# Step 5 — Score and validate
train_s = sc.scorecard_ply(train_df, card, print_step=0)['score']
oot_s   = sc.scorecard_ply(oot_df,   card, print_step=0)['score']

gini = lambda y, s: 2 * roc_auc_score(y, -s) - 1  # higher score = lower risk
print(f"Train Gini : {gini(train_df.bad_flag, train_s):.3f}")
print(f"OOT   Gini : {gini(oot_df.bad_flag,   oot_s):.3f}")
# Gap > 5pt between Train and OOT → overfit; review variable selection

# For optbinning (stronger monotonicity guarantees, Basel-aligned):
# from optbinning import Scorecard — see optbinning docs
```

---

### When to Use Scorecard vs XGBoost

Both models serve different roles in a credit operation:

| Use case | Model |
|---|---|
| Regulated final approve/decline | Scorecard |
| Pre-screening, tiering | XGBoost / LightGBM |
| Fraud detection | XGBoost + rules |
| Portfolio analytics | Any model |

SHAP values help explain XGBoost predictions, but that's *post-hoc* — you generate an explanation after the fact. A scorecard is *inherently* explainable — no additional tooling needed, no black-box step in the pipeline.

---

### Key Pitfalls

- **Too many variables** → overfit on training, poor OOT performance. 8–15 variables is usually enough.
- **Unfrozen binning table** → if WOE bins are recalculated on production data, the scorecard drifts. Lock the bins at deployment time.
- **Stale PDO calibration** → when the population shifts significantly, recalibrate. A PDO tuned on 2022 data may misprice risk on 2025 customers.
- **Non-monotone WOE** → a scorecard where higher income yields lower points will not survive risk committee review — and shouldn't.

---

### Takeaway

A good scorecard is not just a model — it's a **contract of accountability** between the data team, the risk function, the regulator, and the customer. That's why it's been around since the 1980s, and why every serious credit operation still has one at its core.

---

**References**
- Siddiqi, N. (2006). *Credit Risk Scorecards: Developing and Implementing Intelligent Credit Scoring*. John Wiley & Sons. — The definitive practitioner reference; Chapters 5–7 cover WOE binning and PDO scaling in detail.
- Anderson, R. (2007). *The Credit Scoring Toolkit: Theory and Practice for Retail Credit Risk Management*. Oxford University Press. — Comprehensive treatment of scorecard calibration, validation, and deployment.
- `scorecardpy` — Python library: [github.com/ShichenLiu/scorecardpy](https://github.com/ShichenLiu/scorecardpy)
- `optbinning` — Scorecard class docs: [gnpalencia.org/optbinning/tutorials/tutorial_scorecard.html](https://gnpalencia.org/optbinning/tutorials/tutorial_scorecard.html)
- Consumer Financial Protection Bureau (CFPB). *Adverse Action Notice Requirements Under the ECOA and FCRA*. [consumerfinance.gov](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/) — Regulatory basis for why scorecards remain required in consumer lending.
